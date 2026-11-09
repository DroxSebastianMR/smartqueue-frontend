"""Transform the real Microsoft Azure Functions 2021 trace into 10-second ML windows.

The source contains real invocation end timestamps and durations, but no queue size,
admission limit, or HTTP error fields. This processor never invents those missing
variables: the resulting artifact is an external demand/latency model with four
observed features. CineTrux's measured HTTP pilot supplies the remaining operational
features for the future hybrid dataset.
"""

import argparse
import hashlib
import json
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


SOURCE_URL = "https://github.com/Azure/AzurePublicDataset/raw/master/data/AzureFunctionsInvocationTraceForTwoWeeksJan2021.rar"
SOURCE_NAME = "Microsoft Azure Functions Invocation Trace 2021"
SOURCE_LICENSE = "CC-BY Attribution License"
OBSERVED_FEATURES = (
    "arrival_rate",
    "arrival_trend",
    "latency_p95_ms",
    "completion_rate",
)


class WindowStats:
    def __init__(self) -> None:
        self.count = 0
        self.durations_ms: list[float] = []

    def add(self, duration_ms: float) -> None:
        self.count += 1
        self.durations_ms.append(duration_ms)


def selected_functions(source: Path, top_functions: int, chunksize: int) -> set[tuple[str, str]]:
    counts: dict[tuple[str, str], int] = defaultdict(int)
    for chunk in pd.read_csv(source, usecols=["app", "func"], chunksize=chunksize):
        grouped = chunk.value_counts(["app", "func"])
        for key, count in grouped.items():
            counts[(str(key[0]), str(key[1]))] += int(count)
    return {key for key, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:top_functions]}


def build_windows(source: Path, functions: set[tuple[str, str]], window_seconds: int, chunksize: int) -> tuple[dict[tuple[str, str, int], WindowStats], int, int]:
    windows: dict[tuple[str, str, int], WindowStats] = {}
    accepted = rejected = 0
    for chunk in pd.read_csv(source, usecols=["app", "func", "end_timestamp", "duration"], chunksize=chunksize):
        chunk["end_timestamp"] = pd.to_numeric(chunk["end_timestamp"], errors="coerce")
        chunk["duration"] = pd.to_numeric(chunk["duration"], errors="coerce")
        chunk = chunk.dropna(subset=["end_timestamp", "duration"])
        chunk = chunk[(chunk["end_timestamp"] >= 0) & (chunk["duration"] >= 0)]
        rejected += len(chunk.index) - int(chunk["app"].notna().sum())
        for row in chunk.itertuples(index=False):
            key = (str(row.app), str(row.func))
            if key not in functions:
                continue
            window_end = (int(float(row.end_timestamp) // window_seconds) + 1) * window_seconds
            stats = windows.setdefault((key[0], key[1], window_end), WindowStats())
            stats.add(float(row.duration) * 1_000)
            accepted += 1
    return windows, accepted, rejected


def materialize(windows: dict[tuple[str, str, int], WindowStats], window_seconds: int, min_samples: int, latency_threshold_ms: float, horizon_windows: int) -> tuple[pd.DataFrame, dict[str, int]]:
    epoch = datetime(2021, 1, 31, tzinfo=UTC)
    rows = []
    for (app, func, window_end), stats in windows.items():
        durations = np.asarray(stats.durations_ms, dtype=float)
        rows.append({
            "run_id": f"azure-2021:{app}:{func}",
            "window_end_seconds": window_end,
            "window_end": (epoch + timedelta(seconds=window_end)).isoformat(),
            "arrival_rate": stats.count / window_seconds,
            "latency_p95_ms": float(np.percentile(durations, 95)),
            "completion_rate": stats.count / window_seconds,
            "sample_count": stats.count,
            "evaluable": stats.count >= min_samples,
            "source": "AZURE_FUNCTIONS_2021_REAL",
            "source_url": SOURCE_URL,
        })
    frame = pd.DataFrame(rows).sort_values(["run_id", "window_end_seconds"]).reset_index(drop=True)
    frame["arrival_trend"] = frame.groupby("run_id")["arrival_rate"].diff().fillna(0.0)
    labeled: list[dict] = []
    exclusions: dict[str, int] = defaultdict(int)
    for _, group in frame.groupby("run_id", sort=False):
        group = group.reset_index(drop=True)
        for index, row in group.iterrows():
            future = group.iloc[index + 1:index + 1 + horizon_windows]
            if not bool(row.evaluable):
                exclusions["INSUFFICIENT_INVOCATIONS"] += 1
                continue
            if len(future) < horizon_windows:
                exclusions["INCOMPLETE_FUTURE_HORIZON"] += 1
                continue
            expected = row.window_end_seconds + np.arange(1, horizon_windows + 1) * window_seconds
            if not np.array_equal(future.window_end_seconds.to_numpy(), expected):
                exclusions["NON_CONTIGUOUS_WINDOWS"] += 1
                continue
            if not future.evaluable.eq(True).all():
                exclusions["FUTURE_NOT_EVALUABLE"] += 1
                continue
            item = row.to_dict()
            item["saturation_label"] = int((future.latency_p95_ms >= latency_threshold_ms).any())
            item["label_horizon_seconds"] = horizon_windows * window_seconds
            item["label_latency_threshold_ms"] = latency_threshold_ms
            labeled.append(item)
    return pd.DataFrame(labeled), dict(exclusions)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="data/processed/azure-functions-2021")
    parser.add_argument("--top-functions", type=int, default=100)
    parser.add_argument("--window-seconds", type=int, default=10)
    parser.add_argument("--min-samples", type=int, default=5)
    parser.add_argument("--latency-threshold-ms", type=float, default=1_000)
    parser.add_argument("--horizon-windows", type=int, default=3)
    parser.add_argument("--chunksize", type=int, default=250_000)
    args = parser.parse_args()
    if args.top_functions < 1 or args.window_seconds < 1 or args.min_samples < 1 or args.horizon_windows < 1:
        raise ValueError("top-functions, window-seconds, min-samples and horizon-windows must be positive")
    source = Path(args.input)
    if not source.exists():
        raise FileNotFoundError(source)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    functions = selected_functions(source, args.top_functions, args.chunksize)
    windows, accepted, rejected = build_windows(source, functions, args.window_seconds, args.chunksize)
    dataset, exclusions = materialize(windows, args.window_seconds, args.min_samples, args.latency_threshold_ms, args.horizon_windows)
    if dataset.empty or dataset.saturation_label.nunique() != 2:
        raise ValueError("The selected real-trace subset did not produce both target classes; adjust threshold or top-functions")
    dataset_path = output / "azure_windows_labeled.csv"
    dataset.to_csv(dataset_path, index=False)
    report = {
        "source_name": SOURCE_NAME,
        "source_url": SOURCE_URL,
        "license": SOURCE_LICENSE,
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "raw_file": str(source),
        "selected_functions": len(functions),
        "accepted_invocations": accepted,
        "rejected_rows": rejected,
        "output_rows": len(dataset),
        "features": list(OBSERVED_FEATURES),
        "missing_domain_features": ["queue_length", "active_buyers", "admission_limit", "error_rate"],
        "window_seconds": args.window_seconds,
        "label_policy": {"future_windows": args.horizon_windows, "latency_threshold_ms": args.latency_threshold_ms},
        "exclusions": exclusions,
        "class_distribution": dataset.saturation_label.value_counts().sort_index().to_dict(),
        "limitations": "Real production serverless data, not cinema transactions. Missing queue/control/error variables are intentionally not fabricated.",
    }
    (output / "quality_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

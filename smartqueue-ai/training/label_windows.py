import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd

from app.domain.features import FEATURE_NAMES


def label_windows(
    frame: pd.DataFrame,
    latency_threshold_ms: float,
    error_threshold: float,
    horizon_windows: int = 3,
) -> tuple[pd.DataFrame, dict]:
    required = set(FEATURE_NAMES) | {"run_id", "window_end", "evaluable"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")
    work = frame.copy()
    work["window_end"] = pd.to_datetime(work["window_end"], utc=True)
    work = work.sort_values(["run_id", "window_end"]).drop_duplicates(
        ["run_id", "window_end"], keep="last"
    )
    rows = []
    exclusions: dict[str, int] = {}
    for _, group in work.groupby("run_id", sort=False):
        group = group.reset_index(drop=True)
        for index, row in group.iterrows():
            reason = None
            future = group.iloc[index + 1 : index + 1 + horizon_windows]
            if not bool(row["evaluable"]):
                reason = str(row.get("exclusion_reason") or "NOT_EVALUABLE")
            elif len(future) < horizon_windows:
                reason = "INCOMPLETE_FUTURE_HORIZON"
            elif any(
                (future.iloc[offset]["window_end"] - row["window_end"]).total_seconds()
                != (offset + 1) * 10
                for offset in range(horizon_windows)
            ):
                reason = "NON_CONTIGUOUS_WINDOWS"
            if reason:
                exclusions[reason] = exclusions.get(reason, 0) + 1
                continue
            current = row.to_dict()
            current["saturation_label"] = int(
                (future["latency_p95_ms"] >= latency_threshold_ms).any()
                or (future["error_rate"] >= error_threshold).any()
            )
            rows.append(current)
    labeled = pd.DataFrame(rows)
    report = {
        "generated_at": datetime.now(UTC).isoformat(),
        "input_rows": len(frame),
        "output_rows": len(labeled),
        "excluded_rows": len(frame) - len(labeled),
        "exclusions": exclusions,
        "nulls": labeled.isna().sum().to_dict() if not labeled.empty else {},
        "duplicates": int(frame.duplicated(["run_id", "window_end"]).sum()),
        "class_distribution": (
            labeled["saturation_label"].value_counts().sort_index().to_dict()
            if not labeled.empty
            else {}
        ),
        "scenario_distribution": (
            labeled["scenario"].value_counts().to_dict()
            if "scenario" in labeled and not labeled.empty
            else {}
        ),
        "label_policy": {
            "future_windows": horizon_windows,
            "latency_threshold_ms": latency_threshold_ms,
            "error_threshold": error_threshold,
        },
    }
    return labeled, report


def main() -> None:
    parser = argparse.ArgumentParser(description="Create leakage-safe saturation labels")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--latency-threshold-ms", type=float, default=1_000)
    parser.add_argument("--error-threshold", type=float, default=0.05)
    args = parser.parse_args()
    frame = pd.read_csv(args.input)
    labeled, report = label_windows(
        frame, args.latency_threshold_ms, args.error_threshold
    )
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    labeled.to_csv(output, index=False)
    report_path = output.with_suffix(".quality.json")
    report_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")


if __name__ == "__main__":
    main()

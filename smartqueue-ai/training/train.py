import argparse
import hashlib
import json
import time
from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    average_precision_score,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.domain.features import FEATURE_NAMES


def build_pipeline(kind: str, neighbors: int = 7) -> Pipeline:
    if kind == "dummy":
        model = DummyClassifier(strategy="prior")
    elif kind == "logistic":
        model = LogisticRegression(class_weight="balanced", max_iter=2_000, random_state=42)
    else:
        model = KNeighborsClassifier(n_neighbors=neighbors, weights="distance")
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", model),
        ]
    )


def grouped_split(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if frame["run_id"].nunique() < 3:
        raise ValueError("At least three distinct run_id values are required")
    for attempt in range(100):
        outer = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42 + attempt)
        development_idx, test_idx = next(outer.split(frame, groups=frame["run_id"]))
        development, test = frame.iloc[development_idx], frame.iloc[test_idx]
        inner = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=142 + attempt)
        train_idx, validation_idx = next(
            inner.split(development, groups=development["run_id"])
        )
        train = development.iloc[train_idx]
        validation = development.iloc[validation_idx]
        if "saturation_label" in frame and any(
            split["saturation_label"].nunique() < 2 for split in (train, validation, test)
        ):
            continue
        if set(train.run_id) & set(validation.run_id) or set(development.run_id) & set(
            test.run_id
        ):
            raise AssertionError("Grouped split leaked a run across partitions")
        return train, validation, test
    raise ValueError("Could not create grouped train/validation/test partitions with both classes")


def select_threshold(labels, probability, minimum_precision: float) -> tuple[float, dict]:
    candidates = []
    for threshold in [value / 100 for value in range(20, 81)]:
        prediction = (probability >= threshold).astype(int)
        candidates.append(
            {
                "threshold": threshold,
                "recall": recall_score(labels, prediction, zero_division=0),
                "precision": precision_score(labels, prediction, zero_division=0),
                "f1": f1_score(labels, prediction, zero_division=0),
            }
        )
    eligible = [item for item in candidates if item["precision"] >= minimum_precision]
    pool = eligible or candidates
    best = max(pool, key=lambda item: (item["recall"], item["f1"], item["precision"]))
    return best["threshold"], best


def score(pipeline, frame: pd.DataFrame, threshold: float) -> dict[str, float]:
    frame = frame.reset_index(drop=True)
    features = frame[list(FEATURE_NAMES)]
    labels = frame["saturation_label"]
    started = time.perf_counter()
    probability = pipeline.predict_proba(features)[:, 1]
    latency_ms = (time.perf_counter() - started) * 1_000 / max(len(frame), 1)
    prediction = (probability >= threshold).astype(int)
    per_run = [
        recall_score(group.saturation_label, prediction[group.index], zero_division=0)
        for _, group in frame.groupby("run_id")
    ]
    return {
        "recall": recall_score(labels, prediction, zero_division=0),
        "precision": precision_score(labels, prediction, zero_division=0),
        "f1": f1_score(labels, prediction, zero_division=0),
        "pr_auc": average_precision_score(labels, probability),
        "inference_ms_per_row": latency_ms,
        "run_recall_std": float(pd.Series(per_run).std(ddof=0)),
    }


def save_plots(labels, probability, prediction, output: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    from matplotlib import pyplot as plt

    ConfusionMatrixDisplay.from_predictions(labels, prediction, cmap="Blues")
    plt.tight_layout()
    plt.savefig(output / "confusion_matrix.png", dpi=160)
    plt.close()
    precision, recall, _ = precision_recall_curve(labels, probability)
    plt.plot(recall, precision)
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.tight_layout()
    plt.savefig(output / "pr_curve.png", dpi=160)
    plt.close()
    observed, predicted = calibration_curve(labels, probability, n_bins=8, strategy="quantile")
    plt.plot(predicted, observed, marker="o")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("Predicted risk")
    plt.ylabel("Observed frequency")
    plt.tight_layout()
    plt.savefig(output / "calibration_curve.png", dpi=160)
    plt.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Train and freeze the SmartQueue saturation model")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="artifacts")
    parser.add_argument("--minimum-precision", type=float, default=0.7)
    parser.add_argument("--latency-threshold-ms", type=float, default=1_000)
    parser.add_argument("--error-threshold", type=float, default=0.05)
    parser.add_argument("--dataset-version", default="unversioned")
    args = parser.parse_args()

    frame = pd.read_csv(args.input)
    required = set(FEATURE_NAMES) | {"run_id", "saturation_label"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")
    if frame["saturation_label"].nunique() != 2:
        raise ValueError("Training data must contain HEALTHY and SATURATION labels")
    train, validation, test = grouped_split(frame)
    candidates = {
        "dummy": build_pipeline("dummy"),
        "logistic": build_pipeline("logistic"),
        **{f"knn_k{k}": build_pipeline("knn", k) for k in (3, 5, 7, 9)},
    }
    validation_scores = {}
    thresholds = {}
    for name, pipeline in candidates.items():
        pipeline.fit(train[list(FEATURE_NAMES)], train["saturation_label"])
        probability = pipeline.predict_proba(validation[list(FEATURE_NAMES)])[:, 1]
        threshold, threshold_metrics = select_threshold(
            validation["saturation_label"], probability, args.minimum_precision
        )
        thresholds[name] = threshold
        validation_scores[name] = {
            **score(pipeline, validation, threshold),
            "threshold_selection": threshold_metrics,
        }
    eligible_models = [
        name
        for name in candidates
        if validation_scores[name]["precision"] >= args.minimum_precision
    ]
    winner = max(
        eligible_models or list(candidates),
        key=lambda name: (
            validation_scores[name]["recall"],
            validation_scores[name]["f1"],
            validation_scores[name]["pr_auc"],
            -validation_scores[name]["inference_ms_per_row"],
        ),
    )
    selected = candidates[winner]
    threshold = thresholds[winner]
    # Keep the exact fitted model for which the validation threshold was selected.
    test_probability = selected.predict_proba(test[list(FEATURE_NAMES)])[:, 1]
    test_prediction = (test_probability >= threshold).astype(int)
    test_metrics = score(selected, test.reset_index(drop=True), threshold)

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    save_plots(test["saturation_label"], test_probability, test_prediction, output)
    version = datetime.now(UTC).strftime("%Y%m%d-saturation-v1")
    report = {
        "selected_model": winner,
        "selected_threshold": threshold,
        "validation": validation_scores,
        "test": test_metrics,
        "split": {
            "strategy": "GroupShuffleSplit by run_id",
            "train_runs": sorted(map(str, train.run_id.unique())),
            "validation_runs": sorted(map(str, validation.run_id.unique())),
            "test_runs": sorted(map(str, test.run_id.unique())),
        },
    }
    metadata = {
        "model_version": version,
        "schema_version": "1.0",
        "features": list(FEATURE_NAMES),
        "window_seconds": 10,
        "horizon_seconds": 30,
        "latency_threshold_ms": args.latency_threshold_ms,
        "error_threshold": args.error_threshold,
        "selected_threshold": threshold,
        "metrics": test_metrics,
        "training_dataset_version": args.dataset_version,
        "dataset_sha256": hashlib.sha256(Path(args.input).read_bytes()).hexdigest(),
        "data_sources": sorted(frame['source'].unique().tolist()) if 'source' in frame else ['UNSPECIFIED'],
        "deployment_status": "EXPERIMENTAL_NOT_PRODUCTION_VALIDATED",
    }
    joblib.dump(selected, output / "saturation_pipeline.joblib")
    (output / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    (output / "evaluation_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, recall_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.domain.features import FEATURE_NAMES


def build_pipeline(kind: str, neighbors: int = 7) -> Pipeline:
    model = (
        LogisticRegression(class_weight="balanced", max_iter=2_000)
        if kind == "logistic"
        else KNeighborsClassifier(n_neighbors=neighbors, weights="distance")
    )
    return Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", model),
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="artifacts")
    args = parser.parse_args()

    frame = pd.read_csv(args.input)
    required = set(FEATURE_NAMES) | {"run_id", "saturation_label"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(splitter.split(frame, groups=frame["run_id"]))
    train, test = frame.iloc[train_idx], frame.iloc[test_idx]

    candidates = {
        "logistic": build_pipeline("logistic"),
        "knn": build_pipeline("knn"),
    }
    scores: dict[str, dict[str, float]] = {}
    best_name = ""
    best_score = -1.0
    for name, pipeline in candidates.items():
        pipeline.fit(train[list(FEATURE_NAMES)], train["saturation_label"])
        prediction = pipeline.predict(test[list(FEATURE_NAMES)])
        scores[name] = {
            "recall": recall_score(test["saturation_label"], prediction, zero_division=0),
            "f1": f1_score(test["saturation_label"], prediction, zero_division=0),
        }
        if scores[name]["f1"] > best_score:
            best_name, best_score = name, scores[name]["f1"]

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    joblib.dump(candidates[best_name], output / "saturation_pipeline.joblib")
    (output / "model_metadata.json").write_text(
        json.dumps(
            {
                "model_version": datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ"),
                "selected_model": best_name,
                "features": list(FEATURE_NAMES),
                "group_split": "run_id",
                "scores": scores,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

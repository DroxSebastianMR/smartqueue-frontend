import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.domain.features import FEATURE_NAMES, SaturationFeatures
from app.domain.prediction import RiskClass, SaturationPrediction


class ModelUnavailableError(RuntimeError):
    pass


class SklearnSaturationPredictor:
    def __init__(self, model_path: str, metadata_path: str, threshold: float):
        self._threshold = threshold
        self._pipeline = None
        self._model_version = "unavailable"
        self._features = FEATURE_NAMES
        self.data_sources = ['UNSPECIFIED']

        model_file = Path(model_path)
        metadata_file = Path(metadata_path)
        if model_file.exists():
            self._pipeline = joblib.load(model_file)
        if metadata_file.exists():
            metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
            if metadata.get("schema_version") != "1.0":
                raise ValueError("The model schema_version is not supported")
            stored_features = tuple(metadata.get("features", []))
            if stored_features and (
                not set(stored_features).issubset(FEATURE_NAMES)
                or len(stored_features) == 0
            ):
                raise ValueError("The model feature contract contains unsupported features")
            if stored_features:
                self._features = stored_features
            self._model_version = str(metadata.get("model_version", "unknown"))
            self.data_sources = metadata.get('data_sources', ['UNSPECIFIED'])
            self._threshold = float(metadata.get("selected_threshold", threshold))

    @property
    def available(self) -> bool:
        return self._pipeline is not None

    def predict(self, features: SaturationFeatures) -> SaturationPrediction:
        if self._pipeline is None:
            raise ModelUnavailableError("No trained model artifact is available")

        values = features.as_mapping()
        row = pd.DataFrame(
            np.asarray([[values[name] for name in self._features]], dtype=float),
            columns=self._features,
        )
        probability = float(self._pipeline.predict_proba(row)[0, 1])
        probability = min(1.0, max(0.0, probability))
        risk_class = RiskClass.SATURATION if probability >= self._threshold else RiskClass.HEALTHY
        return SaturationPrediction(
            risk_score=probability,
            risk_class=risk_class,
            horizon_seconds=30,
            model_version=self._model_version,
        )

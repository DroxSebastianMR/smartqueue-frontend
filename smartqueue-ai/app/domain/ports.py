from typing import Protocol

from app.domain.features import SaturationFeatures
from app.domain.prediction import SaturationPrediction


class SaturationPredictor(Protocol):
    def predict(self, features: SaturationFeatures) -> SaturationPrediction: ...

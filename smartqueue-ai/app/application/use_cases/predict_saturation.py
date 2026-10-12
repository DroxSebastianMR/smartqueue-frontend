from app.domain.features import SaturationFeatures
from app.domain.ports import SaturationPredictor
from app.domain.prediction import SaturationPrediction


class PredictSaturation:
    def __init__(self, predictor: SaturationPredictor):
        self._predictor = predictor

    def execute(self, features: SaturationFeatures) -> SaturationPrediction:
        return self._predictor.predict(features)

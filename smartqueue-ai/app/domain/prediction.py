from dataclasses import dataclass
from enum import StrEnum


class RiskClass(StrEnum):
    HEALTHY = "HEALTHY"
    SATURATION = "SATURATION"


@dataclass(frozen=True)
class SaturationPrediction:
    risk_score: float
    risk_class: RiskClass
    horizon_seconds: int
    model_version: str

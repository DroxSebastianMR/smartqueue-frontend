from dataclasses import dataclass

FEATURE_NAMES = (
    "arrival_rate",
    "arrival_trend",
    "queue_length",
    "active_buyers",
    "admission_limit",
    "latency_p95_ms",
    "error_rate",
    "completion_rate",
)


@dataclass(frozen=True)
class SaturationFeatures:
    arrival_rate: float
    arrival_trend: float
    queue_length: int
    active_buyers: int
    admission_limit: int
    latency_p95_ms: float
    error_rate: float
    completion_rate: float

    def as_row(self) -> list[float]:
        return [float(getattr(self, name)) for name in FEATURE_NAMES]

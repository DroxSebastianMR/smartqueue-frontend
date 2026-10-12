from app.domain.prediction import RiskClass, SaturationPrediction
from app.main import create_app


class FakePredictor:
    available = True

    def predict(self, _features):
        return SaturationPrediction(0.81, RiskClass.SATURATION, 30, "test-v1")


def valid_payload():
    return {
        "schema_version": "1.0",
        "window_end": "2026-10-11T15:00:00Z",
        "arrival_rate": 12,
        "arrival_trend": 3,
        "queue_length": 90,
        "active_buyers": 15,
        "admission_limit": 20,
        "latency_p95_ms": 850,
        "error_rate": 0.04,
        "completion_rate": 1.5,
    }


def test_predict_contract():
    client = create_app({"TESTING": True, "PREDICTOR": FakePredictor()}).test_client()
    response = client.post("/predict", json=valid_payload())
    assert response.status_code == 200
    assert response.get_json() == {
        "horizon_seconds": 30,
        "model_version": "test-v1",
        "risk_class": "SATURATION",
        "risk_score": 0.81,
    }


def test_rejects_out_of_range_error_rate():
    payload = valid_payload()
    payload["error_rate"] = 1.2
    client = create_app({"TESTING": True, "PREDICTOR": FakePredictor()}).test_client()
    response = client.post("/predict", json=payload)
    assert response.status_code == 400

from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from app.domain.features import SaturationFeatures
from app.infrastructure.sklearn_predictor import ModelUnavailableError

api = Blueprint("api", __name__)


def _number(
    payload: dict,
    name: str,
    minimum: float | None = None,
    maximum: float | None = None,
) -> float:
    value = payload.get(name)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric")
    parsed = float(value)
    if minimum is not None and parsed < minimum:
        raise ValueError(f"{name} must be greater than or equal to {minimum}")
    if maximum is not None and parsed > maximum:
        raise ValueError(f"{name} must be less than or equal to {maximum}")
    return parsed


@api.get("/health")
def health():
    predictor = current_app.config["predictor"]
    return jsonify(
        status="ok",
        service="smartqueue-ai",
        model_loaded=predictor.available,
    )


@api.post("/predict")
def predict():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(error="INVALID_JSON", message="A JSON object is required"), 400

    try:
        if payload.get("schema_version") != "1.0":
            raise ValueError("schema_version must be 1.0")
        datetime.fromisoformat(str(payload.get("window_end", "")).replace("Z", "+00:00"))
        feature_payload = payload.get("features")
        if not isinstance(feature_payload, dict):
            raise ValueError("features must be a JSON object")
        features = SaturationFeatures(
            arrival_rate=_number(feature_payload, "arrival_rate", 0),
            arrival_trend=_number(feature_payload, "arrival_trend"),
            queue_length=int(_number(feature_payload, "queue_length", 0)),
            active_buyers=int(_number(feature_payload, "active_buyers", 0)),
            admission_limit=int(_number(feature_payload, "admission_limit", 1)),
            latency_p95_ms=_number(feature_payload, "latency_p95_ms", 0),
            error_rate=_number(feature_payload, "error_rate", 0, 1),
            completion_rate=_number(feature_payload, "completion_rate", 0),
        )

        result = current_app.config["predict_use_case"].execute(features)
        return jsonify(
            risk_score=round(result.risk_score, 6),
            risk_class=result.risk_class.value,
            horizon_seconds=result.horizon_seconds,
            model_version=result.model_version,
            schema_version="1.0",
        )
    except ModelUnavailableError as error:
        return jsonify(error="MODEL_UNAVAILABLE", message=str(error)), 503
    except (TypeError, ValueError) as error:
        return jsonify(error="VALIDATION_ERROR", message=str(error)), 400

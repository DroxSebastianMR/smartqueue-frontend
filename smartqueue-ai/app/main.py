import os

from flask import Flask

from app.application.use_cases.predict_saturation import PredictSaturation
from app.infrastructure.sklearn_predictor import SklearnSaturationPredictor
from app.presentation.routes import api


def create_app(config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(
        MODEL_PATH=os.getenv("MODEL_PATH", "artifacts/saturation_pipeline.joblib"),
        MODEL_METADATA_PATH=os.getenv("MODEL_METADATA_PATH", "artifacts/model_metadata.json"),
        PREDICTION_THRESHOLD=float(os.getenv("PREDICTION_THRESHOLD", "0.65")),
    )
    if config:
        app.config.update(config)

    predictor = app.config.get("PREDICTOR") or SklearnSaturationPredictor(
        app.config["MODEL_PATH"],
        app.config["MODEL_METADATA_PATH"],
        app.config["PREDICTION_THRESHOLD"],
    )
    app.config["predictor"] = predictor
    app.config["predict_use_case"] = PredictSaturation(predictor)
    app.register_blueprint(api)
    return app


app = create_app()

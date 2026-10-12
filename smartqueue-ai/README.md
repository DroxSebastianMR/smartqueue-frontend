# SmartQueue AI

Servicio Flask para inferencia de saturación a 30 segundos y scripts de entrenamiento offline.

## Arquitectura

```text
app/
├── domain/          # variables, resultado y contrato del predictor
├── application/     # caso de uso PredictSaturation
├── infrastructure/  # carga segura del Pipeline joblib
└── presentation/    # rutas HTTP y validación JSON
training/             # dataset, entrenamiento y evaluación offline
tests/
```

Sin un artefacto entrenado, `/predict` responde `503 MODEL_UNAVAILABLE`; no inventa una predicción heurística. Entrena primero con `python training/train.py --input <dataset.csv>`.


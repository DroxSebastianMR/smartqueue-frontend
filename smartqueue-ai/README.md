# SmartQueue AI

Servicio Flask para inferencia de saturación a 30 segundos y scripts de entrenamiento offline.

## Arquitectura

```text
app/
├── domain/          # variables, resultado y contrato del predictor
├── application/     # caso de uso PredictSaturation
├── infrastructure/  # carga segura del Pipeline joblib
└── presentation/    # rutas HTTP y validación JSON
training/             # etiquetado sin leakage, entrenamiento y evaluación offline
simulation/           # generador HTTP reproducible por escenario, modo y semilla
tests/
```

Sin un artefacto entrenado, `/predict` responde `503 MODEL_UNAVAILABLE`; no inventa una predicción heurística.

## Flujo reproducible

```powershell
python training/label_windows.py --input data/windows-v1.csv --output data/saturation-v1.csv
python training/train.py --input data/saturation-v1.csv --output artifacts --dataset-version saturation-v1
python -m flask --app app.main run --port 5001
python simulation/load_generator.py --token <ADMIN_JWT> --event-id <UUID> --scenario BURST --mode PREDICTIVE --seed 42
```

El entrenamiento separa `train`, validación y test por `run_id`; selecciona modelo y umbral únicamente con validación. Test se evalúa una sola vez y produce el Pipeline, metadata, reporte, matriz de confusión, curva PR y calibración.


# Ciclo de Machine Learning de SmartQueue

## Contrato y responsabilidades

React consume exclusivamente NestJS. NestJS registra la telemetría, cierra ventanas, conserva FIFO, decide el límite y aplica fallback. Flask carga un Pipeline congelado al iniciar y solo calcula riesgo.

Una observación corresponde a 10 segundos y contiene `arrival_rate`, `arrival_trend`, `queue_length`, `active_buyers`, `admission_limit`, `latency_p95_ms`, `error_rate` y `completion_rate`. La predicción cubre los siguientes 30 segundos.

## Ejecución experimental

1. Crear una corrida con `POST /api/v1/experiments`, indicando evento, escenario, modo, semilla y límites.
2. Generar demanda con `smartqueue-ai/simulation/load_generator.py`.
3. Cada 10 segundos, el generador llama `POST /api/v1/admission/runs/{runId}/windows/close`.
4. NestJS persiste `MetricWindow`. El índice único `(runId, windowEnd)` y el reclamo único de `PredictionLog` impiden duplicados.
5. En `PREDICTIVE`, NestJS llama `POST /predict`. Timeout, contrato inválido, modelo ausente o predicción obsoleta activan control reactivo conservador y quedan registrados.
6. La capacidad aplicada nunca cambia el `turnNumber`: `RunAdmissionService` admite únicamente por orden ascendente y no expulsa compradores existentes.
7. Finalizar con `PATCH /api/v1/experiments/{id}/finish`.

Los escenarios soportados son `NORMAL`, `BURST`, `SUSTAINED_PEAK` y `STEPPED`. Para comparación A/B/C deben repetirse las mismas semillas y duración en `FIXED`, `REACTIVE` y `PREDICTIVE`. El protocolo mínimo recomendado es 45 corridas; el completo es 60.

## Telemetría y etiqueta

`OperationalRequestLog` distingue éxito, error técnico, timeout, 5xx, validación, stock agotado y acceso vencido. Solo los errores técnicos forman `error_rate`; rechazos de negocio no simulan saturación.

Exportar las ventanas de una corrida con `GET /api/v1/metrics/runs/{runId}/windows`. El etiquetador offline ordena por corrida y tiempo, exige tres ventanas futuras contiguas y excluye filas no evaluables o sin horizonte. La ventana actual nunca utiliza información futura como feature.

```powershell
python smartqueue-ai/training/label_windows.py --input windows.csv --output saturation-v1.csv --latency-threshold-ms 1000 --error-threshold 0.05
```

## Entrenamiento y artefactos

```powershell
python smartqueue-ai/training/train.py --input saturation-v1.csv --output smartqueue-ai/artifacts --dataset-version saturation-v1
```

Se comparan `DummyClassifier`, Regresión Logística balanceada y KNN con k 3/5/7/9. Todos usan imputación mediana, escalado y clasificador en un Pipeline. La selección prioriza recall, precision mínima, F1, PR-AUC, latencia y estabilidad. Los artefactos resultantes son:

- `saturation_pipeline.joblib`
- `model_metadata.json`
- `evaluation_report.json`
- `confusion_matrix.png`
- `pr_curve.png`
- `calibration_curve.png`

## Operación y monitoreo

El dashboard se actualiza cada 10 segundos desde `/api/v1/metrics/dashboard`. Si no existe corrida o ventana, muestra estado vacío. No contiene valores de métricas de demostración. La comparación incluye únicamente corridas completadas del mismo escenario.

Variables relevantes: `ML_SERVICE_URL`, `ML_TIMEOUT_MS`, `ML_MIN_CRITICAL_REQUESTS`, `MODEL_PATH`, `MODEL_METADATA_PATH` y `PREDICTION_THRESHOLD`.

## Evidencia y limitaciones actuales

Los scripts y endpoints permiten producir evidencia, pero el repositorio no incluye resultados experimentales inventados ni un modelo preentrenado. El modelo debe entrenarse después de ejecutar suficientes corridas reales del simulador. Las migraciones deben desplegarse antes de iniciar un experimento.

# Dataset y primeros modelos — 19 de octubre de 2026

## Decisión de datos

El documento de concepto define saturación futura como tarea principal. La espera
individual es una estimación operacional, no la salida de ese clasificador.
No se usan ventas de películas ni datos personales para entrenar.

Fuentes públicas revisadas:

- [Azure Functions 2019](https://github.com/Azure/AzurePublicDataset/blob/master/AzureFunctionsDataset2019.md):
  invocaciones por minuto y distribuciones de duración; licencia CC-BY, atribuir
  Shahrad et al., *Serverless in the Wild*, USENIX ATC 2020. Útil para perfiles
  externos de demanda, no contiene cola, límite de admisión ni etiqueta SmartQueue.
  La resolución de un minuto no se transforma en mediciones reales de diez segundos.
- [Alibaba Cluster Trace 2018](https://github.com/alibaba/clusterdata/tree/master/cluster-trace-v2018):
  trazas de tareas y recursos de infraestructura, no compras individuales.
  Revisar condiciones de uso antes de redistribuir. No incorporado al entrenamiento.
- [scikit-learn: evitar leakage](https://scikit-learn.org/stable/common_pitfalls.html):
  separar datos antes del ajuste de transformaciones; Pipeline para imputación/escalado.

Ninguno se descargó ni se presentó como dataset de clientes de cine. El dataset
inicial es **100% sintético lógico**, propio, generado por un simulador FIFO.
No sustituye las pruebas HTTP ni demuestra capacidad de usuarios concurrentes.

## Reproducción (PowerShell, desde smartqueue-ai)

```powershell
.venv/Scripts/python.exe -m simulation.generate_dataset --runs 60 --seed 4200
.venv/Scripts/python.exe -m training.label_windows --input data/generated/bootstrap-v1/windows.csv --output data/generated/bootstrap-v1/saturation.csv
.venv/Scripts/python.exe -m training.train --input data/generated/bootstrap-v1/saturation.csv --output artifacts/bootstrap-v1 --dataset-version synthetic-bootstrap-v1
$env:MODEL_PATH='artifacts/bootstrap-v1/saturation_pipeline.joblib'
$env:MODEL_METADATA_PATH='artifacts/bootstrap-v1/model_metadata.json'
.venv/Scripts/python.exe -m flask --app app.main run --host 127.0.0.1 --port 5001
```

El artefacto experimental se mantiene separado del modelo por defecto. No se cambia
automáticamente el controlador de admisión a modo predictivo.

## Contrato de datos

60 corridas independientes, 600 segundos lógicos cada una; NORMAL, BURST,
SUSTAINED_PEAK y RAMP, 15 semillas por escenario. 3 600 ventanas antes de exclusiones.
Ocho features del contrato v1: arrival_rate, arrival_trend, queue_length,
active_buyers, admission_limit, latency_p95_ms, error_rate y completion_rate.
Tasas por segundo, latencia en ms y errores entre 0 y 1.
Metadatos: run_id, window_end UTC, seed, scenario, source, versión del generador.
Capacidad y duración de atención varían por corrida, pero no se incluyen como features.

La latencia, los errores y los tiempos de servicio son artificiales. La etiqueta
usa las siguientes tres ventanas evaluables contiguas, nunca la salida de un modelo.
Umbrales provisionales: 1 000 ms y 5%, todavía pendientes de piloto HTTP.
Ventanas incompletas/no evaluables se excluyen; participantes aún esperando quedan
censurados (tiempo de espera nulo), nunca con espera cero.
`manifest.json` guarda parámetros, tamaños y hashes SHA-256.

## Entrenamiento y evaluación

Dummy, Regresión Logística y KNN (3,5,7,9). Partición por corrida completa, no por filas.
Modelo y umbral elegidos con validación; se conserva el mismo modelo ajustado para
evaluar test, sin reajustar después de seleccionar el umbral.
Artefactos: Pipeline joblib, metadata, reporte JSON, matriz de confusión, PR y calibración.
Las métricas sintéticas solo validan este simulador; no generalizan automáticamente
a Supabase, Redis, NestJS o una venta real. La latencia por fila del entrenamiento
es un promedio por lote, NO latencia HTTP ni p95 de inferencia individual.

## Espera por persona

NestJS estima `(personas delante + 1) / admisiones del último minuto`, en minutos.
Con menos de cinco admisiones recientes devuelve null (calculando).
Se conserva FIFO; no se cambia la prioridad por riesgo ML. La estimación varía
si cambian los cupos o el ritmo. La caché de estado existente limita el sondeo.

## Antes de cerrar la investigación

### Resultado inicial (solo simulación)

56 114 participantes lógicos, 3 404 ventanas etiquetadas; 196 excluidas.
Modelo seleccionado: Regresión Logística. Test sintético: precision 0.8509,
recall 0.9590, F1 0.9017, PR-AUC 0.9830. No son resultados de carga real.
La primera configuración permitía precision mínima 0.4 y seleccionó el baseline
que alertaba siempre. Se elevó a 0.7 al revisar validación; esto es exploración
del pipeline. Para el experimento definitivo se congelará la política y se
usarán corridas nuevas de test, no este conjunto exploratorio reutilizado.
La prueba de 100 llamadas secuenciales con Flask test_client obtuvo p95 ~1.55 ms;
es medición local en proceso, sin red, concurrencia ni PostgreSQL.
Verificado: 7 tests Python y 4 tests de estimación de espera en NestJS.

### Trabajo experimental pendiente

1. Ejecutar piloto HTTP local aislado, no una carga masiva contra Supabase compartido.
2. Validar capacidad, TTL, mínimos de muestras y fijar L/E antes del test final.
3. Exportar al menos 30 corridas reales de 10 minutos con las ocho features.
4. Entrenar con registros propios medidos; no mezclar silenciosamente fuentes sintéticas.
5. Comparar fijo/reactivo/predictivo con mismas trazas y cinco repeticiones por escenario.
6. Medir espera y abandono, throughput, latencia p95, errores y FIFO.
7. Mantener timeout/fallback reactivo y no promover un modelo por métricas sintéticas.

No se crean cuentas ni transacciones para los participantes del simulador offline.
La regresión ML de espera individual queda como ampliación posterior con datos observados.

# Validación local de SmartQueue

## Alcance

El piloto ejecuta peticiones HTTP reales contra Nest, Prisma/PostgreSQL y Redis locales:
ingreso a cola → admisión → reserva por cantidad → confirmación simulada.
No es todavía la compra de butacas del frontend ni un procesamiento de pagos.
Cada modo utiliza un evento nuevo; no se reutilizan existencias de funciones del catálogo.

El modelo bootstrap está entrenado con datos sintéticos. Utilizarlo mediante HTTP
comprueba la integración, pero no acredita precisión en tráfico real ni superioridad.

## Preparación (PowerShell)

Desde la raíz del repositorio, con Docker Desktop iniciado:

```powershell
docker compose -f compose.experiments.yml up -d --wait
cd smartqueue-backend
$env:DATABASE_URL='postgresql://smartqueue:local-experiment-only@127.0.0.1:55432/smartqueue_experiments'
$env:DIRECT_URL=$env:DATABASE_URL
npx prisma migrate deploy
npm run build
$env:PORT='3001'
$env:CACHE_DRIVER='redis'
$env:REDIS_HOST='127.0.0.1'
$env:REDIS_PORT='56379'
$env:ML_SERVICE_URL='http://127.0.0.1:5001'
node dist/main.js
```

Estas variables solo corresponden a esta terminal. No reemplazar el `.env` de Supabase.
El API experimental usa 3001; el frontend habitual continúa conectado a su API habitual.
Los contenedores exponen sus puertos solo en localhost. La contraseña de este ejemplo
es exclusiva del laboratorio local, no una credencial de producción.

En otra terminal, desde `smartqueue-ai`, si el servicio ML no está ya iniciado:

```powershell
$env:MODEL_PATH='artifacts/bootstrap-v1/saturation_pipeline.joblib'
$env:MODEL_METADATA_PATH='artifacts/bootstrap-v1/model_metadata.json'
.venv/Scripts/python.exe -m flask --app app.main run --host 127.0.0.1 --port 5001
```

Los artefactos deben existir previamente; consultar DATASET.md para generarlos.
No iniciar dos servicios sobre el mismo puerto.
Antes de generar carga, comprobar `http://127.0.0.1:5001/health`: debe responder
`model_loaded: true`. Mantener abierta esa terminal durante las tres corridas.
En PowerShell: `Invoke-RestMethod http://127.0.0.1:5001/health`.

## Ejecutar el piloto

### Simulador de clientes (nuevo)

El módulo `simulation.client_simulator` usa una traza precalculada idéntica para los
tres modos: llegada, sondeo cada 2–5 s, paciencia, decisión, compra, abandono y
reconexión idempotente. Cada participante tiene un hilo independiente (máximo 500).
Las compras son concurrentes y el controlador cierra ventanas desde el coordinador
del experimento. No es todavía un scheduler de producción independiente.

Desde `smartqueue-backend`, con el laboratorio y Flask levantados:

```powershell
$env:DATABASE_URL='postgresql://smartqueue:local-experiment-only@127.0.0.1:55432/smartqueue_experiments'
$env:AUTH_ADMIN_EMAIL='admin@cinetrux.test'
$env:AUTH_ADMIN_PASSWORD='CinetruxAdmin2026!'
$env:PILOT_MODES='FIXED,REACTIVE,PREDICTIVE'
node prisma/run-http-pilot.mjs --simulate-clients --clients 200 --duration 60 --scenario BURST --seed 42
```

Para una comprobación pequeña, usar `PILOT_MODES='PREDICTIVE'`, `--clients 20`,
`--duration 30` y `--scenario NORMAL`. Duration es el período de llegadas, no la
duración total: se espera a los participantes y se añaden al menos 30 s de cierre.
Las opciones de escenario son NORMAL, BURST y SUSTAINED_PEAK. El número de clientes
y el período definen la intensidad; un nombre de escenario no prueba saturación.

Se guardan `trace.json`, `<MODO>-clients.json` y `<MODO>-windows.json`.
El primero permite verificar SHA-256 y repetir la misma intención de comportamiento.
El segundo conserva tiempos, resultados individuales y peticiones (SUCCESS, código
HTTP de error o 0 para fallo de transporte), incluidos reintentos de autenticación.
El tercero conserva las ventanas y predicciones. No contiene contraseñas ni JWT.
Este formato no es el CSV del piloto anterior; no pasar estos archivos directamente
al analizador del piloto. Falta el análisis estadístico final entre repeticiones.

Identidad: participantes anónimos distintos comparten una sesión demo CUSTOMER;
el controlador utiliza una sesión ADMIN separada. No son cuentas comerciales ni
navegadores individuales. La recuperación de autenticación hace como máximo un
nuevo login y un reintento por petición rechazada, conservando el 401 observado.

Abandono: `POST /api/v1/queue/entries/cancel` recibe eventId y participantToken,
libera la reserva activa de forma transaccional y es idempotente. Un servicio cada
5 s vence permisos y reservas y devuelve stock. Reingresar con el mismo token
recupera el registro existente: no crea otro turno después de abandonar.

### Ver el ML en el frontend experimental

En otra terminal desde `smartqueue-frontend`:

```powershell
$env:API_PROXY_TARGET='http://127.0.0.1:3001'
$env:VITE_API_URL='/api/v1'
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Abrir `http://127.0.0.1:5175/monitoring` e iniciar sesión con la cuenta demo
`admin@cinetrux.test` / `CinetruxAdmin2026!`. El selector muestra corridas activas y
terminadas. El simulador imprime el runId para abrir `/monitoring?runId=UUID`.
La web habitual en 5173 puede seguir usando la API 3000: no mostrará los experimentos
de la base local si no apunta a 3001.

Comprobación de integración ML: modo solicitado PREDICTIVE, modelo no vacío,
ventana con fecha, riesgo numérico, tiempo de respuesta y modo aplicado PREDICTIVE,
sin fallback. Si falta telemetría o falla Flask, aparece el respaldo y su motivo.
Una corrida COMPLETED es un registro histórico, no actividad actual.
Estos indicadores NO prueban precisión: eso requiere etiquetas futuras y evaluación
en corridas de prueba reservadas. El modelo bootstrap sigue siendo sintético.
La tabla «Decisiones por ventana» permite revisar inferencias anteriores aunque la
última ventana ya esté en respaldo por falta de tráfico.
Ejemplo ya guardado: `http://127.0.0.1:5175/monitoring?runId=d6414092-17d6-498e-b8ae-45fbe6b3cf7e`
contiene cinco inferencias PREDICTIVE del modelo. El enlace funciona cuando el
laboratorio local y su volumen de PostgreSQL están iniciados.

### Piloto secuencial anterior

En otra terminal, desde `smartqueue-backend`:

```powershell
$env:DATABASE_URL='postgresql://smartqueue:local-experiment-only@127.0.0.1:55432/smartqueue_experiments'
$env:AUTH_ADMIN_EMAIL='admin@cinetrux.test'
$env:AUTH_ADMIN_PASSWORD='CinetruxAdmin2026!'
node prisma/run-http-pilot.mjs
```

El lanzador rechaza bases remotas y puertos distintos del laboratorio. Genera tres
corridas de 60 segundos, FIXED/REACTIVE/PREDICTIVE, con 60 llegadas por modo.
Las compras no involucran dinero ni proveedores externos. La duración total supera
los tres minutos por las peticiones y exportaciones.

La consola muestra la carpeta de evidencia. Desde `smartqueue-ai`:

```powershell
.venv/Scripts/python.exe -m simulation.analyze_pilot --input data/generated/http-pilot/FECHA-DE-LA-CORRIDA
```

Conservar `events.json`, archivos JSON/CSV por modo, `summary.json`, `comparison.json`
y `quality.json`. Las carpetas generadas se ignoran en Git intencionadamente.
Los CSV son observaciones de prueba HTTP, no usuarios reales de producción.

## Integridad y lectura de resultados

- `COMPLETED`: terminó el procedimiento; revisar también `failures` y las ventanas.
- `FAILED`: interrupción o timeout. Se conserva evidencia y no se incluye en entrenamiento.
- `/experiments/:id/fail` permite cerrar una corrida interrumpida con permiso QUEUE_CONTROL.
- Los cierres son idempotentes para el mismo resultado; no permiten convertir FAILED en COMPLETED.
- `evaluable=false`: no hay suficientes peticiones críticas. No equivale a latencia cero saludable.
- El controlador predictivo omite inferencia con telemetría insuficiente y usa respaldo conservador.
- La recuperación reactiva usa ventanas saludables medidas, no puntuaciones ML inexistentes.
- `window_latency_p95_median_ms` es la mediana de percentiles por ventana, NO el p95 global
  ni la latencia completa percibida por el navegador.
- Las compras finales pueden caer después de la última ventana cerrada: los conteos de
  telemetría exportada no tienen por qué incluir todas las confirmaciones del piloto.

## Pendientes para validación final

### Evidencia ejecutada el 19 de octubre de 2026

El simulador de clientes se ejecutó con 20 participantes y 30 s de llegadas en
`smartqueue-ai/data/generated/http-pilot/2026-10-19T17-41-10.113Z/`.
La corrida terminó COMPLETED: 13 compras simuladas, 7 abandonos, 0 errores de
cliente y 9 ventanas persistidas. Las nueve ventanas tuvieron respaldo: cinco
por telemetría insuficiente y cuatro por respuesta ML inválida. Por tanto,
**esta corrida verifica el flujo de clientes y el fallback, pero no una decisión
exitosa del ML**. La causa precisa de esas cuatro respuestas no quedó confirmada;
se debe comprobar `/health` antes de repetirla.
Después se comprobó el artefacto sin red con una ventana medida de esa corrida:
`GET /health` devolvió 200 y `model_loaded=true`; `POST /predict` devolvió 200,
`model_version=20261019-saturation-v1` y `risk_score=0.001537`. Esta prueba
aislada confirma la carga del modelo y su contrato, no corrige retroactivamente
los cuatro fallbacks de la corrida HTTP.

Una corrida anterior sí guardó cinco decisiones PREDICTIVE con el modelo
`20261019-saturation-v1`: runId `d6414092-17d6-498e-b8ae-45fbe6b3cf7e`
en `2026-10-19T13-53-22.488Z/PREDICTIVE.json`. Se puede seleccionarla en el
panel para ver el historial de inferencias. La corrida de clientes anterior,
interrumpida al cerrar la sesión, permanece como evidencia fallida y no cuenta
como validación.

Carpeta final: `smartqueue-ai/data/generated/http-pilot/2026-10-19T13-53-22.488Z/`.
Se ejecutó después de corregir la recuperación reactiva y el manejo de telemetría insuficiente.

| Modo | Ingresos | Compras simuladas | Ventanas | Mediana del p95 por ventana |
| --- | ---: | ---: | ---: | ---: |
| FIXED | 60 | 24 | 6 | 27.30 ms |
| REACTIVE | 60 | 30 | 6 | 18.65 ms |
| PREDICTIVE | 60 | 30 | 6 | 18.65 ms |

Las tres corridas terminaron COMPLETED sin errores registrados por el piloto. Hubo
un fallback predictivo por falta de telemetría; las demás inferencias identificaron
el modelo `20261019-saturation-v1`. No se demuestra superioridad predictiva con estos datos.
No todos los participantes compraron: el piloto termina a los 60 segundos sin drenar la cola.
El etiquetado conserva solo 6 de las 18 ventanas (3 sin telemetría suficiente y 9 sin
horizonte futuro completo quedan excluidas). Las 6 etiquetas son de no saturación:
este conjunto NO sirve para reentrenar ni medir detección de saturación por sí solo.

Verificaciones de código: 57 pruebas backend, 11 pruebas Python y builds backend/frontend
exitosos. El frontend conserva un aviso de bundle grande; compilar no equivale a revisión visual.
No se modificó Supabase durante esta continuación ni se subieron cambios a GitHub.

### Trabajo restante

1. Unificar showtime, usuario autenticado, permiso de admisión y reserva real de butacas.
2. Medir espera individual, abandono, expiración, equidad y throughput junto con latencia/errores.
3. Ejecutar escenarios NORMAL/BURST/SUSTAINED_PEAK con trazas equivalentes, varias semillas
   y repeticiones; aleatorizar el orden de controladores y registrar recursos del equipo.
4. Alinear ventanas temporales y añadir un período de cierre/drenaje para cubrir compras finales.
5. Entrenar con corridas medidas separando entrenamiento, validación y prueba por corrida.
6. Reportar intervalos de confianza, fallbacks, calibración y errores; no declarar un ganador
   a partir de una sola corrida de baja carga.
7. Completar dashboard de corridas terminadas, autenticación persistente y pruebas concurrentes.

Para detener el laboratorio conservando su evidencia:

```powershell
docker compose -f compose.experiments.yml stop
```

Cerrar también la terminal de la API experimental. No usar `down -v`: borraría los volúmenes.

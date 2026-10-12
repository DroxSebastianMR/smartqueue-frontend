# Arquitectura de SmartQueue ML

## Decisión

La solución usa tres procesos desplegables dentro de un monorepo. NestJS es un monolito modular para el negocio; Flask se separa porque su ciclo de entrenamiento y dependencias son distintos; React consume una única API pública de NestJS.

```text
React/Vite  --->  NestJS  --->  Flask/scikit-learn
                      |
                      v
                 PostgreSQL
```

## Flujo principal

1. Un participante anónimo entra una sola vez al evento mediante un token idempotente.
2. La cola asigna un turno creciente y mantiene el orden FIFO.
3. Cada ventana operativa genera una sola predicción compartida.
4. El controlador `FIXED`, `REACTIVE` o `PREDICTIVE` calcula el límite de admisión dentro de mínimos y máximos.
5. El permiso admitido habilita una reserva temporal; la confirmación simulada es idempotente.
6. Métricas, predicción y decisión quedan trazables por ejecución y ventana.

## Capas repetidas por feature

- `domain`: entidades, enums, políticas e interfaces de repositorio sin framework.
- `application`: casos de uso y puertos de entrada/salida.
- `infrastructure`: Prisma, HTTP y persistencia de modelos.
- `presentation`: controladores HTTP, DTO y páginas/componentes.

Los imports TypeScript usan `@/` como alias a `src/`. Los límites entre componentes se expresan con contratos JSON, no con imports cruzados.

## Módulos backend

- `events`: evento ficticio, stock y configuración.
- `queue`: turnos, estado, abandono y vencimiento.
- `sales`: reserva temporal y confirmación sin cobro.
- `metrics`: ventanas operativas, dashboard y exportación.
- `admission`: modos A/B/C, límites y fallback.
- `ml-client`: timeout, validación y contrato con Flask.

## Contrato ML

`POST /predict` recibe `schema_version`, `window_end` y ocho variables: `arrival_rate`, `arrival_trend`, `queue_length`, `active_buyers`, `admission_limit`, `latency_p95_ms`, `error_rate` y `completion_rate`.

Devuelve `risk_score`, `risk_class`, `horizon_seconds` y `model_version`. El servicio carga el pipeline una vez al iniciar y nunca entrena durante una petición.

## Convenciones de ramas

- estable: `main`
- integración: `develop`
- trabajo: `feature/<alcance>`, `fix/<alcance>` y `docs/<alcance>`

No se versionan secretos, datasets generados, artefactos entrenados, dependencias ni builds.


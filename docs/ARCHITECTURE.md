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

1. El visitante ve `home` sin sesión; login obtiene un token Bearer sin base de datos en la demo.
2. Un participante autenticado entra una sola vez al evento mediante un token idempotente.
3. La cola asigna un turno creciente y mantiene el orden FIFO.
4. Cada ventana operativa genera una sola predicción compartida.
5. El controlador `FIXED`, `REACTIVE` o `PREDICTIVE` calcula el límite de admisión dentro de mínimos y máximos.
6. El permiso admitido habilita una reserva temporal; la confirmación simulada es idempotente.
7. Métricas, predicción y decisión quedan trazables por ejecución y ventana.

## Organización de módulos

El backend sigue la convención del backend Interbank App: carpetas directas `controllers`, `services`, `repositories`, `dto`, `enums`, `guards`, `decorators`, `types`, `constants` y `utils` solo donde aportan valor. Prisma compartido se ubica en `src/common/prisma`; filtros y excepciones globales en `src/common`. No se usan subcarpetas `presentation`, `application`, `infrastructure` ni `domain` en NestJS. El frontend conserva su propia convención de módulos web.

El caché compartido está en `src/common/cache` con configuración en `src/config/cache`. Por defecto es memoria acotada; Redis es optativo para compartir invalidación y límite de login entre instancias. Se cachean lecturas breves de catálogo, dashboard y posición de cola; las escrituras siguen usando PostgreSQL. `AuthService` delega en servicios separados de login, registro, sesiones y recuperación.

Los imports TypeScript usan `@/` como alias a `src/`. Los límites entre procesos se expresan con contratos JSON.

## Módulos backend

- `auth`: registro, login, JWT, refresh rotativo, cierre de sesiones, recuperación local, permisos y guard; sin persistencia en la demo.
- `banners`, `movies`, `advertisements`, `promotions`: recursos públicos con endpoints propios, DTO documentados y paginación limitada. La página React `home` los compone; no existe un recurso backend `home`.
- `catalog`: contrato de repositorio y adaptador en memoria temporal, reemplazable por Prisma sin cambiar las rutas. El esquema Prisma ya separa película, ubicación editorial (`NOW_PLAYING`/`UPCOMING`), versión de exhibición, media/tráilers, banners, anuncios y promociones.

La separación por recursos, el filtrado y la paginación siguen la guía de [diseño de API de Microsoft](https://learn.microsoft.com/en-gb/azure/architecture/best-practices/api-design). La relación explícita película–género y las entidades con metadatos adicionales siguen las [relaciones explícitas de Prisma](https://docs.prisma.io/docs/orm/v6/prisma-schema/data-model/relations/many-to-many-relations). La distinción entre pósters, fondos y logos también aparece en la [API de imágenes de TMDB](https://developer.themoviedb.org/reference/movie-images); se adopta como modelo de datos, no como dependencia obligatoria de TMDB.
- `events`: evento ficticio, stock y configuración.
- `queue`: ingreso y consulta de turnos.
- `sales`: reserva temporal y confirmación sin cobro.
- `metrics`: consulta del dashboard.
- `admission`: modos A/B/C, límites y fallback.
- `ml-client`: timeout, validación y contrato con Flask.

`events` permanece en backend porque representa un evento transaccional de venta/cola; la pantalla inicial de React se llama `home`, no `events`.

## Frontend y acceso

Las rutas se separan en `public.routes`, `protected.routes` y `root.routes`. `PublicRoute` agrupa `/login`, `/recover` y `/register` bajo `AuthLayout` con `Outlet`; `ProtectedRoute` protege compra y cola, preserva el destino solicitado y restringe monitoreo a `ADMIN`. `LandingLayout`, `BookingLayout`, `AdminLayout` y `AuthLayout` son responsive y comparten el shell cuando corresponde. El frontend usa `pages`, `components`, `forms`, `hooks`, `services`, `schemas`, `types` y `enums` por módulo, siguiendo la convención de Sharkcorp Web; `screens` y `presentation` se reservan fuera de esta web. `AuthProvider` mantiene el estado de sesión y valida el token con `/auth/me`. Axios agrega Bearer, centraliza errores y cierra la sesión ante 401. Los endpoints viven en `services/api/endpoints.ts`.

La autenticación actual es solo una base local: existen cliente y administrador configurables por variables de ambiente; el visitante sin sesión no posee rol autenticado. Registro, recuperación y sesiones funcionan temporalmente en memoria y desaparecen al reiniciar. Se usa scrypt para las contraseñas y tokens de recuperación de un solo uso, pero aún no hay persistencia ni envío de email. Antes de producción requiere repositorio Prisma de usuarios/sesiones y controles de autorización de propiedad y pertenencia sobre recursos de negocio.

## Contrato ML

`POST /predict` recibe `schema_version`, `window_end` y ocho variables: `arrival_rate`, `arrival_trend`, `queue_length`, `active_buyers`, `admission_limit`, `latency_p95_ms`, `error_rate` y `completion_rate`.

Devuelve `risk_score`, `risk_class`, `horizon_seconds` y `model_version`. El servicio carga el pipeline una vez al iniciar y nunca entrena durante una petición.

## Convenciones de ramas

- estable: `main`
- integración: `develop`
- trabajo: `feature/<alcance>`, `fix/<alcance>` y `docs/<alcance>`

No se versionan secretos, datasets generados, artefactos entrenados, dependencias ni builds.


# SmartQueue Backend

NestJS modular con carpetas directas por responsabilidad, siguiendo la convención de Interbank App Backend: `controllers`, `services`, `repositories`, `dto`, `enums`, `guards`, `decorators`, `types` y `constants` según cada módulo. No hay carpetas `presentation`, `application`, `infrastructure` ni `domain` en el backend. Prisma está en `src/common/prisma`; Swagger en `/api/docs`.

## Módulos

- `auth`: controlador, DTO, servicios de contraseñas/JWT, repositorio temporal, RBAC por permisos, excepciones codificadas y sesiones renovables.
- `banners`, `movies`, `advertisements`, `promotions`: recursos públicos independientes; `home` existe solo como página React.
- `catalog`: contrato de repositorio y adaptador de demostración intercambiable por Prisma; caché de lecturas.
- `cinemas`, `showtimes`: sedes, geolocalización opcional, salas, butacas y programación; administración global protegida con JWT.
- `payments`: catálogo de métodos y tipos de comprobante, más contratos seguros de pago/emisión bloqueados hasta integrar órdenes, proveedor y SUNAT/OSE.
- `events`: eventos comerciales de la cola (distintos del módulo visual `home` de React).
- `queue`, `sales`, `metrics`, `admission`, `ml-client`, `health`: lógica de turnos, venta simulada y ML.

## Caché

La implementación sigue el patrón del backend Interbank: `CacheStoreModule` global, `CacheStoreService` con drivers `memory` y `redis`, configuración tipada y cachés por módulo con claves y TTL explícitos. El driver predeterminado `memory` permite arrancar con `npm run dev` sin Redis; se limita a `CACHE_MEMORY_MAX_ENTRIES` y no se comparte entre procesos.

Para probar Redis localmente, iniciar `docker compose -f smartqueue-backend/compose.cache.yml up -d` desde la raíz, poner `CACHE_DRIVER=redis` en `smartqueue-backend/.env` y reiniciar el backend. `REDIS_HOST`, `REDIS_PORT`, `REDIS_DATABASE`, `REDIS_KEY_PREFIX` y `REDIS_PASSWORD` son configurables. Si se solicita Redis y no está disponible, el backend falla al iniciar: no cambia silenciosamente a memoria.

| Dato | Clave | TTL | Invalidación |
| --- | --- | --- | --- |
| Intentos de login | hash del correo | 60 s | login correcto |
| Catálogo público | `catalog:v1:<recurso>:<revisión>:<consulta>` | 60 s | vencimiento o cambio de revisión al gestionar películas |
| Dashboard | `metrics:dashboard:v1` | 3 s | ingreso en cola, admisión, reserva o compra |
| Estado de cola | evento + versión + hash del token | 2 s | versión del evento tras ingreso, admisión, reserva o compra |

Las respuestas de cola cacheadas omiten el token del participante. Redis es **caché, no base de datos**: la fuente de verdad de cola/ventas sigue siendo PostgreSQL, y usuarios/sesiones demo todavía viven en memoria. Activar Redis no habilita autenticación multiinstancia. Sin un servidor Redis configurado, `CACHE_DRIVER=memory` mantiene una caché local por proceso.

## Desarrollo

```bash
npm install
copy .env.example .env
npm run start:dev
```

Con `DATABASE_URL` y `DIRECT_URL` configuradas, el catálogo, cines, salas y funciones se hidratan desde PostgreSQL al iniciar. Las lecturas públicas usan instantáneas por proceso y caché de listas; la administración de películas escribe en Prisma y actualiza la instantánea. La migración inicial se encuentra en `prisma/migrations` y se aplica con `npx prisma migrate deploy`. Para datos de prueba, ejecutar `npm run prisma:seed`; el seed es idempotente y en producción exige `ALLOW_DEMO_SEED=true`. No se crean pagos reales ni cuentas demo utilizables. Las operaciones administrativas de cines, salas, butacas y funciones aún son **solo en memoria** y deben migrarse a Prisma antes de usarse fuera de pruebas.

El pooler de transacciones de Supabase (`DATABASE_URL`, puerto 6543, `pgbouncer=true`) atiende la aplicación; el pooler de sesión (`DIRECT_URL`, puerto 5432) atiende migraciones. `connection_limit=5` evita abrir demasiadas conexiones por proceso. No se garantiza latencia de milisegundos en fallos de caché o arranques fríos: la red y el plan de Supabase influyen. Mantener credenciales solo en `.env`, nunca en commits.

## Contrato público del catálogo

| Método | Ruta | Límite |
| --- | --- | --- |
| GET | `/api/v1/banners` | 10 por página |
| GET | `/api/v1/movies/now-playing` | 10 por página |
| GET | `/api/v1/movies/upcoming` | 10 por página |
| GET | `/api/v1/movies` | búsqueda por título/género, 10 por página |
| GET | `/api/v1/movies/rankings/top-selling` | estado explícito sin ventas reales |
| GET | `/api/v1/movies/:slug` | una ficha |
| GET | `/api/v1/movies/:slug/trailers` | avances de la película |
| GET | `/api/v1/advertisements` | 5 por página |
| GET | `/api/v1/promotions` | 5 por página |
| GET | `/api/v1/cinemas` | sedes activas, ciudad/país/distrito |
| GET | `/api/v1/cinemas/nearby` | sedes geocodificadas por cercanía aproximada |
| GET | `/api/v1/showtimes` | funciones por sede/película/fecha local |
| GET | `/api/v1/movies/:slug/schedule` | próximos cinco días por cine/formato/idioma |
| GET | `/api/v1/payments/methods` | opciones de pago previstas, no habilitadas |
| GET | `/api/v1/receipts/types` | boleta y factura previstas |

Las listas aceptan `page` y `limit` (enteros positivos; un exceso devuelve 400) y responden `{ "data": [...], "meta": { "page": 1, "limit": 10, "count": 4, "total": 4, "hasNextPage": false } }`. El seed produce datos **de demostración, no una cartelera ni preventa comercial verificada**: cuatro títulos en cartelera y diez próximos. El frontend consume estas rutas y conserva sus datos visuales locales como respaldo si la API no responde.

La matriz completa de operaciones de cine (más de 30 rutas), reglas y pendientes está en [docs/CINEMA_API.md](../docs/CINEMA_API.md). Las rutas `/api/v1/admin/*` requieren Bearer JWT de `ADMIN`. El ranking devuelve `NO_SALES_DATA`, nunca cifras de tickets inventadas; la disponibilidad devuelve `NOT_CONNECTED` hasta tener reservas/ventas de cine reales.

`AUTH_DEMO_EMAIL`, `AUTH_DEMO_PASSWORD`, `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD` y `AUTH_TOKEN_SECRET` se configuran por ambiente. `AuthService` es una fachada sobre `LoginService`, `RegistrationService`, `AuthSessionService` y `PasswordRecoveryService`. El repositorio en memoria **rechaza producción**: usuarios, sesiones y recuperaciones desaparecen al reiniciar o entre instancias. El token de recuperación se devuelve solo en este entorno de desarrollo; aún no hay proveedor de correo. Reemplazar el adaptador por Prisma y agregar un sistema de email antes de desplegar.

## Contratos de autenticación

Swagger UI: `http://localhost:3000/api/docs`; OpenAPI JSON: `http://localhost:3000/api/docs-json`. Prefijo de API: `/api/v1`.
Swagger usa el host actual del navegador (servidor OpenAPI `/`), por lo que `Execute` funciona también al abrir la documentación desde otro dispositivo. Los parámetros `page` y `limit` se publican como números simples, no como objetos. Si Swagger quedó abierto durante un cambio de código, reinicia `npm run dev` y recarga `/api/docs` para obtener el OpenAPI nuevo.
Cada operación documenta su respuesta de éxito y sus errores esperados, con un ejemplo del sobre global `statusCode/error/code/message/path/timestamp`. El helper reutilizable vive en `src/common/decorators/api-errors.decorator.ts`.

| Método | Ruta | Resultado principal |
| --- | --- | --- |
| POST | `auth/register` | 201, sesión de cliente |
| POST | `auth/login` | 200, sesión |
| POST | `auth/refresh` | 200, sesión rotada |
| GET | `auth/me` | 200, usuario/roles/permisos |
| GET | `auth/permissions` | 200, usuario/roles/permisos |
| POST | `auth/logout` | 200, revoca sesión actual |
| POST | `auth/logout-all` | 200, revoca todas |
| GET | `auth/sessions` | 200, sesiones activas |
| DELETE | `auth/sessions/:id` | 200, revoca una sesión propia |
| POST | `auth/password/change` | 200, cambia contraseña y revoca sesiones |
| POST | `auth/password/forgot` | 202, token de desarrollo si existe el correo |
| POST | `auth/password/reset` | 200, consume token y revoca sesiones |

El login conserva el contrato del frontend: `{ accessToken, tokenType, expiresAt, user: { id, email, role } }`; añade `refreshToken`, `refreshExpiresAt`, `user.roles` y `user.permissions`. El access token HS256 dura 1 hora, el refresh token opaco 7 días y se rota al renovarlo. El formato de error global es `{ statusCode, error, code, message, path, timestamp, meta? }`. La validación devuelve `VALIDATION_ERROR`; autenticación usa códigos `AUTH_*`.

## Roles propuestos para Cinetrux

| Rol | Alcance previsto |
| --- | --- |
| `CUSTOMER` | Perfil y compra/consulta de entradas propias |
| `BOX_OFFICE` | Venta y devolución en taquilla |
| `USHER` | Validación de entradas y consulta de cola |
| `CINEMA_MANAGER` | Cartelera, cine y control operativo de su sede |
| `OPERATIONS_ANALYST` | Métricas y monitoreo, solo lectura |
| `ADMIN` | Administración global (compatible con el frontend actual) |

La matriz completa está en `src/modules/auth/constants/role-permissions.constant.ts`. No existe un rol autenticado `GUEST`: navegación pública usa endpoints sin Bearer. Los futuros roles de sede se modelan en Prisma mediante `UserRoleAssignment.cinemaId`; **la comprobación de alcance por cine todavía no existe**, por lo que no deben provisionarse cuentas de personal antes de implementarla. Actualmente solo se crean cuentas demo CUSTOMER/ADMIN y el registro público siempre crea CUSTOMER. No hay endpoint público para otorgar roles.

## Estado de persistencia

Para el catálogo se modelaron además `MovieCatalogPlacement` (la misma película puede figurar en distintas secciones), `MovieVersion` (formato, audio y subtítulos), `MovieAsset` (póster, fondo, logo y video), `MovieLocalization`, `MovieRelease` (estreno/preventa por país), `Genre`, `Banner`, `Advertisement` y `Promotion`. Las funciones apuntan a una versión concreta, evitando duplicar formato e idioma en columnas libres. Las sedes incluyen ubicación y zona horaria; salas, formatos/aforo/limpieza; butacas, tipo/estado; funciones, precio y ventana de venta. Existe migración inicial aplicada y lectura de catálogo desde Prisma mediante instantáneas; las escrituras de cine y funciones aún requieren repositorios persistentes.

El esquema Prisma incluye usuarios, asignaciones de rol, sesiones, recuperación, cines, salas, butacas, películas, funciones, entradas, órdenes, intentos de pago y comprobantes además de los modelos SmartQueue existentes. La migración inicial ya se aplicó a la base Supabase configurada durante el desarrollo. Esto es estructura, no implementación funcional de ventas de cine. El índice de `Ticket(showtimeId, seatId, status)` no garantiza exclusión de butaca: al implementar compras reales se requiere transacción y restricción SQL parcial o equivalente. Tampoco están conectados aún pagos, emisión electrónica, envío de correo ni autorización de propiedad/alcance de los recursos de cola y venta. No usar este prototipo como sistema comercial real.


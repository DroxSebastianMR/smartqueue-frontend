# SmartQueue Backend

Monolito modular NestJS con Prisma/PostgreSQL. Cada feature separa `domain`, `application`, `infrastructure` y `presentation`, y usa `@/` para imports desde `src`.

Los módulos iniciales son `events`, `queue`, `sales`, `metrics`, `admission`, `ml-client` y `health`. Las operaciones críticas de turno e inventario usan transacciones y restricciones únicas de base de datos.


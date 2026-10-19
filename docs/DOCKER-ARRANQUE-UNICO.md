# Arranque único con Docker

Este laboratorio levanta cinco servicios aislados: PostgreSQL, Redis, el servicio
de inferencia ML, NestJS y React/Vite. No utiliza Supabase ni servicios de pago.
La imagen de IA contiene el artefacto bootstrap versionado; es un modelo sintético
para demostración experimental, no un modelo validado en producción.

## Requisito

Iniciar Docker Desktop y permanecer en la raíz del repositorio.

## Levantar todo

```powershell
docker compose -f compose.experiments.yml up --build -d --wait
```

Abrir:

- Aplicación y monitoreo: `http://127.0.0.1:5175/monitoring`
- API Swagger: `http://127.0.0.1:3001/api/docs`
- Salud de la IA: `http://127.0.0.1:5001/health`

La cuenta local de monitoreo es `admin@cinetrux.test` con contraseña
`CinetruxAdmin2026!`.

## Operación

```powershell
docker compose -f compose.experiments.yml ps
docker compose -f compose.experiments.yml logs -f backend
docker compose -f compose.experiments.yml logs -f ai
docker compose -f compose.experiments.yml stop
```

`stop` conserva las evidencias locales. No usar `down -v` salvo que se desee
borrar intencionalmente PostgreSQL y Redis del laboratorio.

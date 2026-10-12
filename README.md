# SmartQueue ML

Base arquitectónica para una demostración académica de venta de entradas de cine con cola virtual FIFO, compra simulada y predicción de saturación.

## Componentes

| Carpeta | Responsabilidad | Tecnología |
| --- | --- | --- |
| `smartqueue-frontend/` | Portada Cinetrux, autenticación, sala de espera, compra y panel experimental | React, Vite, TypeScript, Tailwind CSS y componentes estilo shadcn/ui |
| `smartqueue-backend/` | Reglas de cola, admisión, inventario, reservas, métricas y auditoría | NestJS, Prisma y PostgreSQL |
| `smartqueue-ai/` | Entrenamiento e inferencia de riesgo de saturación | Python, Flask y scikit-learn |

La raíz coordina documentación y ejecución local. Cada componente conserva dependencias, pruebas, configuración y ciclo de despliegue propios.

## Puesta en marcha

1. Instalar dependencias una vez: `npm install --prefix smartqueue-backend` y `npm install --prefix smartqueue-frontend`.
2. Crear `smartqueue-ai/.venv` e instalar `requirements-dev.txt`. Desde esta carpeta raíz, ejecutar `npm run dev`. El comando inicia NestJS, Vite y Flask juntos; `Ctrl+C` detiene los tres. Puede definirse `SMARTQUEUE_PYTHON` si el intérprete está en otra ruta.
3. Configurar `smartqueue-backend/.env` con `DATABASE_URL` y `DIRECT_URL` de Supabase. El proxy `/api` conecta el frontend con NestJS; Home obtiene banners, películas, anuncios, promociones, cines y funciones de sus endpoints.
4. Para reproducir la base desde cero, en backend ejecutar `npm run prisma:generate`, `npx prisma migrate deploy` y `npm run prisma:seed`. El frontend usa `VITE_USE_MOCKS=false`; la cola y la compra continúan siendo prototipos y no procesan pagos reales.
5. Para predicciones ML, iniciar el servicio de `smartqueue-ai` según su README.

La interfaz queda en `http://localhost:5173`, NestJS en `http://localhost:3000/api/v1` y Flask en `http://localhost:5001`.

El usuario cliente demo local es `demo@cinetrux.test` con contraseña `CinetruxDemo2026!`; el administrador demo es `admin@cinetrux.test` con contraseña `CinetruxAdmin2026!`. Swagger se encuentra en `http://localhost:3000/api/docs`.

## Alcance protegido

- La cola siempre preserva FIFO; ML solo modifica el ritmo de admisión.
- La compra es simulada y no procesa pagos reales.
- NestJS decide y aplica los límites; Flask únicamente devuelve una señal de riesgo.
- Si Flask falla, NestJS retrocede al controlador reactivo.
- El caso visual se inspira en una preventa cinematográfica, sin afirmar integración oficial con Cineplanet.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para límites, flujo y convenciones.
El protocolo de telemetría, experimentos, etiquetado, entrenamiento, inferencia y fallback está en [docs/ML_LIFECYCLE.md](docs/ML_LIFECYCLE.md).


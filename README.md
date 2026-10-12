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
2. Desde esta carpeta raíz, ejecutar `npm run dev`. El comando inicia NestJS y Vite juntos; `Ctrl+C` detiene ambos. No requiere instalar dependencias en la raíz.
3. Sin `.env`, el proxy `/api` conecta el frontend con NestJS y funcionan portada/login. Para cola y ventas sin PostgreSQL, copiar `smartqueue-frontend/.env.example` a `smartqueue-frontend/.env` y dejar `VITE_USE_MOCKS=true`.
4. Para el flujo completo, iniciar PostgreSQL con `docker compose up -d postgres`; en backend ejecutar `npm run prisma:generate`, `npm run prisma:migrate:dev` y `npm run prisma:seed`, y en frontend poner `VITE_USE_MOCKS=false`.
5. Para predicciones ML, iniciar el servicio de `smartqueue-ai` según su README.

La interfaz queda en `http://localhost:5173`, NestJS en `http://localhost:3000/api/v1` y Flask en `http://localhost:5001`.

El usuario cliente demo local es `demo@cinetrux.test` con contraseña `CinetruxDemo2026!`; el administrador demo es `admin@cinetrux.test` con contraseña `CinetruxAdmin2026!`. Swagger se encuentra en `http://localhost:3000/api/docs`. No se ha publicado ni subido ningún cambio a GitHub.

## Alcance protegido

- La cola siempre preserva FIFO; ML solo modifica el ritmo de admisión.
- La compra es simulada y no procesa pagos reales.
- NestJS decide y aplica los límites; Flask únicamente devuelve una señal de riesgo.
- Si Flask falla, NestJS retrocede al controlador reactivo.
- El caso visual se inspira en una preventa cinematográfica, sin afirmar integración oficial con Cineplanet.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para límites, flujo y convenciones.


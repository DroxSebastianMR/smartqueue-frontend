# SmartQueue ML

Base arquitectónica para una demostración académica de venta de entradas de cine con cola virtual FIFO, compra simulada y predicción de saturación.

## Componentes

| Carpeta | Responsabilidad | Tecnología |
| --- | --- | --- |
| `smartqueue-frontend/` | Experiencia de evento, sala de espera, compra y panel experimental | React, Vite, TypeScript, Tailwind CSS y componentes estilo shadcn/ui |
| `smartqueue-backend/` | Reglas de cola, admisión, inventario, reservas, métricas y auditoría | NestJS, Prisma y PostgreSQL |
| `smartqueue-ai/` | Entrenamiento e inferencia de riesgo de saturación | Python, Flask y scikit-learn |

La raíz coordina documentación y ejecución local. Cada componente conserva dependencias, pruebas, configuración y ciclo de despliegue propios.

## Puesta en marcha

1. Copiar cada `.env.example` a `.env`.
2. Iniciar PostgreSQL con `docker compose up -d postgres`.
3. En `smartqueue-backend`, ejecutar `npm install`, `npm run prisma:generate`, `npm run prisma:migrate:dev`, `npm run prisma:seed` y `npm run start:dev`.
4. En `smartqueue-ai`, crear un entorno virtual, instalar `requirements.txt` y ejecutar `python -m flask --app app.main run --port 5001`.
5. En `smartqueue-frontend`, copiar `.env.example` como `.env`, ejecutar `npm install` y `npm run dev`.

La interfaz queda en `http://localhost:5173`, NestJS en `http://localhost:3000/api/v1` y Flask en `http://localhost:5001`.

## Alcance protegido

- La cola siempre preserva FIFO; ML solo modifica el ritmo de admisión.
- La compra es simulada y no procesa pagos reales.
- NestJS decide y aplica los límites; Flask únicamente devuelve una señal de riesgo.
- Si Flask falla, NestJS retrocede al controlador reactivo.
- El caso visual se inspira en una preventa cinematográfica, sin afirmar integración oficial con Cineplanet.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para límites, flujo y convenciones.


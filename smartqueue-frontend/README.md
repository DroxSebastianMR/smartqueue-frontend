# SmartQueue Frontend

React + Vite + TypeScript con Tailwind CSS y base shadcn/ui. El código se organiza por `features`; cada feature puede contener `domain`, `application`, `infrastructure` y `presentation`. El alias `@/` apunta a `src/`.

La página de inicio sigue el patrón de composición usado en los proyectos de referencia: la página solo orquesta y cada sección vive en un componente independiente.

```text
features/events/
├── data/home.data.ts
├── models/movie.model.ts
├── domain/event.ts
├── application/get-featured-event.use-case.ts
├── infrastructure/event.repository.ts
└── presentation/
    ├── components/
    │   ├── cinema-finder.tsx
    │   ├── home-hero.tsx
    │   ├── movie-card.tsx
    │   ├── movies-section.tsx
    │   ├── queue-experience-section.tsx
    │   └── project-notice.tsx
    └── pages/event-page.tsx
```

## Desarrollo

```bash
npm install
copy .env.example .env
npm run dev
```

La aplicación consume `VITE_API_URL` y, por defecto, espera NestJS en `http://localhost:3000/api/v1`. Usa `VITE_USE_MOCKS=true` solamente para trabajo visual sin backend.

El flujo conectado cubre carga del evento, creación/consulta del turno, ejecución de una admisión de demostración, reserva y confirmación simulada.


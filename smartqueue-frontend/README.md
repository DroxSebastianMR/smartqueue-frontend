# Cinetrux / SmartQueue Frontend

React, Vite, TypeScript y componentes reutilizables estilo shadcn/ui. Sigue la organización web de Sharkcorp: cada feature agrupa `pages`, `components`, `forms` (si corresponde), `hooks`, `services`, `schemas`, `types` y `enums`. No se usan `screens` ni `presentation` de React Native. La página de inicio compone secciones; cada sección contiene sus propias cards y controles.

```text
src/
├── app/
│   ├── providers/auth/
│   └── router/{constants,guards,routes}/
├── layouts/{auth,landing,booking,admin,components}/
├── features/
│   ├── auth/{components,constants,enums,forms,hooks,pages,schemas,services,types,utils}/
│   ├── home/{components,data,enums,hooks,models,pages,services}/
│   ├── queue/{enums,hooks,pages,services,types}/
│   ├── purchase/{components,hooks,pages,services,types}/
│   └── monitoring/{enums,hooks,pages,services,types}/
├── services/api/{client,interceptors,endpoints}.ts
└── components/ui/
```

`/` usa `LandingLayout`. `/login`, `/recover` y `/register` comparten `AuthLayout` y cambian únicamente su contenido con `Outlet`; cada página de autenticación está separada del formulario, hook y servicio. `/queue` y `/purchase` usan `BookingLayout` y requieren sesión. `/monitoring` usa `AdminLayout` y solo acepta administradores. El visitante público no tiene rol autenticado; los roles persistibles son `CUSTOMER` y `ADMIN`. El ícono de cuenta permite ingresar o cerrar sesión.

## Desarrollo local

1. En `smartqueue-backend`, ejecutar `npm install` y `npm run start:dev` (puerto 3000).
2. Aquí, ejecutar `npm install` y `npm run dev` (puerto 5173 o el siguiente disponible).
3. Abrir la URL Local que imprime Vite. La ruta `/api` se redirige a NestJS mediante el proxy de Vite, incluso cuando se accede desde otro dispositivo de la misma red.

No hace falta PostgreSQL para `GET /banners`, `/movies/now-playing`, `/movies/upcoming`, `/advertisements`, `/promotions`, `POST /auth/login` y `GET /auth/me`. Las operaciones de cola/venta aún requieren base de datos; por ello, `.env.example` activa mocks solo para esos flujos de demostración. Login y portada consumen el backend real; las películas conservan datos visuales locales de respaldo si la API falla. Los datos del catálogo son de demostración y no una cartelera comercial verificada. Para integración completa con PostgreSQL se requiere implementar el repositorio Prisma, migraciones y seed del backend.

Credenciales locales: cliente `demo@cinetrux.test` / `CinetruxDemo2026!`; administrador `admin@cinetrux.test` / `CinetruxAdmin2026!`. No son para producción. El token se guarda en `sessionStorage` y Axios lo agrega a cada solicitud, normaliza errores y elimina la sesión ante una respuesta 401. Registro y recuperación son rutas preparadas, no operaciones activas, hasta contar con persistencia de usuarios y correo.


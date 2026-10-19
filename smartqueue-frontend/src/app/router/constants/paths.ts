export const PATHS = {
  HOME: '/',
  UPCOMING: '/proximos-estrenos',
  MOVIE: (slug: string) => `/peliculas/${encodeURIComponent(slug)}`,
  MOVIE_DETAIL: '/peliculas/:slug',
  AUTH: { LOGIN: '/login', RECOVER: '/recover', REGISTER: '/register' },
  QUEUE: '/queue',
  PURCHASE: '/purchase',
  MONITORING: '/monitoring',
  FORBIDDEN: '/forbidden',
} as const;

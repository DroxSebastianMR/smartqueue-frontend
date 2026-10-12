export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', ME: '/auth/me' },
  BANNERS: { LIST: '/banners' },
  MOVIES: {
    NOW_PLAYING: '/movies/now-playing',
    UPCOMING: '/movies/upcoming',
    DETAIL: (slug: string) => `/movies/${encodeURIComponent(slug)}`,
  },
  ADVERTISEMENTS: { LIST: '/advertisements' },
  PROMOTIONS: { LIST: '/promotions' },
  QUEUE: {
    JOIN: '/queue/entries',
    STATUS: (eventId: string) =>
      `/queue/events/${encodeURIComponent(eventId)}/status`,
  },
  SALES: {
    RESERVE: '/sales/reservations',
    CONFIRM: (reservationId: string) =>
      `/sales/reservations/${encodeURIComponent(reservationId)}/confirm`,
  },
  ADMISSION: {
    RUN: (eventId: string) =>
      `/admission/events/${encodeURIComponent(eventId)}/run`,
  },
  METRICS: { DASHBOARD: '/metrics/dashboard' },
} as const;

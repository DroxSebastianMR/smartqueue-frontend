export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', ME: '/auth/me' },
  BANNERS: { LIST: '/banners' },
  MOVIES: {
    NOW_PLAYING: '/movies/now-playing',
    UPCOMING: '/movies/upcoming',
    DETAIL: (slug: string) => `/movies/${encodeURIComponent(slug)}`,
    SCHEDULE: (slug: string) => `/movies/${encodeURIComponent(slug)}/schedule`,
  },
  ADVERTISEMENTS: { LIST: '/advertisements' },
  PROMOTIONS: { LIST: '/promotions' },
  CINEMAS: { LIST: '/cinemas' },
  PAYMENTS: { METHODS: '/payments/methods' },
  SHOWTIMES: {
    LIST: '/showtimes',
    TICKET_RATES: (id: string) => `/showtimes/${encodeURIComponent(id)}/ticket-rates`,
    TICKET_QUOTES: (id: string) => `/showtimes/${encodeURIComponent(id)}/ticket-quotes`,
    SEATS: (id: string) => `/showtimes/${encodeURIComponent(id)}/seats`,
    VALIDATE_SEATS: (id: string) => `/showtimes/${encodeURIComponent(id)}/seats/validate`,
  },
  QUEUE: {
    JOIN: '/queue/entries',
    STATUS: (eventId: string) => `/queue/events/${encodeURIComponent(eventId)}/status`,
  },
  SALES: {
    RESERVE: '/sales/reservations',
    CONFIRM: (reservationId: string) => `/sales/reservations/${encodeURIComponent(reservationId)}/confirm`,
  },
  ADMISSION: { RUN: (eventId: string) => `/admission/events/${encodeURIComponent(eventId)}/run` },
  METRICS: { DASHBOARD: '/metrics/dashboard' },
} as const;

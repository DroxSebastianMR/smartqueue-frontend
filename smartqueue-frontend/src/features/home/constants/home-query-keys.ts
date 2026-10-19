export const homeQueryKeys = {
  featured: ['home', 'featured'] as const,
  nowPlaying: ['home', 'now-playing'] as const,
  upcoming: ['home', 'upcoming'] as const,
  movie: (slug: string) => ['movies', 'detail', slug] as const,
  schedule: (slug: string, cinemaSlug: string) => ['movies', 'schedule', slug, cinemaSlug] as const,
  advertisements: ['home', 'advertisements'] as const,
  promotions: ['home', 'promotions'] as const,
  cinemas: ['home', 'cinemas'] as const,
  showtimes: (movieSlug: string, city: string, cinemaSlug: string, date: string) =>
    ['home', 'showtimes', movieSlug, city, cinemaSlug, date] as const,
};

import type { MovieProjectionFormat } from '@/features/home/enums/movie-projection-format.enum';
import type { MovieMediaProvider } from '@/features/home/enums/movie-media-provider.enum';
import type { ShowtimeStatus } from '@/features/home/enums/showtime-status.enum';

export interface ApiPage<T> {
  data: T[];
  meta: { page: number; limit: number; count: number; total: number; hasNextPage: boolean };
}

export interface ApiMovie {
  slug: string;
  title: string;
  synopsis: string | null;
  posterUrl: string;
  backdropUrl: string | null;
  releaseDate: string | null;
  ageRating: string | null;
  durationMinutes: number | null;
  genres: string[];
  presale: boolean;
  versions: {
    id?: string;
    format: MovieProjectionFormat;
    audioLanguage: string;
    subtitleLanguage: string | null;
  }[];
}

export interface ApiBanner {
  id: string;
  movieSlug: string;
  title: string;
  logoUrl: string | null;
  backdropUrl: string;
  video: { provider: MovieMediaProvider.YOUTUBE | MovieMediaProvider.LOCAL; url: string; muted: boolean } | null;
  cta: { label: string; href: string };
  priority: number;
}

export interface ApiAdvertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
  placement: 'HOME' | 'CHECKOUT';
  priority: number;
}

export interface ApiPromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
  startsAt: string | null;
  endsAt: string | null;
}

export interface ApiCinema {
  id: string;
  slug: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  timeZone: string;
}

export interface ApiShowtime {
  id: string;
  movieSlug: string;
  cinemaSlug: string;
  startsAt: string;
  status: ShowtimeStatus;
  basePriceCents: number;
  currency: string;
}

export interface ApiMovieSchedule {
  movieSlug: string;
  cinemaSlug: string | null;
  timeZone: string | null;
  locationStatus: 'SELECTED' | 'NEARBY' | 'NO_GEOCODED_CINEMA';
  distanceKm: number | null;
  days: { date: string; weekday: string; groups: {
    format: MovieProjectionFormat; audioLanguage: string; subtitleLanguage: string | null;
    slots: { showtimeId: string; startsAt: string; localTime: string; status: ShowtimeStatus; bookable: boolean; basePriceCents: number; currency: string; seatAvailability: 'UNKNOWN' }[];
  }[] }[];
}

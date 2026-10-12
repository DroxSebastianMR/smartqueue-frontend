import type { FeaturedMovie } from '@/features/home/models/featured-movie.model';
import type { Movie } from '@/features/home/models/movie.model';
import { MovieFormat } from '@/features/home/enums/movie-format.enum';
import { MovieLanguage } from '@/features/home/enums/movie-language.enum';
import { apiGet } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

interface Page<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    count: number;
    total: number;
    hasNextPage: boolean;
  };
}
interface CatalogMovie {
  slug: string;
  title: string;
  posterUrl: string;
  releaseDate: string | null;
  ageRating: string | null;
  durationMinutes: number | null;
  genres: string[];
  presale: boolean;
  versions: {
    format: string;
    audioLanguage: string;
    subtitleLanguage: string | null;
  }[];
}
interface CatalogBanner {
  movieSlug: string;
  backdropUrl: string;
  video: { provider: 'YOUTUBE' | 'LOCAL'; url: string } | null;
}
export interface CatalogAdvertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
}
export interface CatalogPromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
}

function toCard(movie: CatalogMovie, upcoming: boolean): Movie {
  return {
    id: movie.slug,
    title: movie.title,
    poster: movie.posterUrl,
    genre: movie.genres.length
      ? movie.genres.join(' · ')
      : upcoming
        ? 'Próximo estreno'
        : 'En cartelera',
    duration: movie.durationMinutes
      ? `${Math.floor(movie.durationMinutes / 60)}h ${String(movie.durationMinutes % 60).padStart(2, '0')}m`
      : 'Por confirmar',
    rating: movie.ageRating ?? 'TBC',
    format:
      movie.versions
        .map((version) =>
          version.format.replace('TWO_D', '2D').replace('THREE_D', '3D'),
        )
        .join(' · ') || 'Por confirmar',
    releaseTag: upcoming
      ? 'Próximamente'
      : movie.presale
        ? 'Preventa'
        : 'En cartelera',
    palette: 'from-[#101820] via-[#283849] to-[#9bb8ca]',
  };
}

export const homeService = {
  featured: async (): Promise<FeaturedMovie> => {
    const banners = await apiGet<Page<CatalogBanner>>(
      API_ENDPOINTS.BANNERS.LIST,
    );
    const banner = banners.data[0];
    if (!banner) throw new Error('No hay banners disponibles');
    const movie = await apiGet<CatalogMovie>(
      API_ENDPOINTS.MOVIES.DETAIL(banner.movieSlug),
    );
    return {
      movieId: movie.slug,
      title: movie.title,
      releaseDate: movie.releaseDate ?? '',
      presale: movie.presale,
      formats: movie.versions
        .map((version) => version.format)
        .filter((format): format is MovieFormat =>
          Object.values(MovieFormat).includes(format as MovieFormat),
        ) as MovieFormat[],
      languages: movie.versions.some(
        (version) => version.audioLanguage === 'es-419',
      )
        ? [MovieLanguage.LATIN_SPANISH]
        : [],
      media: banner.video
        ? {
            type: banner.video.provider === 'YOUTUBE' ? 'youtube' : 'video',
            src: banner.video.url,
            poster: banner.backdropUrl,
          }
        : undefined,
    };
  },
  nowPlaying: async (): Promise<Movie[]> =>
    (
      await apiGet<Page<CatalogMovie>>(API_ENDPOINTS.MOVIES.NOW_PLAYING)
    ).data.map((movie) => toCard(movie, false)),
  upcoming: async (): Promise<Movie[]> =>
    (await apiGet<Page<CatalogMovie>>(API_ENDPOINTS.MOVIES.UPCOMING)).data.map(
      (movie) => toCard(movie, true),
    ),
  advertisements: async (): Promise<CatalogAdvertisement[]> =>
    (
      await apiGet<Page<CatalogAdvertisement>>(
        API_ENDPOINTS.ADVERTISEMENTS.LIST,
      )
    ).data,
  promotions: async (): Promise<CatalogPromotion[]> =>
    (await apiGet<Page<CatalogPromotion>>(API_ENDPOINTS.PROMOTIONS.LIST)).data,
};

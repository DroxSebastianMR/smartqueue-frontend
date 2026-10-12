import { MovieProjectionFormat } from '@/features/home/enums/movie-projection-format.enum';
import { MovieMediaProvider } from '@/features/home/enums/movie-media-provider.enum';
import type { FeaturedMovieView, MovieCardView } from '@/features/home/types/home.types';
import type { ApiBanner, ApiMovie } from '@/infrastructure/api/home/types/home-api.types';

const FORMAT_LABELS: Record<MovieProjectionFormat, string> = {
  [MovieProjectionFormat.TWO_D]: '2D',
  [MovieProjectionFormat.THREE_D]: '3D',
  [MovieProjectionFormat.INFINITY_VISION]: 'Infinity Vision',
};

export function mapMovieCard(movie: ApiMovie, upcoming: boolean): MovieCardView {
  const formats = [...new Set(movie.versions.map((version) => FORMAT_LABELS[version.format] ?? version.format))];
  const duration = movie.durationMinutes
    ? `${Math.floor(movie.durationMinutes / 60)}h ${String(movie.durationMinutes % 60).padStart(2, '0')}m`
    : 'Por confirmar';

  return {
    id: movie.slug,
    title: movie.title,
    poster: movie.posterUrl,
    genre: movie.genres.join(' · ') || (upcoming ? 'Próximo estreno' : 'En cartelera'),
    duration,
    rating: movie.ageRating ?? 'TBC',
    format: formats.join(' · ') || 'Por confirmar',
    releaseTag: movie.presale ? 'Preventa' : upcoming ? 'Próximamente' : 'En cartelera',
    bookable: !upcoming || movie.presale,
  };
}

export function mapFeaturedMovie(banner: ApiBanner, movie: ApiMovie): FeaturedMovieView {
  return {
    movieId: movie.slug,
    title: movie.title,
    synopsis: movie.synopsis,
    ageRating: movie.ageRating,
    releaseDate: movie.releaseDate,
    presale: movie.presale,
    logoUrl: banner.logoUrl,
    formats: [...new Set(movie.versions.map((version) => version.format))],
    hasLatinAudio: movie.versions.some((version) => version.audioLanguage === 'es-419'),
    cta: banner.cta,
    media: banner.video
      ? { type: banner.video.provider === MovieMediaProvider.YOUTUBE ? 'youtube' : 'video', src: banner.video.url, poster: banner.backdropUrl }
      : { type: 'image', src: banner.backdropUrl },
  };
}

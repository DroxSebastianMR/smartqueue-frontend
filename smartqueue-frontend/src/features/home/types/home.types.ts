import type { MovieProjectionFormat } from '@/features/home/enums/movie-projection-format.enum';

export interface MovieCardView {
  id: string;
  title: string;
  poster: string;
  genre: string;
  duration: string;
  rating: string;
  format: string;
  releaseTag: string;
  bookable: boolean;
}

export interface FeaturedMovieView {
  movieId: string;
  title: string;
  synopsis: string | null;
  ageRating: string | null;
  releaseDate: string | null;
  presale: boolean;
  logoUrl: string | null;
  formats: MovieProjectionFormat[];
  hasLatinAudio: boolean;
  cta: { label: string; href: string };
  media: { type: 'youtube' | 'video' | 'image'; src: string; poster?: string };
}

export interface MovieDetailView extends MovieCardView {
  synopsis: string | null;
  backdrop: string | null;
  releaseDate: string | null;
  genres: string[];
  formats: string[];
  languages: string[];
  subtitles: string[];
  presale: boolean;
}

export interface CinemaSearchFilters {
  movieSlug: string;
  city: string;
  cinemaSlug: string;
  date: string;
}

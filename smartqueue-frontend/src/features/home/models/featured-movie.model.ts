import type { MovieFormat } from '@/features/home/enums/movie-format.enum';
import type { MovieLanguage } from '@/features/home/enums/movie-language.enum';

export interface FeaturedMovie {
  movieId: string;
  title: string;
  releaseDate: string;
  presale: boolean;
  formats: MovieFormat[];
  languages: MovieLanguage[];
  media?: { type: 'youtube' | 'video'; src: string; poster?: string };
}

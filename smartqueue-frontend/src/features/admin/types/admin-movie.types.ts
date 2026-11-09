export const MOVIE_PUBLICATION_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export type MoviePublicationStatus = (typeof MOVIE_PUBLICATION_STATUSES)[number];
export type AdminCatalogFilter = 'ALL' | 'NOW_PLAYING' | 'UPCOMING' | MoviePublicationStatus;
export type MovieCatalogSection = 'NOW_PLAYING' | 'UPCOMING';

export interface AdminMovieVersion {
  id: string;
  format: string;
  audioLanguage: string;
  subtitleLanguage: string | null;
}

export interface AdminMovie {
  slug: string;
  title: string;
  synopsis: string | null;
  posterUrl: string;
  backdropUrl: string | null;
  releaseDate: string | null;
  durationMinutes: number | null;
  ageRating: string | null;
  genres: string[];
  versions: AdminMovieVersion[];
  presale: boolean;
  publicationStatus: MoviePublicationStatus;
  sections: string[];
}

export interface AdminMoviePage {
  data: AdminMovie[];
  meta: {
    page: number;
    limit: number;
    count: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface AdminMoviesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MoviePublicationStatus;
  section?: MovieCatalogSection;
}

export interface CreateAdminMovieInput {
  slug: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate?: string;
  synopsis?: string;
  durationMinutes?: number;
  ageRating?: string;
  presale?: boolean;
  genres?: string[];
}

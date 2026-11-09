import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminMoviesService } from '@/features/admin/services/admin-movies.service';
import type { AdminMoviesQuery, CreateAdminMovieInput, MovieCatalogSection, MoviePublicationStatus } from '@/features/admin/types/admin-movie.types';

const moviesKey = ['admin', 'movies'] as const;

const statuses: MoviePublicationStatus[] = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];
const sections: MovieCatalogSection[] = ['NOW_PLAYING', 'UPCOMING'];

export function useAdminMovies(query: AdminMoviesQuery = {}) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: moviesKey });
  const statusPages = useQueries({
    queries: statuses.map((status) => ({
      queryKey: [...moviesKey, 'count', status],
      queryFn: () => adminMoviesService.list({ status, limit: 1 }),
      staleTime: 20_000,
    })),
  });
  const sectionPages = useQueries({
    queries: sections.map((section) => ({
      queryKey: [...moviesKey, 'count', section],
      queryFn: () => adminMoviesService.list({ section, limit: 1 }),
      staleTime: 20_000,
    })),
  });
  return {
    movies: useQuery({ queryKey: [...moviesKey, query], queryFn: () => adminMoviesService.list(query) }),
    statusCounts: Object.fromEntries(statuses.map((status, index) => [status, statusPages[index].data?.meta.total ?? 0])) as Record<MoviePublicationStatus, number>,
    sectionCounts: Object.fromEntries(sections.map((section, index) => [section, sectionPages[index].data?.meta.total ?? 0])) as Record<MovieCatalogSection, number>,
    create: useMutation({ mutationFn: (input: CreateAdminMovieInput) => adminMoviesService.create(input), onSuccess: refresh }),
    publish: useMutation({ mutationFn: adminMoviesService.publish, onSuccess: refresh }),
    unpublish: useMutation({ mutationFn: adminMoviesService.unpublish, onSuccess: refresh }),
  };
}

import { apiClient, apiGet, apiPost } from '@/infrastructure/api/client/axios.instance';
import type {
  AdminMovie,
  AdminMoviePage,
  AdminMoviesQuery,
  CreateAdminMovieInput,
} from '@/features/admin/types/admin-movie.types';

const basePath = '/admin/movies';

const pageLimit = 10;

function toQueryString(query: AdminMoviesQuery = {}) {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(Math.min(query.limit ?? pageLimit, pageLimit)),
  });
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.status) params.set('status', query.status);
  if (query.section) params.set('section', query.section);
  return params.toString();
}

export const adminMoviesService = {
  list: (query?: AdminMoviesQuery) => apiGet<AdminMoviePage>(`${basePath}?${toQueryString(query)}`),
  create: (input: CreateAdminMovieInput) => apiPost<AdminMovie>(basePath, input),
  publish: async (slug: string) => (await apiClient.post<AdminMovie>(`${basePath}/${encodeURIComponent(slug)}/publish`)).data,
  unpublish: async (slug: string) => (await apiClient.post<AdminMovie>(`${basePath}/${encodeURIComponent(slug)}/unpublish`)).data,
};

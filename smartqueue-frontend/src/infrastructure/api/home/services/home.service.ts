import { apiClient } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { CinemaSearchFilters } from '@/features/home/types/home.types';
import { mapFeaturedMovie, mapMovieCard } from '@/infrastructure/api/home/mappers/home.mapper';
import type {
  ApiAdvertisement,
  ApiBanner,
  ApiCinema,
  ApiMovie,
  ApiPage,
  ApiPromotion,
  ApiShowtime,
} from '@/infrastructure/api/home/types/home-api.types';

export const homeService = {
  async featured() {
    const { data: banners } = await apiClient.get<ApiPage<ApiBanner>>(API_ENDPOINTS.BANNERS.LIST, { params: { limit: 10 } });
    const movies = await Promise.allSettled(banners.data.map(async (banner) => {
      const { data: movie } = await apiClient.get<ApiMovie>(API_ENDPOINTS.MOVIES.DETAIL(banner.movieSlug));
      return mapFeaturedMovie(banner, movie);
    }));
    const featured = movies.filter((result) => result.status === 'fulfilled').map((result) => result.value);
    if (banners.data.length > 0 && featured.length === 0) throw new Error('No se pudieron cargar los banners destacados');
    return featured;
  },
  async nowPlaying() {
    const { data } = await apiClient.get<ApiPage<ApiMovie>>(API_ENDPOINTS.MOVIES.NOW_PLAYING, { params: { limit: 10 } });
    return data.data.map((movie) => mapMovieCard(movie, false));
  },
  async upcoming() {
    const { data } = await apiClient.get<ApiPage<ApiMovie>>(API_ENDPOINTS.MOVIES.UPCOMING, { params: { limit: 10 } });
    return data.data.map((movie) => mapMovieCard(movie, true));
  },
  async advertisements() {
    const { data } = await apiClient.get<ApiPage<ApiAdvertisement>>(API_ENDPOINTS.ADVERTISEMENTS.LIST);
    return data.data;
  },
  async promotions() {
    const { data } = await apiClient.get<ApiPage<ApiPromotion>>(API_ENDPOINTS.PROMOTIONS.LIST);
    return data.data;
  },
  async cinemas() {
    const { data } = await apiClient.get<ApiPage<ApiCinema>>(API_ENDPOINTS.CINEMAS.LIST, { params: { limit: 10 } });
    return data.data;
  },
  async showtimes(filters: CinemaSearchFilters) {
    const { data } = await apiClient.get<ApiPage<ApiShowtime>>(API_ENDPOINTS.SHOWTIMES.LIST, {
      params: {
        limit: 10,
        ...(filters.movieSlug && { movieSlug: filters.movieSlug }),
        ...(filters.cinemaSlug && { cinemaSlug: filters.cinemaSlug }),
        ...(filters.city && { city: filters.city }),
        ...(filters.date && { date: filters.date }),
      },
    });
    return data.data;
  },
};

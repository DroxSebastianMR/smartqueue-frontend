import { useQuery } from '@tanstack/react-query';

import { homeQueryKeys } from '@/features/home/constants/home-query-keys';
import type { CinemaSearchFilters } from '@/features/home/types/home.types';
import { homeService } from '@/infrastructure/api/home/services/home.service';

export const useNowPlayingMovies = () =>
  useQuery({ queryKey: homeQueryKeys.nowPlaying, queryFn: homeService.nowPlaying });

export const useUpcomingMovies = () =>
  useQuery({ queryKey: homeQueryKeys.upcoming, queryFn: homeService.upcoming });

export const useHomeAdvertisements = () =>
  useQuery({ queryKey: homeQueryKeys.advertisements, queryFn: homeService.advertisements });

export const useHomePromotions = () =>
  useQuery({ queryKey: homeQueryKeys.promotions, queryFn: homeService.promotions });

export const useHomeCinemas = () =>
  useQuery({ queryKey: homeQueryKeys.cinemas, queryFn: homeService.cinemas });

export const useHomeShowtimes = (filters: CinemaSearchFilters | null) =>
  useQuery({
    queryKey: filters
      ? homeQueryKeys.showtimes(filters.movieSlug, filters.city, filters.cinemaSlug, filters.date)
      : ['home', 'showtimes', 'idle'],
    queryFn: () => homeService.showtimes(filters!),
    enabled: filters !== null,
  });

import { useQuery } from '@tanstack/react-query';

import { homeQueryKeys } from '@/features/home/constants/home-query-keys';
import { homeService } from '@/infrastructure/api/home/services/home.service';

export function useFeaturedMovie() {
  return useQuery({ queryKey: homeQueryKeys.featured, queryFn: homeService.featured });
}

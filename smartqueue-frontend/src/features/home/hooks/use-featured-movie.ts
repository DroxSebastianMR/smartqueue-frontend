import { useQuery } from '@tanstack/react-query';

import { homeService } from '@/features/home/services/home.service';

export function useFeaturedMovie() {
  return useQuery({ queryKey: ['home', 'featured'], queryFn: homeService.featured, retry: 1 });
}

import type { ConcessionCategory } from '@/features/concessions/enums/concession-category.enum';
import type { ConcessionProduct } from '@/features/concessions/types/concession.types';
import { apiClient } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import { mapConcessionProduct } from '@/infrastructure/api/concessions/mappers/concessions.mapper';
import type { ApiConcessionProduct } from '@/infrastructure/api/concessions/types/concessions-api.types';
import type { ApiPage } from '@/infrastructure/api/home/types/home-api.types';

export const concessionsService = {
  async catalog(category?: ConcessionCategory): Promise<ConcessionProduct[]> {
    const { data } = await apiClient.get<ApiPage<ApiConcessionProduct>>(API_ENDPOINTS.CONCESSIONS.CATALOG, {
      params: { limit: 10, ...(category ? { category } : {}) },
    });
    return data.data.map(mapConcessionProduct);
  },
};

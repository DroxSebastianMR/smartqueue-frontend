import { useQuery } from '@tanstack/react-query';

import type { ConcessionCategory } from '@/features/concessions/enums/concession-category.enum';
import { concessionsService } from '@/infrastructure/api/concessions/services/concessions.service';

export const useConcessionsCatalog = (category?: ConcessionCategory) =>
  useQuery({ queryKey: ['concessions', 'catalog', category ?? 'all'], queryFn: () => concessionsService.catalog(category) });

import type { ConcessionCategory } from '@/features/concessions/enums/concession-category.enum';

export interface ApiConcessionProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ConcessionCategory;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  available: boolean;
  featured: boolean;
}

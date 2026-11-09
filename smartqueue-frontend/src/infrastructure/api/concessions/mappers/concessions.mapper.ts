import type { ConcessionProduct } from '@/features/concessions/types/concession.types';
import type { ApiConcessionProduct } from '@/infrastructure/api/concessions/types/concessions-api.types';

export function mapConcessionProduct(product: ApiConcessionProduct): ConcessionProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
    currency: product.currency,
    featured: product.featured,
  };
}

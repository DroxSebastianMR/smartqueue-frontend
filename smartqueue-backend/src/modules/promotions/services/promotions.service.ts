import { Inject, Injectable } from "@nestjs/common";
import {
  CompactListQueryDto,
  paginate,
  type Page,
} from "@/modules/catalog/dto/list-query.dto";
import {
  CATALOG_REPOSITORY,
  type CatalogPromotion,
  type CatalogRepository,
} from "@/modules/catalog/repositories/demo-catalog.repository";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";

@Injectable()
export class PromotionsService {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly repository: CatalogRepository,
    private readonly cache: CatalogCacheService,
  ) {}
  list(query: CompactListQueryDto): Promise<Page<CatalogPromotion>> {
    return this.cache.remember(`promotions:${query.page}:${query.limit}`, () =>
      paginate(this.repository.listPromotions(), query),
    );
  }
}

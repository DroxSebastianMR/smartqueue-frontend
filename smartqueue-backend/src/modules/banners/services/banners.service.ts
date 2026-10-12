import { Inject, Injectable } from "@nestjs/common";
import {
  ListQueryDto,
  paginate,
  type Page,
} from "@/modules/catalog/dto/list-query.dto";
import {
  CATALOG_REPOSITORY,
  type CatalogBanner,
  type CatalogRepository,
} from "@/modules/catalog/repositories/demo-catalog.repository";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";

@Injectable()
export class BannersService {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly repository: CatalogRepository,
    private readonly cache: CatalogCacheService,
  ) {}
  list(query: ListQueryDto): Promise<Page<CatalogBanner>> {
    return this.cache.remember(`banners:${query.page}:${query.limit}`, () =>
      paginate(this.repository.listBanners(), query),
    );
  }
}

import { Module } from "@nestjs/common";
import { CATALOG_REPOSITORY } from "@/modules/catalog/repositories/demo-catalog.repository";
import { InMemoryMovieRepository } from "@/modules/movies/repositories/in-memory-movie.repository";
import { InMemoryShowtimeRepository } from "@/modules/showtimes/repositories/in-memory-showtime.repository";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";

@Module({
  providers: [
    { provide: CATALOG_REPOSITORY, useClass: InMemoryMovieRepository },
    CatalogCacheService,
    InMemoryShowtimeRepository,
  ],
  exports: [
    CATALOG_REPOSITORY,
    CatalogCacheService,
    InMemoryShowtimeRepository,
  ],
})
export class CatalogModule {}

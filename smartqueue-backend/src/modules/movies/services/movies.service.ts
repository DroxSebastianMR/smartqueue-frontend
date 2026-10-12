import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import {
  ListQueryDto,
  paginate,
  type Page,
} from "@/modules/catalog/dto/list-query.dto";
import {
  CATALOG_REPOSITORY,
  type CatalogMovie,
  type CatalogTrailer,
  type CatalogRepository,
} from "@/modules/catalog/repositories/demo-catalog.repository";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";
import { MovieErrorCode } from "@/modules/movies/enums/movie-error-code.enum";
import {
  type MovieSearchQueryDto,
  type MovieRankingDto,
} from "@/modules/movies/dto/manage-movie.dto";
import { InMemoryMovieRepository } from "@/modules/movies/repositories/in-memory-movie.repository";
import { MoviePublicationStatus } from "@/modules/movies/enums/movie-catalog.enum";

@Injectable()
export class MoviesService {
  constructor(
    @Inject(CATALOG_REPOSITORY) private readonly repository: CatalogRepository,
    private readonly cache: CatalogCacheService,
  ) {}

  nowPlaying(query: ListQueryDto): Promise<Page<CatalogMovie>> {
    return this.cache.remember(
      `movies:now-playing:${query.page}:${query.limit}`,
      () => paginate(this.repository.listNowPlaying(), query),
    );
  }
  upcoming(query: ListQueryDto): Promise<Page<CatalogMovie>> {
    return this.cache.remember(
      `movies:upcoming:${query.page}:${query.limit}`,
      () => paginate(this.repository.listUpcoming(), query),
    );
  }
  detail(slug: string): CatalogMovie {
    const movie = this.repository.findMovie(slug);
    if (!movie)
      throw new AppException(
        MovieErrorCode.MOVIE_NOT_FOUND,
        "Película no encontrada",
        HttpStatus.NOT_FOUND,
      );
    return movie;
  }
  trailers(slug: string): readonly CatalogTrailer[] {
    this.detail(slug);
    return this.repository.listTrailers(slug);
  }

  search(query: MovieSearchQueryDto): Page<CatalogMovie> {
    const repository = this.repository as InMemoryMovieRepository;
    const term = query.search?.trim().toLocaleLowerCase("es-PE");
    const genre = query.genre?.trim().toLocaleLowerCase("es-PE");
    const movies = repository
      .listAll()
      .filter(
        (movie) => movie.publicationStatus === MoviePublicationStatus.PUBLISHED,
      )
      .filter(
        (movie) =>
          !term || movie.title.toLocaleLowerCase("es-PE").includes(term),
      )
      .filter(
        (movie) =>
          !genre ||
          movie.genres.some(
            (item) => item.toLocaleLowerCase("es-PE") === genre,
          ),
      );
    return paginate(movies, query);
  }

  topSelling(): MovieRankingDto {
    return { status: "NO_SALES_DATA", data: [], calculatedAt: null };
  }
}

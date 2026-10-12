import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { ListQueryDto } from "@/modules/catalog/dto/list-query.dto";
import type {
  CatalogMovie,
  CatalogTrailer,
} from "@/modules/catalog/repositories/demo-catalog.repository";
import type { Page } from "@/modules/catalog/dto/list-query.dto";
import {
  MoviePageDto,
  MovieResponseDto,
  MovieTrailerDto,
} from "@/modules/movies/dto/movie-response.dto";
import { MoviesService } from "@/modules/movies/services/movies.service";
import { MovieErrorCode } from "@/modules/movies/enums/movie-error-code.enum";
import {
  MovieRankingDto,
  MovieSearchQueryDto,
} from "@/modules/movies/dto/manage-movie.dto";

@ApiTags("movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  @ApiOperation({ summary: "Buscar películas publicadas" })
  @ApiOkResponse({ type: MoviePageDto })
  search(@Query() query: MovieSearchQueryDto): Page<CatalogMovie> {
    return this.movies.search(query);
  }

  @Get("rankings/top-selling")
  @ApiOperation({
    summary: "Ranking por entradas pagadas",
    description:
      "No inventa ventas: hasta integrar tickets/pagos devuelve estado NO_SALES_DATA y lista vacía.",
  })
  @ApiOkResponse({ type: MovieRankingDto })
  topSelling(): MovieRankingDto {
    return this.movies.topSelling();
  }

  @Get("now-playing")
  @ApiOperation({
    summary: "Cartelera para la portada; máximo 10 por página",
    description:
      "Catálogo de demostración; la disponibilidad real dependerá de funciones y cine.",
  })
  @ApiOkResponse({ type: MoviePageDto })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Paginación inválida",
    path: "/api/v1/movies/now-playing",
  })
  nowPlaying(@Query() query: ListQueryDto): Promise<Page<CatalogMovie>> {
    return this.movies.nowPlaying(query);
  }

  @Get("upcoming")
  @ApiOperation({
    summary: "Próximos estrenos; máximo 10 por página",
    description:
      "La selección de demostración no valida calendarios de estreno reales.",
  })
  @ApiOkResponse({ type: MoviePageDto })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Paginación inválida",
    path: "/api/v1/movies/upcoming",
  })
  upcoming(@Query() query: ListQueryDto): Promise<Page<CatalogMovie>> {
    return this.movies.upcoming(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Ficha de película por slug" })
  @ApiParam({ name: "slug", example: "avengers-doomsday" })
  @ApiOkResponse({ type: MovieResponseDto })
  @ApiErrors({
    status: 404,
    code: MovieErrorCode.MOVIE_NOT_FOUND,
    message: "Película no encontrada",
    path: "/api/v1/movies/:slug",
  })
  detail(@Param("slug") slug: string): CatalogMovie {
    return this.movies.detail(slug);
  }

  @Get(":slug/trailers")
  @ApiOperation({ summary: "Tráilers y avances de una película" })
  @ApiParam({ name: "slug", example: "avengers-doomsday" })
  @ApiOkResponse({ type: MovieTrailerDto, isArray: true })
  @ApiErrors({
    status: 404,
    code: MovieErrorCode.MOVIE_NOT_FOUND,
    message: "Película no encontrada",
    path: "/api/v1/movies/:slug/trailers",
  })
  trailers(@Param("slug") slug: string): readonly CatalogTrailer[] {
    return this.movies.trailers(slug);
  }
}

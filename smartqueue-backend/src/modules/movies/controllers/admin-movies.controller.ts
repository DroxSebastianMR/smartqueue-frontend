import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ErrorResponseDto } from "@/common/dto/error-response.dto";
import { type Page } from "@/modules/catalog/dto/list-query.dto";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import {
  AdminMovieQueryDto,
  CreateMovieAssetDto,
  CreateMovieDto,
  CreateMovieVersionDto,
  ManagedMovieDto,
  ManagedMoviePageDto,
  MovieAssetDto,
  MoviePlacementDto,
  UpdateMovieDto,
} from "@/modules/movies/dto/manage-movie.dto";
import { MovieCatalogSection } from "@/modules/movies/enums/movie-catalog.enum";
import { MovieVersionDto } from "@/modules/movies/dto/movie-response.dto";
import { ManageMoviesService } from "@/modules/movies/services/manage-movies.service";
import {
  type ManagedMovie,
  type StoredMovieAsset,
} from "@/modules/movies/repositories/in-memory-movie.repository";

@ApiTags("admin/movies")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: "JWT requerido",
})
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: "Permiso MOVIE_MANAGE requerido",
})
@ApiResponse({
  status: 400,
  type: ErrorResponseDto,
  description: "DTO o parámetro inválido",
})
@ApiResponse({
  status: 404,
  type: ErrorResponseDto,
  description: "Película o recurso no encontrado",
})
@ApiResponse({
  status: 409,
  type: ErrorResponseDto,
  description: "Conflicto de publicación o funciones futuras",
})
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.MOVIE_MANAGE)
@Controller("admin/movies")
export class AdminMoviesController {
  constructor(private readonly movies: ManageMoviesService) {}

  @Get()
  @ApiOperation({
    summary: "Listar películas, incluyendo borradores y archivadas",
  })
  @ApiOkResponse({ type: ManagedMoviePageDto })
  list(@Query() query: AdminMovieQueryDto): Page<ManagedMovie> {
    return this.movies.list(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Consultar ficha administrativa" })
  @ApiOkResponse({ type: ManagedMovieDto })
  detail(@Param("slug") slug: string): ManagedMovie {
    return this.movies.detail(slug);
  }

  @Post()
  @ApiOperation({ summary: "Registrar película como borrador" })
  @ApiCreatedResponse({ type: ManagedMovieDto })
  create(@Body() input: CreateMovieDto): Promise<ManagedMovie> {
    return this.movies.create(input);
  }

  @Patch(":slug")
  @ApiOperation({ summary: "Editar datos de película sin cambiar el slug" })
  @ApiOkResponse({ type: ManagedMovieDto })
  update(
    @Param("slug") slug: string,
    @Body() input: UpdateMovieDto,
  ): Promise<ManagedMovie> {
    return this.movies.update(slug, input);
  }

  @Delete(":slug")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archivar película sin borrar historial" })
  @ApiNoContentResponse()
  archive(@Param("slug") slug: string): Promise<void> {
    return this.movies.archive(slug);
  }

  @Post(":slug/publish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Publicar película" })
  @ApiOkResponse({ type: ManagedMovieDto })
  publish(@Param("slug") slug: string): Promise<ManagedMovie> {
    return this.movies.publish(slug);
  }

  @Post(":slug/unpublish")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retirar película de la vista pública" })
  @ApiOkResponse({ type: ManagedMovieDto })
  unpublish(@Param("slug") slug: string): Promise<ManagedMovie> {
    return this.movies.unpublish(slug);
  }

  @Put(":slug/placements/:section")
  @ApiOperation({ summary: "Asignar o reordenar sección de portada" })
  @ApiParam({ name: "section", enum: MovieCatalogSection })
  @ApiOkResponse({ type: ManagedMovieDto })
  place(
    @Param("slug") slug: string,
    @Param("section", new ParseEnumPipe(MovieCatalogSection))
    section: MovieCatalogSection,
    @Body() input: MoviePlacementDto,
  ): Promise<ManagedMovie> {
    return this.movies.place(slug, section, input);
  }

  @Delete(":slug/placements/:section")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Retirar de una sección sin despublicar" })
  @ApiParam({ name: "section", enum: MovieCatalogSection })
  @ApiNoContentResponse()
  unplace(
    @Param("slug") slug: string,
    @Param("section", new ParseEnumPipe(MovieCatalogSection))
    section: MovieCatalogSection,
  ): Promise<void> {
    return this.movies.unplace(slug, section);
  }

  @Get(":slug/versions")
  @ApiOperation({ summary: "Formatos, doblajes y subtítulos configurados" })
  @ApiOkResponse({ type: MovieVersionDto, isArray: true })
  versions(@Param("slug") slug: string) {
    return this.movies.versions(slug);
  }

  @Post(":slug/versions")
  @ApiOperation({ summary: "Agregar versión de exhibición" })
  @ApiCreatedResponse({ type: MovieVersionDto })
  addVersion(
    @Param("slug") slug: string,
    @Body() input: CreateMovieVersionDto,
  ) {
    return this.movies.addVersion(slug, input);
  }

  @Delete(":slug/versions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar versión sin funciones asociadas" })
  @ApiNoContentResponse()
  removeVersion(
    @Param("slug") slug: string,
    @Param("id") id: string,
  ): Promise<void> {
    return this.movies.removeVersion(slug, id);
  }

  @Get(":slug/assets")
  @ApiOperation({ summary: "Material gráfico y audiovisual" })
  @ApiOkResponse({ type: MovieAssetDto, isArray: true })
  assets(@Param("slug") slug: string): StoredMovieAsset[] {
    return this.movies.assets(slug);
  }

  @Post(":slug/assets")
  @ApiOperation({ summary: "Registrar URL de póster, fondo, logo o video" })
  @ApiCreatedResponse({ type: MovieAssetDto })
  addAsset(
    @Param("slug") slug: string,
    @Body() input: CreateMovieAssetDto,
  ): Promise<StoredMovieAsset> {
    return this.movies.addAsset(slug, input);
  }

  @Delete(":slug/assets/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Retirar material audiovisual" })
  @ApiNoContentResponse()
  removeAsset(
    @Param("slug") slug: string,
    @Param("id") id: string,
  ): Promise<void> {
    return this.movies.removeAsset(slug, id);
  }
}

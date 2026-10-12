import { HttpStatus, Inject, Injectable, Optional } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AppException } from "@/common/exceptions/app.exception";
import { paginate, type Page } from "@/modules/catalog/dto/list-query.dto";
import { CATALOG_REPOSITORY } from "@/modules/catalog/repositories/demo-catalog.repository";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";
import {
  type AdminMovieQueryDto,
  type CreateMovieAssetDto,
  type CreateMovieDto,
  type CreateMovieVersionDto,
  type UpdateMovieDto,
  type MoviePlacementDto,
} from "@/modules/movies/dto/manage-movie.dto";
import {
  MovieCatalogSection,
  MovieAssetKind,
  MovieMediaProvider,
  MoviePublicationStatus,
} from "@/modules/movies/enums/movie-catalog.enum";
import { MovieErrorCode } from "@/modules/movies/enums/movie-error-code.enum";
import {
  InMemoryMovieRepository,
  type ManagedMovie,
  type StoredMovieAsset,
} from "@/modules/movies/repositories/in-memory-movie.repository";
import { InMemoryShowtimeRepository } from "@/modules/showtimes/repositories/in-memory-showtime.repository";

@Injectable()
export class ManageMoviesService {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly repository: InMemoryMovieRepository,
    private readonly cache: CatalogCacheService,
    private readonly showtimes: InMemoryShowtimeRepository,
    @Optional() private readonly db?: PrismaService,
  ) {}

  list(query: AdminMovieQueryDto): Page<ManagedMovie> {
    const term = query.search?.trim().toLocaleLowerCase("es-PE");
    return paginate(
      this.repository
        .listAll()
        .filter(
          (movie) => !query.status || movie.publicationStatus === query.status,
        )
        .filter(
          (movie) =>
            !term || movie.title.toLocaleLowerCase("es-PE").includes(term),
        ),
      query,
    );
  }
  detail(slug: string): ManagedMovie {
    return this.repository.findManaged(slug) ?? this.notFound();
  }
  async create(input: CreateMovieDto): Promise<ManagedMovie> {
    if (this.dbEnabled()) {
      if (this.repository.findManaged(input.slug)) this.conflict("La película ya existe");
      await this.db!.movie.create({ data: {
        slug: input.slug, title: input.title, synopsis: input.synopsis,
        posterUrl: input.posterUrl, backdropUrl: input.backdropUrl,
        releaseDate: input.releaseDate ? new Date(`${input.releaseDate}T00:00:00Z`) : null,
        durationMin: input.durationMinutes, ageRating: input.ageRating,
      } });
      await this.syncRelease(input.slug, input.releaseDate, input.presale);
      await this.syncGenres(input.slug, input.genres ?? []);
      await this.refresh();
      return this.detail(input.slug);
    }
    const movie = this.repository.create(input);
    if (!movie) this.conflict("La película ya existe");
    await this.cache.invalidate("movies");
    return movie!;
  }
  async update(slug: string, input: UpdateMovieDto): Promise<ManagedMovie> {
    if (this.dbEnabled()) {
      this.detail(slug);
      await this.db!.movie.update({ where: { slug }, data: {
        title: input.title, synopsis: input.synopsis, posterUrl: input.posterUrl,
        backdropUrl: input.backdropUrl,
        releaseDate: input.releaseDate === undefined ? undefined : input.releaseDate ? new Date(`${input.releaseDate}T00:00:00Z`) : null,
        durationMin: input.durationMinutes, ageRating: input.ageRating,
      } });
      if (input.releaseDate !== undefined || input.presale !== undefined)
        await this.syncRelease(slug, input.releaseDate, input.presale);
      if (input.genres) await this.syncGenres(slug, input.genres);
      await this.refresh();
      return this.detail(slug);
    }
    const movie = this.repository.update(slug, input) ?? this.notFound();
    await this.cache.invalidate("movies");
    return movie;
  }
  async archive(slug: string): Promise<void> {
    this.detail(slug);
    if (this.showtimes.hasActiveForMovie(slug))
      this.conflict("Cancela primero las funciones futuras de la película");
    if (this.dbEnabled()) {
      await this.db!.movie.update({ where: { slug }, data: { publicationStatus: "ARCHIVED", placements: { deleteMany: {} } } });
      await this.refresh(); return;
    }
    this.repository.setStatus(slug, MoviePublicationStatus.ARCHIVED);
    await this.cache.invalidate("movies");
  }
  async publish(slug: string): Promise<ManagedMovie> {
    const current = this.detail(slug);
    if (current.publicationStatus === MoviePublicationStatus.ARCHIVED)
      this.conflict("No se puede publicar una película archivada");
    if (!current.title || !current.posterUrl)
      this.conflict("Título y póster son obligatorios para publicar");
    if (this.dbEnabled()) {
      await this.db!.movie.update({ where: { slug }, data: { publicationStatus: "PUBLISHED" } });
      await this.refresh(); return this.detail(slug);
    }
    const movie = this.repository.setStatus(
      slug,
      MoviePublicationStatus.PUBLISHED,
    )!;
    await this.cache.invalidate("movies");
    return movie;
  }
  async unpublish(slug: string): Promise<ManagedMovie> {
    const current = this.detail(slug);
    if (current.publicationStatus === MoviePublicationStatus.ARCHIVED)
      this.conflict("La película está archivada");
    if (this.showtimes.hasActiveForMovie(slug))
      this.conflict("Cancela primero las funciones futuras de la película");
    if (this.dbEnabled()) {
      await this.db!.movie.update({ where: { slug }, data: { publicationStatus: "DRAFT" } });
      await this.refresh(); return this.detail(slug);
    }
    const movie = this.repository.setStatus(
      slug,
      MoviePublicationStatus.DRAFT,
    )!;
    await this.cache.invalidate("movies");
    return movie;
  }
  async place(
    slug: string,
    section: MovieCatalogSection,
    input: MoviePlacementDto,
  ): Promise<ManagedMovie> {
    const current = this.detail(slug);
    if (current.publicationStatus !== MoviePublicationStatus.PUBLISHED)
      this.conflict("Publica la película antes de colocarla en portada");
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      await this.db!.movieCatalogPlacement.upsert({
        where: { movieId_section: { movieId, section } },
        create: { movieId, section, priority: input.priority },
        update: { priority: input.priority },
      });
      await this.refresh(); return this.detail(slug);
    }
    const movie = this.repository.setPlacement(slug, section, input.priority)!;
    await this.cache.invalidate("movies");
    return movie;
  }
  async unplace(slug: string, section: MovieCatalogSection): Promise<void> {
    this.detail(slug);
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      const result = await this.db!.movieCatalogPlacement.deleteMany({ where: { movieId, section } });
      if (!result.count) this.notFound();
      await this.refresh(); return;
    }
    if (!this.repository.removePlacement(slug, section)) this.notFound();
    await this.cache.invalidate("movies");
  }
  versions(slug: string) {
    return this.detail(slug).versions;
  }
  async addVersion(slug: string, input: CreateMovieVersionDto) {
    this.detail(slug);
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      const version = await this.db!.movieVersion.create({ data: {
        movieId, format: input.format, audioLanguageCode: input.audioLanguage,
        subtitleLanguageCode: input.subtitleLanguage,
      } });
      await this.refresh();
      return { id: version.id, format: version.format, audioLanguage: version.audioLanguageCode, subtitleLanguage: version.subtitleLanguageCode };
    }
    const version = this.repository.addVersion(slug, input);
    if (!version) this.conflict("No se puede modificar una película archivada");
    await this.cache.invalidate("movies");
    return version!;
  }
  async removeVersion(slug: string, id: string): Promise<void> {
    this.detail(slug);
    if (this.showtimes.hasActiveForVersion(id))
      this.conflict("La versión tiene funciones futuras");
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      if (await this.db!.showtime.count({ where: { movieVersionId: id } }))
        this.conflict("La versión tiene funciones registradas y no se puede borrar");
      const result = await this.db!.movieVersion.deleteMany({ where: { id, movieId } });
      if (!result.count) this.versionNotFound();
      await this.refresh(); return;
    }
    if (!this.repository.removeVersion(slug, id)) this.versionNotFound();
    await this.cache.invalidate("movies");
  }
  assets(slug: string): StoredMovieAsset[] {
    this.detail(slug);
    return this.repository.listAssets(slug) ?? [];
  }
  async addAsset(
    slug: string,
    input: CreateMovieAssetDto,
  ): Promise<StoredMovieAsset> {
    this.detail(slug);
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      const asset = await this.db!.movieAsset.create({ data: {
        movieId, kind: input.kind, url: input.url,
        provider: input.provider, locale: input.locale,
      } });
      await this.refresh();
      return { id: asset.id, kind: asset.kind as MovieAssetKind, url: asset.url, provider: asset.provider as MovieMediaProvider, locale: asset.locale };
    }
    const asset = this.repository.addAsset(slug, input);
    if (!asset) this.conflict("No se puede modificar una película archivada");
    return asset!;
  }
  async removeAsset(slug: string, id: string): Promise<void> {
    this.detail(slug);
    if (this.dbEnabled()) {
      const movieId = await this.movieId(slug);
      const result = await this.db!.movieAsset.deleteMany({ where: { id, movieId } });
      if (!result.count) this.assetNotFound();
      await this.refresh(); return;
    }
    if (!this.repository.removeAsset(slug, id)) this.assetNotFound();
  }
  private dbEnabled(): boolean { return Boolean(this.db && process.env.DATABASE_URL); }
  private async movieId(slug: string): Promise<string> {
    const movie = await this.db!.movie.findUnique({ where: { slug }, select: { id: true } });
    if (!movie) this.notFound();
    return movie!.id;
  }
  private async syncGenres(slug: string, names: string[]): Promise<void> {
    const movieId = await this.movieId(slug);
    const ids: string[] = [];
    for (const name of [...new Set(names.map((item) => item.trim()).filter(Boolean))]) {
      const genreSlug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!genreSlug) continue;
      const genre = await this.db!.genre.upsert({ where: { slug: genreSlug }, create: { slug: genreSlug, name }, update: {} });
      ids.push(genre.id);
    }
    await this.db!.$transaction(async (tx) => {
      await tx.movieGenre.deleteMany({ where: { movieId } });
      if (ids.length) await tx.movieGenre.createMany({ data: ids.map((genreId) => ({ movieId, genreId })) });
    });
  }
  private async syncRelease(slug: string, releaseDate?: string | null, presale?: boolean): Promise<void> {
    const movieId = await this.movieId(slug);
    const existing = await this.db!.movieRelease.findUnique({ where: { movieId_countryCode: { movieId, countryCode: "PE" } } });
    const date = releaseDate === undefined ? existing?.releaseDate : releaseDate ? new Date(`${releaseDate}T00:00:00Z`) : null;
    if (!date) {
      if (presale) this.conflict("La preventa requiere una fecha de estreno");
      if (existing) await this.db!.movieRelease.delete({ where: { movieId_countryCode: { movieId, countryCode: "PE" } } });
      return;
    }
    await this.db!.movieRelease.upsert({
      where: { movieId_countryCode: { movieId, countryCode: "PE" } },
      create: { movieId, countryCode: "PE", releaseDate: date, status: presale ? "PRESALE" : "ANNOUNCED" },
      update: { releaseDate: date, status: presale === undefined ? undefined : presale ? "PRESALE" : "ANNOUNCED" },
    });
  }
  private async refresh(): Promise<void> {
    await this.repository.onModuleInit();
    await this.cache.invalidate("movies");
  }
  private notFound(): never {
    throw new AppException(
      MovieErrorCode.MOVIE_NOT_FOUND,
      "Película no encontrada",
      HttpStatus.NOT_FOUND,
    );
  }
  private versionNotFound(): never {
    throw new AppException(
      MovieErrorCode.MOVIE_VERSION_NOT_FOUND,
      "Versión no encontrada",
      HttpStatus.NOT_FOUND,
    );
  }
  private assetNotFound(): never {
    throw new AppException(
      MovieErrorCode.MOVIE_ASSET_NOT_FOUND,
      "Material no encontrado",
      HttpStatus.NOT_FOUND,
    );
  }
  private conflict(message: string): never {
    throw new AppException(
      MovieErrorCode.MOVIE_CONFLICT,
      message,
      HttpStatus.CONFLICT,
    );
  }
}

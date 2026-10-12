import { randomUUID } from "node:crypto";
import { Injectable, Optional, type OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  DemoCatalogRepository,
  type CatalogMovie,
  type CatalogTrailer,
  type CatalogBanner,
  type CatalogAdvertisement,
  type CatalogPromotion,
} from "@/modules/catalog/repositories/demo-catalog.repository";
import {
  type CreateMovieDto,
  type CreateMovieAssetDto,
  type CreateMovieVersionDto,
  type UpdateMovieDto,
} from "@/modules/movies/dto/manage-movie.dto";
import {
  MovieAssetKind,
  MovieCatalogSection,
  MovieMediaProvider,
  MoviePublicationStatus,
} from "@/modules/movies/enums/movie-catalog.enum";

export interface StoredMovieAsset extends CreateMovieAssetDto {
  id: string;
}
export interface ManagedMovie extends CatalogMovie {
  publicationStatus: MoviePublicationStatus;
  sections: MovieCatalogSection[];
}
interface MovieState {
  movie: CatalogMovie;
  status: MoviePublicationStatus;
  placements: Map<MovieCatalogSection, number>;
  assets: StoredMovieAsset[];
}

/** Read-optimized catalog snapshot hydrated from Postgres at startup. */
@Injectable()
export class InMemoryMovieRepository extends DemoCatalogRepository implements OnModuleInit {
  private readonly records = new Map<string, MovieState>();
  private banners: CatalogBanner[] | null = null;
  private advertisements: CatalogAdvertisement[] | null = null;
  private promotions: CatalogPromotion[] | null = null;

  constructor(@Optional() private readonly db?: PrismaService) {
    super();
    for (const [section, movies] of [
      [MovieCatalogSection.NOW_PLAYING, super.listNowPlaying()],
      [MovieCatalogSection.UPCOMING, super.listUpcoming()],
    ] as const) {
      movies.forEach((movie, priority) => {
        const existing = this.records.get(movie.slug);
        if (existing) {
          existing.placements.set(section, priority);
          return;
        }
        this.records.set(movie.slug, {
          movie: {
            ...movie,
            genres: [...movie.genres],
            versions: movie.versions.map((version) => ({
              ...version,
              id: randomUUID(),
            })),
          },
          status: MoviePublicationStatus.PUBLISHED,
          placements: new Map([[section, priority]]),
          assets: [],
        });
      });
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.db || !process.env.DATABASE_URL || process.env.NODE_ENV === "test") return;
    const [movies, banners, advertisements, promotions] = await Promise.all([
      this.db.movie.findMany({ include: { placements: true, genres: { include: { genre: true } }, versions: true, assets: true, releases: true } }),
      this.db.banner.findMany({ where: { status: "ACTIVE" }, include: { movie: { select: { slug: true } } }, orderBy: { priority: "asc" } }),
      this.db.advertisement.findMany({ where: { status: "ACTIVE" }, orderBy: { priority: "asc" } }),
      this.db.promotion.findMany({ where: { status: "ACTIVE" } }),
    ]);
    this.records.clear();
    for (const row of movies) {
      const release = row.releases.find((item) => item.countryCode === "PE");
      this.records.set(row.slug, {
        movie: {
          slug: row.slug, title: row.title, synopsis: row.synopsis,
          posterUrl: row.posterUrl ?? "", backdropUrl: row.backdropUrl,
          releaseDate: (release?.releaseDate ?? row.releaseDate)?.toISOString().slice(0, 10) ?? null,
          durationMinutes: row.durationMin, ageRating: row.ageRating,
          genres: row.genres.map((item) => item.genre.name),
          versions: row.versions.map((item) => ({ id: item.id, format: item.format, audioLanguage: item.audioLanguageCode, subtitleLanguage: item.subtitleLanguageCode })),
          presale: release?.status === "PRESALE",
        },
        status: row.publicationStatus as MoviePublicationStatus,
        placements: new Map(row.placements.map((item) => [item.section as MovieCatalogSection, item.priority])),
        assets: row.assets.map((item) => ({ id: item.id, kind: item.kind as MovieAssetKind, url: item.url, provider: item.provider as MovieMediaProvider, locale: item.locale })),
      });
    }
    this.banners = banners.map((item) => ({
      id: item.id, movieSlug: item.movie?.slug ?? "", title: item.title,
      logoUrl: item.logoUrl, backdropUrl: item.backdropUrl,
      video: item.videoUrl && (item.videoProvider === "YOUTUBE" || item.videoProvider === "LOCAL") ? { provider: item.videoProvider, url: item.videoUrl, muted: true } : null,
      cta: { label: item.ctaLabel, href: item.ctaHref }, priority: item.priority,
    }));
    this.advertisements = advertisements.map((item) => ({
      id: item.id, title: item.title, description: item.description,
      imageUrl: item.imageUrl, cta: { label: item.ctaLabel, href: item.ctaHref },
      placement: item.placement, priority: item.priority,
    }));
    this.promotions = promotions.map((item) => ({
      id: item.id, title: item.title, description: item.description,
      imageUrl: item.imageUrl, cta: { label: item.ctaLabel, href: item.ctaHref },
      startsAt: item.startsAt?.toISOString() ?? null, endsAt: item.endsAt?.toISOString() ?? null,
    }));
  }

  override listBanners(): readonly CatalogBanner[] { return this.banners ?? super.listBanners(); }
  override listAdvertisements(): readonly CatalogAdvertisement[] { return this.advertisements ?? super.listAdvertisements(); }
  override listPromotions(): readonly CatalogPromotion[] { return this.promotions ?? super.listPromotions(); }

  override listNowPlaying(): readonly CatalogMovie[] {
    return this.inSection(MovieCatalogSection.NOW_PLAYING);
  }
  override listUpcoming(): readonly CatalogMovie[] {
    return this.inSection(MovieCatalogSection.UPCOMING);
  }
  override findMovie(slug: string): CatalogMovie | undefined {
    const state = this.records.get(slug);
    return state?.status === MoviePublicationStatus.PUBLISHED
      ? this.copyMovie(state.movie)
      : undefined;
  }
  override listTrailers(slug: string): readonly CatalogTrailer[] {
    const added = (this.records.get(slug)?.assets ?? [])
      .filter(
        (asset) =>
          asset.kind === MovieAssetKind.TRAILER ||
          asset.kind === MovieAssetKind.TEASER,
      )
      .filter(
        (asset) => asset.provider === "YOUTUBE" || asset.provider === "LOCAL",
      )
      .map((asset) => ({
        id: asset.id,
        movieSlug: slug,
        provider: asset.provider as "YOUTUBE" | "LOCAL",
        url: asset.url,
        locale: asset.locale ?? "und",
        kind: asset.kind as "TRAILER" | "TEASER",
      }));
    return this.db ? added : [...super.listTrailers(slug), ...added];
  }

  listAll(): ManagedMovie[] {
    return [...this.records.values()].map((state) => this.managed(state));
  }
  findManaged(slug: string): ManagedMovie | undefined {
    const state = this.records.get(slug);
    return state ? this.managed(state) : undefined;
  }
  create(input: CreateMovieDto): ManagedMovie | undefined {
    if (this.records.has(input.slug)) return undefined;
    const state: MovieState = {
      movie: {
        slug: input.slug,
        title: input.title,
        synopsis: input.synopsis ?? null,
        posterUrl: input.posterUrl,
        backdropUrl: input.backdropUrl ?? null,
        releaseDate: input.releaseDate ?? null,
        durationMinutes: input.durationMinutes ?? null,
        ageRating: input.ageRating ?? null,
        genres: input.genres ?? [],
        versions: [],
        presale: input.presale ?? false,
      },
      status: MoviePublicationStatus.DRAFT,
      placements: new Map(),
      assets: [],
    };
    this.records.set(input.slug, state);
    return this.managed(state);
  }
  update(slug: string, input: UpdateMovieDto): ManagedMovie | undefined {
    const state = this.records.get(slug);
    if (!state || state.status === MoviePublicationStatus.ARCHIVED)
      return undefined;
    state.movie = {
      ...state.movie,
      ...input,
      genres: input.genres ? [...input.genres] : state.movie.genres,
    };
    return this.managed(state);
  }
  setStatus(
    slug: string,
    status: MoviePublicationStatus,
  ): ManagedMovie | undefined {
    const state = this.records.get(slug);
    if (!state) return undefined;
    state.status = status;
    if (status === MoviePublicationStatus.ARCHIVED) state.placements.clear();
    return this.managed(state);
  }
  setPlacement(
    slug: string,
    section: MovieCatalogSection,
    priority: number,
  ): ManagedMovie | undefined {
    const state = this.records.get(slug);
    if (!state || state.status !== MoviePublicationStatus.PUBLISHED)
      return undefined;
    state.placements.set(section, priority);
    return this.managed(state);
  }
  removePlacement(slug: string, section: MovieCatalogSection): boolean {
    return this.records.get(slug)?.placements.delete(section) ?? false;
  }
  addVersion(slug: string, input: CreateMovieVersionDto) {
    const state = this.records.get(slug);
    if (!state || state.status === MoviePublicationStatus.ARCHIVED)
      return undefined;
    const version = {
      id: randomUUID(),
      format: input.format,
      audioLanguage: input.audioLanguage,
      subtitleLanguage: input.subtitleLanguage ?? null,
    };
    state.movie.versions.push(version);
    return version;
  }
  removeVersion(slug: string, id: string): boolean {
    const state = this.records.get(slug);
    if (!state) return false;
    const originalLength = state.movie.versions.length;
    state.movie.versions = state.movie.versions.filter(
      (version) => version.id !== id,
    );
    return state.movie.versions.length !== originalLength;
  }
  listAssets(slug: string): StoredMovieAsset[] | undefined {
    const state = this.records.get(slug);
    return state ? state.assets.map((asset) => ({ ...asset })) : undefined;
  }
  addAsset(
    slug: string,
    input: CreateMovieAssetDto,
  ): StoredMovieAsset | undefined {
    const state = this.records.get(slug);
    if (!state || state.status === MoviePublicationStatus.ARCHIVED)
      return undefined;
    const asset = {
      id: randomUUID(),
      kind: input.kind,
      url: input.url,
      provider: input.provider ?? MovieMediaProvider.EXTERNAL,
      locale: input.locale ?? null,
    };
    state.assets.push(asset);
    return { ...asset };
  }
  removeAsset(slug: string, id: string): boolean {
    const state = this.records.get(slug);
    if (!state) return false;
    const originalLength = state.assets.length;
    state.assets = state.assets.filter((asset) => asset.id !== id);
    return state.assets.length !== originalLength;
  }

  private inSection(section: MovieCatalogSection): CatalogMovie[] {
    return [...this.records.values()]
      .filter(
        (state) =>
          state.status === MoviePublicationStatus.PUBLISHED &&
          state.placements.has(section),
      )
      .sort(
        (a, b) =>
          (a.placements.get(section) ?? 0) - (b.placements.get(section) ?? 0),
      )
      .map((state) => this.copyMovie(state.movie));
  }
  private managed(state: MovieState): ManagedMovie {
    return {
      ...this.copyMovie(state.movie),
      publicationStatus: state.status,
      sections: [...state.placements.keys()],
    };
  }
  private copyMovie(movie: CatalogMovie): CatalogMovie {
    return {
      ...movie,
      genres: [...movie.genres],
      versions: movie.versions.map((version) => ({ ...version })),
    };
  }
}

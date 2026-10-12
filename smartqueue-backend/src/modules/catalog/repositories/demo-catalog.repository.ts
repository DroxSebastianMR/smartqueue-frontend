import { Injectable } from "@nestjs/common";

export interface CatalogMovie {
  slug: string;
  title: string;
  synopsis: string | null;
  posterUrl: string;
  backdropUrl: string | null;
  releaseDate: string | null;
  durationMinutes: number | null;
  ageRating: string | null;
  genres: string[];
  versions: {
    id?: string;
    format: string;
    audioLanguage: string;
    subtitleLanguage: string | null;
  }[];
  presale: boolean;
}

export interface CatalogBanner {
  id: string;
  movieSlug: string;
  title: string;
  logoUrl: string | null;
  backdropUrl: string;
  video: { provider: "YOUTUBE" | "LOCAL"; url: string; muted: boolean } | null;
  cta: { label: string; href: string };
  priority: number;
}

export interface CatalogTrailer {
  id: string;
  movieSlug: string;
  provider: "YOUTUBE" | "LOCAL";
  url: string;
  locale: string;
  kind: "TRAILER" | "TEASER";
}

export interface CatalogAdvertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
  placement: "HOME" | "CHECKOUT";
  priority: number;
}

export interface CatalogPromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  cta: { label: string; href: string };
  startsAt: string | null;
  endsAt: string | null;
}

export const CATALOG_REPOSITORY = Symbol("CATALOG_REPOSITORY");

export interface CatalogRepository {
  listNowPlaying(): readonly CatalogMovie[];
  listUpcoming(): readonly CatalogMovie[];
  findMovie(slug: string): CatalogMovie | undefined;
  listTrailers(slug: string): readonly CatalogTrailer[];
  listBanners(): readonly CatalogBanner[];
  listAdvertisements(): readonly CatalogAdvertisement[];
  listPromotions(): readonly CatalogPromotion[];
}

const version = (format: string, audioLanguage = "es-419") => ({
  format,
  audioLanguage,
  subtitleLanguage: null,
});

// Datos de demostración: no representan cartelera, preventa ni derechos comerciales reales.
const nowPlaying: CatalogMovie[] = [
  {
    slug: "spider-man-brand-new-day",
    title: "Spider-Man: Un nuevo día",
    posterUrl:
      "https://www.impawards.com/2026/posters/spiderman_brand_new_day_ver17_xlg.jpg",
    genres: ["Acción", "Aventura"],
    durationMinutes: null,
    ageRating: null,
  },
  {
    slug: "blue-lock",
    title: "Blue Lock",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZDJlNTFkNmItMmM5Zi00YWYxLTg3ODgtYWNkNWJhYWNlYjdjXkEyXkFqcGc%40._V1_.jpg",
    genres: ["Anime", "Deporte"],
    durationMinutes: null,
    ageRating: null,
  },
  {
    slug: "cars-20",
    title: "Cars: 20 aniversario",
    posterUrl:
      "https://media-cine.entradas.com/images/film/cars-20-aniversario-109127.v17895696256000.jpg",
    genres: ["Animación", "Familiar"],
    durationMinutes: null,
    ageRating: null,
  },
  {
    slug: "magic-tree",
    title: "El Árbol Mágico",
    posterUrl: "https://cdn.cinemark.cl/content/posters/HO00015188.jpg",
    genres: ["Aventura", "Familiar"],
    durationMinutes: null,
    ageRating: null,
  },
].map((movie) => ({
  ...movie,
  synopsis: null,
  backdropUrl: null,
  releaseDate: null,
  versions: [version("TWO_D")],
  presale: false,
}));

const upcoming: CatalogMovie[] = [
  [
    "avengers-doomsday",
    "Avengers: Doomsday",
    "https://image.tmdb.org/t/p/original/jzPwsojjFStf5lR5Nm07w2hH56G.jpg",
  ],
  [
    "street-fighter-2026",
    "Street Fighter",
    "https://cdn.kinocheck.com/i/w%3D1200/9hgzyq4ym3.jpg",
  ],
  [
    "clayface-2026",
    "Clayface",
    "https://www.impawards.com/2026/posters/clayface_xlg.jpg",
  ],
  [
    "whalefall-2026",
    "Whalefall",
    "https://cdn.moviefone.com/admin-uploads/highlights/images/whalefall-official-teaser-poster_1781031419.webp",
  ],
  [
    "wildwood-2026",
    "Wildwood",
    "https://media2.firstshowing.net/firstshowing/img18/wildwoodfinalpostermainimgb59.jpg",
  ],
  [
    "sunrise-on-the-reaping",
    "The Hunger Games: Sunrise on the Reaping",
    "https://www.impawards.com/2026/posters/hunger_games_sunrise_on_the_reaping_xlg.jpg",
  ],
  [
    "cat-in-the-hat-2026",
    "The Cat in the Hat",
    "https://www.cinemaclock.com/images/posters/1000x1500/19/the-cat-in-the-hat-2026-orig-poster.jpg",
  ],
  [
    "the-odyssey-2026",
    "The Odyssey",
    "https://cdn.posteritati.com/posters/000/000/079/359/the-odyssey-md-web.jpg",
  ],
  [
    "godzilla-minus-zero",
    "Godzilla Minus Zero",
    "https://images.squarespace-cdn.com/content/v1/5bbcad0f2727be3646b9fee1/23b248aa-b236-4ecd-a1af-e926ea528e81/IMG_1910.jpeg",
  ],
  [
    "dune-part-three",
    "Dune: Part Three",
    "https://www.impawards.com/2026/posters/dune_part_three_xlg.jpg",
  ],
].map(([slug, title, posterUrl]) => ({
  slug,
  title,
  posterUrl,
  synopsis: null,
  backdropUrl: null,
  releaseDate: slug === "avengers-doomsday" ? "2026-12-17" : null,
  durationMinutes: null,
  ageRating: null,
  genres: [],
  versions:
    slug === "avengers-doomsday"
      ? [version("INFINITY_VISION"), version("THREE_D"), version("TWO_D")]
      : [],
  presale: slug === "avengers-doomsday",
}));

@Injectable()
export class DemoCatalogRepository implements CatalogRepository {
  listNowPlaying(): readonly CatalogMovie[] {
    return nowPlaying;
  }
  listUpcoming(): readonly CatalogMovie[] {
    return upcoming;
  }
  findMovie(slug: string): CatalogMovie | undefined {
    return [...nowPlaying, ...upcoming].find((movie) => movie.slug === slug);
  }
  listTrailers(slug: string): readonly CatalogTrailer[] {
    return slug === "avengers-doomsday"
      ? [
          {
            id: "avengers-doomsday-trailer",
            movieSlug: slug,
            provider: "YOUTUBE",
            url: "https://www.youtube.com/watch?v=lAr_uspgHm8",
            locale: "es-419",
            kind: "TRAILER",
          },
        ]
      : [];
  }
  listBanners(): readonly CatalogBanner[] {
    return [
      {
        id: "avengers-hero",
        movieSlug: "avengers-doomsday",
        title: "Avengers: Doomsday",
        logoUrl: null,
        backdropUrl: "https://i.ytimg.com/vi/lAr_uspgHm8/maxresdefault.jpg",
        video: {
          provider: "YOUTUBE",
          url: "https://www.youtube.com/watch?v=lAr_uspgHm8",
          muted: true,
        },
        cta: { label: "Comprar preventa", href: "/purchase" },
        priority: 1,
      },
    ];
  }
  listAdvertisements(): readonly CatalogAdvertisement[] {
    return [
      {
        id: "combo-canchas",
        title: "Disfruta tu combo Canchas",
        description: "Completa tu experiencia de cine.",
        imageUrl: null,
        cta: { label: "Ver combos", href: "/#promotions" },
        placement: "HOME",
        priority: 1,
      },
      {
        id: "salas-premium",
        title: "Una nueva forma de vivir el cine",
        description: "Descubre nuestros formatos de sala.",
        imageUrl: null,
        cta: { label: "Explorar", href: "/#now-playing" },
        placement: "HOME",
        priority: 2,
      },
      {
        id: "compra-anticipada",
        title: "Planea tu próxima función",
        description: "Consulta horarios y disponibilidad.",
        imageUrl: null,
        cta: { label: "Ver cartelera", href: "/#now-playing" },
        placement: "HOME",
        priority: 3,
      },
      {
        id: "cine-en-familia",
        title: "Cine en familia",
        description: "Historias para compartir.",
        imageUrl: null,
        cta: { label: "Ver películas", href: "/#now-playing" },
        placement: "HOME",
        priority: 4,
      },
      {
        id: "proximamente",
        title: "Lo que viene a Cinetrux",
        description: "Descubre los próximos estrenos.",
        imageUrl: null,
        cta: { label: "Descubrir", href: "/#upcoming" },
        placement: "HOME",
        priority: 5,
      },
    ];
  }
  listPromotions(): readonly CatalogPromotion[] {
    return [
      {
        id: "combo-canchas-demo",
        title: "Combo Canchas",
        description: "Promoción de demostración; precio y vigencia pendientes.",
        imageUrl: null,
        cta: { label: "Conocer más", href: "/purchase" },
        startsAt: null,
        endsAt: null,
      },
    ];
  }
}

import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";
import { InMemoryCinemaRepository } from "@/modules/cinemas/repositories/in-memory-cinema.repository";
import {
  MovieCatalogSection,
  MovieProjectionFormat,
  MoviePublicationStatus,
} from "@/modules/movies/enums/movie-catalog.enum";
import { InMemoryMovieRepository } from "@/modules/movies/repositories/in-memory-movie.repository";
import { ManageMoviesService } from "@/modules/movies/services/manage-movies.service";
import { InMemoryShowtimeRepository } from "@/modules/showtimes/repositories/in-memory-showtime.repository";
import { ShowtimesService } from "@/modules/showtimes/services/showtimes.service";

describe("gestión de cartelera, salas y funciones", () => {
  const setup = () => {
    const movies = new InMemoryMovieRepository();
    const showtimeRepository = new InMemoryShowtimeRepository();
    const cinemas = new CinemasService(
      new InMemoryCinemaRepository(),
      showtimeRepository,
    );
    const cache = {
      invalidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as CatalogCacheService;
    const management = new ManageMoviesService(
      movies,
      cache,
      showtimeRepository,
    );
    const showtimes = new ShowtimesService(showtimeRepository, movies, cinemas);
    return { movies, cinemas, management, showtimes };
  };

  it("registra en borrador y sólo aparece en cartelera tras publicar y colocar", async () => {
    const { movies, management } = setup();
    const input = {
      slug: "prueba-cine",
      title: "Prueba Cine",
      posterUrl: "https://example.com/poster.jpg",
    };
    expect((await management.create(input)).publicationStatus).toBe(
      MoviePublicationStatus.DRAFT,
    );
    expect(movies.findMovie(input.slug)).toBeUndefined();
    await management.publish(input.slug);
    expect(
      movies.listNowPlaying().some((movie) => movie.slug === input.slug),
    ).toBe(false);
    await management.place(input.slug, MovieCatalogSection.NOW_PLAYING, {
      priority: 0,
    });
    expect(
      movies.listNowPlaying().some((movie) => movie.slug === input.slug),
    ).toBe(true);
    await management.unpublish(input.slug);
    expect(
      movies.listNowPlaying().some((movie) => movie.slug === input.slug),
    ).toBe(false);
  });

  it("impide solapar funciones y modificar butacas con funciones futuras", async () => {
    const { cinemas, management, showtimes } = setup();
    const room = cinemas.createAuditorium("cinetrux-centro", {
      name: "Sala de prueba",
      capacity: 2,
      supportedFormats: [MovieProjectionFormat.TWO_D],
    });
    cinemas.addSeat(room.id, { row: "A", number: 1 });
    const version = await management.addVersion("avengers-doomsday", {
      format: MovieProjectionFormat.TWO_D,
      audioLanguage: "es-419",
    });
    const start = new Date(Date.now() + 86_400_000);
    const end = new Date(start.getTime() + 2 * 3_600_000);
    const input = {
      movieSlug: "avengers-doomsday",
      movieVersionId: version.id,
      auditoriumId: room.id,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      basePriceCents: 2500,
    };
    const created = showtimes.create(input);
    expect(created.status).toBe("SCHEDULED");
    expect(() => showtimes.create(input)).toThrow();
    expect(() => cinemas.addSeat(room.id, { row: "A", number: 2 })).toThrow();
    expect(() => cinemas.closeAuditorium(room.id)).toThrow();
    expect(() => showtimes.onSale(created.id)).not.toThrow();
    expect(showtimes.availability(created.id).availableSeats).toBeNull();
  });

  it("rechaza versiones incompatibles y películas sin publicar", async () => {
    const { cinemas, management, showtimes } = setup();
    const room = cinemas.createAuditorium("cinetrux-centro", {
      name: "Sala 2D",
      capacity: 2,
      supportedFormats: [MovieProjectionFormat.TWO_D],
    });
    const version = await management.addVersion("avengers-doomsday", {
      format: MovieProjectionFormat.THREE_D,
      audioLanguage: "es-419",
    });
    const startsAt = new Date(Date.now() + 86_400_000).toISOString();
    const endsAt = new Date(Date.now() + 90_000_000).toISOString();
    expect(() =>
      showtimes.create({
        movieSlug: "avengers-doomsday",
        movieVersionId: version.id,
        auditoriumId: room.id,
        startsAt,
        endsAt,
        basePriceCents: 2500,
      }),
    ).toThrow();
    await management.create({
      slug: "borrador",
      title: "Borrador",
      posterUrl: "/poster.jpg",
    });
    const draftVersion = await management.addVersion("borrador", {
      format: MovieProjectionFormat.TWO_D,
      audioLanguage: "es-419",
    });
    expect(() =>
      showtimes.create({
        movieSlug: "borrador",
        movieVersionId: draftVersion.id,
        auditoriumId: room.id,
        startsAt,
        endsAt,
        basePriceCents: 2500,
      }),
    ).toThrow();
  });

  it("ordena sedes geocodificadas y agrupa cinco días de horarios sin inventar aforo", async () => {
    const { cinemas, management, showtimes } = setup();
    expect(
      cinemas.nearby({ latitude: -12.1, longitude: -77.0, page: 1, limit: 10 })
        .data,
    ).toEqual([]);
    const near = cinemas.create({
      slug: "cine-cercano",
      name: "Cine cercano",
      city: "Lima",
      address: "Dirección de prueba",
      timeZone: "America/Lima",
      latitude: -12.1,
      longitude: -77.0,
    });
    const far = cinemas.create({
      slug: "cine-lejano",
      name: "Cine lejano",
      city: "Lima",
      address: "Otra dirección de prueba",
      timeZone: "America/Lima",
      latitude: -12.2,
      longitude: -77.1,
    });
    expect(
      cinemas
        .nearby({ latitude: -12.101, longitude: -77.001, page: 1, limit: 10 })
        .data.map((cinema) => cinema.slug),
    ).toEqual([near.slug, far.slug]);
    const room = cinemas.createAuditorium(near.slug, {
      name: "Sala cercana",
      capacity: 2,
      supportedFormats: [MovieProjectionFormat.TWO_D],
    });
    cinemas.addSeat(room.id, { row: "A", number: 1 });
    const version = await management.addVersion("avengers-doomsday", {
      format: MovieProjectionFormat.TWO_D,
      audioLanguage: "es-419",
    });
    const start = new Date(Date.now() + 86_400_000);
    const created = showtimes.create({
      movieSlug: "avengers-doomsday",
      movieVersionId: version.id,
      auditoriumId: room.id,
      startsAt: start.toISOString(),
      endsAt: new Date(start.getTime() + 7_200_000).toISOString(),
      basePriceCents: 2500,
    });
    showtimes.onSale(created.id);
    const schedule = showtimes.movieSchedule("avengers-doomsday", {
      latitude: -12.101,
      longitude: -77.001,
      days: 5,
    });
    expect(schedule.cinemaSlug).toBe(near.slug);
    expect(schedule.days).toHaveLength(5);
    expect(
      schedule.days.flatMap((day) =>
        day.groups.flatMap((group) => group.slots),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          showtimeId: created.id,
          bookable: true,
          seatAvailability: "UNKNOWN",
        }),
      ]),
    );
    expect(() =>
      showtimes.movieSchedule("avengers-doomsday", { days: 5 }),
    ).toThrow();
  });
});

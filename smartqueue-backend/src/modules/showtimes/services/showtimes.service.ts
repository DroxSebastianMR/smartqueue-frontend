import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { paginate, type Page } from "@/modules/catalog/dto/list-query.dto";
import { CATALOG_REPOSITORY } from "@/modules/catalog/repositories/demo-catalog.repository";
import { AuditoriumStatus } from "@/modules/cinemas/enums/cinema-catalog.enum";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";
import {
  type CreateShowtimeDto,
  type ShowtimeAvailabilityDto,
  type ShowtimeQueryDto,
  type UpdateShowtimeDto,
} from "@/modules/showtimes/dto/showtime.dto";
import { InMemoryMovieRepository } from "@/modules/movies/repositories/in-memory-movie.repository";
import { MovieProjectionFormat } from "@/modules/movies/enums/movie-catalog.enum";
import { MovieErrorCode } from "@/modules/movies/enums/movie-error-code.enum";
import {
  type MovieScheduleDto,
  type MovieScheduleQueryDto,
  type ScheduleDayDto,
  type ScheduleGroupDto,
} from "@/modules/showtimes/dto/movie-schedule.dto";
import {
  ShowtimeErrorCode,
  ShowtimeStatus,
} from "@/modules/showtimes/enums/showtime-catalog.enum";
import {
  InMemoryShowtimeRepository,
  type ShowtimeRecord,
} from "@/modules/showtimes/repositories/in-memory-showtime.repository";

@Injectable()
export class ShowtimesService {
  constructor(
    private readonly repository: InMemoryShowtimeRepository,
    @Inject(CATALOG_REPOSITORY)
    private readonly movies: InMemoryMovieRepository,
    private readonly cinemas: CinemasService,
  ) {}

  list(query: ShowtimeQueryDto, includeInactive = false): Page<ShowtimeRecord> {
    const items = this.repository
      .list()
      .filter(
        (showtime) =>
          includeInactive ||
          (showtime.status !== ShowtimeStatus.CANCELLED &&
            showtime.status !== ShowtimeStatus.FINISHED &&
            Date.parse(showtime.endsAt) > Date.now()),
      )
      .filter(
        (showtime) =>
          !query.cinemaSlug || showtime.cinemaSlug === query.cinemaSlug,
      )
      .filter(
        (showtime) =>
          !query.movieSlug || showtime.movieSlug === query.movieSlug,
      )
      .filter(
        (showtime) =>
          !query.date ||
          this.localDate(
            showtime.startsAt,
            this.cinemas.detail(showtime.cinemaSlug, true).timeZone,
          ) === query.date,
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
    return paginate(items, query);
  }

  movieSchedule(slug: string, query: MovieScheduleQueryDto): MovieScheduleDto {
    const movie = this.movies.findMovie(slug);
    if (!movie)
      throw new AppException(
        MovieErrorCode.MOVIE_NOT_FOUND,
        "Película no encontrada",
        HttpStatus.NOT_FOUND,
      );
    if (
      !query.cinemaSlug &&
      (query.latitude === undefined || query.longitude === undefined)
    )
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "Indica un cine o ambas coordenadas",
        HttpStatus.BAD_REQUEST,
      );
    if ((query.latitude === undefined) !== (query.longitude === undefined))
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "Indica latitud y longitud juntas",
        HttpStatus.BAD_REQUEST,
      );

    const nearby = query.cinemaSlug
      ? null
      : this.cinemas.nearby({
          latitude: query.latitude!,
          longitude: query.longitude!,
          page: 1,
          limit: 10,
        });
    const candidate = query.cinemaSlug
      ? { slug: this.cinemas.detail(query.cinemaSlug).slug, distanceKm: null }
      : (nearby!.data.find((cinema) => {
          const first = this.localDate(
            new Date().toISOString(),
            cinema.timeZone,
          );
          const lastExclusive = new Date(
            Date.parse(`${first}T00:00:00Z`) + query.days * 86_400_000,
          )
            .toISOString()
            .slice(0, 10);
          return this.repository.list().some((showtime) => {
            const localDay = this.localDate(showtime.startsAt, cinema.timeZone);
            return (
              showtime.movieSlug === slug &&
              showtime.cinemaSlug === cinema.slug &&
              showtime.status !== ShowtimeStatus.CANCELLED &&
              showtime.status !== ShowtimeStatus.FINISHED &&
              Date.parse(showtime.endsAt) > Date.now() &&
              localDay >= first &&
              localDay < lastExclusive
            );
          });
        }) ?? nearby!.data[0]);
    if (!candidate)
      return {
        movieSlug: slug,
        cinemaSlug: null,
        timeZone: null,
        locationStatus: "NO_GEOCODED_CINEMA",
        distanceKm: null,
        days: [],
      };

    const cinema = this.cinemas.detail(candidate.slug);
    const today = this.localDate(new Date().toISOString(), cinema.timeZone);
    const days: ScheduleDayDto[] = Array.from(
      { length: query.days },
      (_, offset) => {
        const date = new Date(
          Date.parse(`${today}T00:00:00Z`) + offset * 86_400_000,
        )
          .toISOString()
          .slice(0, 10);
        const weekday = new Intl.DateTimeFormat("es-PE", {
          weekday: "long",
          timeZone: "UTC",
        }).format(new Date(`${date}T12:00:00Z`));
        const groups = new Map<string, ScheduleGroupDto>();
        for (const showtime of this.repository.list()) {
          if (
            showtime.movieSlug !== slug ||
            showtime.cinemaSlug !== cinema.slug ||
            showtime.status === ShowtimeStatus.CANCELLED ||
            showtime.status === ShowtimeStatus.FINISHED ||
            Date.parse(showtime.endsAt) <= Date.now() ||
            this.localDate(showtime.startsAt, cinema.timeZone) !== date
          )
            continue;
          const version = movie.versions.find(
            (item) => item.id === showtime.movieVersionId,
          );
          if (
            !version ||
            (query.format && version.format !== query.format) ||
            (query.audioLanguage &&
              version.audioLanguage !== query.audioLanguage)
          )
            continue;
          const key = `${version.format}:${version.audioLanguage}:${version.subtitleLanguage ?? ""}`;
          const group = groups.get(key) ?? {
            format: version.format as MovieProjectionFormat,
            audioLanguage: version.audioLanguage,
            subtitleLanguage: version.subtitleLanguage ?? null,
            slots: [],
          };
          group.slots.push({
            showtimeId: showtime.id,
            startsAt: showtime.startsAt,
            localTime: new Intl.DateTimeFormat("en-GB", {
              timeZone: cinema.timeZone,
              hour: "2-digit",
              minute: "2-digit",
              hourCycle: "h23",
            }).format(new Date(showtime.startsAt)),
            status: showtime.status,
            bookable:
              showtime.status === ShowtimeStatus.ON_SALE &&
              (!showtime.bookingOpensAt ||
                Date.parse(showtime.bookingOpensAt) <= Date.now()),
            basePriceCents: showtime.basePriceCents,
            currency: showtime.currency ?? "PEN",
            seatAvailability: "UNKNOWN",
          });
          groups.set(key, group);
        }
        for (const group of groups.values())
          group.slots.sort(
            (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
          );
        return { date, weekday, groups: [...groups.values()] };
      },
    );
    return {
      movieSlug: slug,
      cinemaSlug: cinema.slug,
      timeZone: cinema.timeZone,
      locationStatus: query.cinemaSlug ? "SELECTED" : "NEARBY",
      distanceKm: candidate.distanceKm ?? null,
      days,
    };
  }
  detail(id: string, includeInactive = false): ShowtimeRecord {
    const showtime = this.repository.find(id);
    if (
      !showtime ||
      (!includeInactive &&
        (showtime.status === ShowtimeStatus.CANCELLED ||
          showtime.status === ShowtimeStatus.FINISHED))
    )
      this.error(
        ShowtimeErrorCode.NOT_FOUND,
        "Función no encontrada",
        HttpStatus.NOT_FOUND,
      );
    return showtime!;
  }
  create(input: CreateShowtimeDto): ShowtimeRecord {
    const movie = this.movies.findMovie(input.movieSlug);
    if (!movie)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La película debe estar publicada",
        HttpStatus.CONFLICT,
      );
    const version = movie!.versions.find(
      (item) => item.id === input.movieVersionId,
    );
    if (!version)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La versión no pertenece a la película",
        HttpStatus.CONFLICT,
      );
    const room = this.cinemas.auditorium(input.auditoriumId);
    this.cinemas.detail(room.cinemaSlug);
    if (room.status !== AuditoriumStatus.ACTIVE)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La sala está en mantenimiento",
        HttpStatus.CONFLICT,
      );
    if (
      !room.supportedFormats.includes(version!.format as MovieProjectionFormat)
    )
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La sala no admite el formato de la versión",
        HttpStatus.CONFLICT,
      );
    this.assertSchedule(
      input.startsAt,
      input.endsAt,
      input.bookingOpensAt,
      input.auditoriumId,
    );
    return this.repository.create(input, room.cinemaSlug);
  }
  update(id: string, input: UpdateShowtimeDto): ShowtimeRecord {
    const current = this.detail(id, true);
    if (current.status !== ShowtimeStatus.SCHEDULED)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "Solo se editan funciones programadas",
        HttpStatus.CONFLICT,
      );
    this.assertSchedule(
      input.startsAt ?? current.startsAt,
      input.endsAt ?? current.endsAt,
      input.bookingOpensAt ?? current.bookingOpensAt,
      current.auditoriumId,
      id,
    );
    return this.repository.update(id, input)!;
  }
  onSale(id: string): ShowtimeRecord {
    const showtime = this.detail(id, true);
    if (showtime.status !== ShowtimeStatus.SCHEDULED)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La función no está programada",
        HttpStatus.CONFLICT,
      );
    if (Date.parse(showtime.startsAt) <= Date.now())
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "No se puede abrir venta de una función iniciada",
        HttpStatus.CONFLICT,
      );
    if (!this.cinemas.seats(showtime.auditoriumId).length)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "Configura butacas antes de habilitar la venta",
        HttpStatus.CONFLICT,
      );
    return this.repository.setStatus(id, ShowtimeStatus.ON_SALE)!;
  }
  cancel(id: string): ShowtimeRecord {
    const showtime = this.detail(id, true);
    if (showtime.status === ShowtimeStatus.FINISHED)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "Una función terminada no se cancela",
        HttpStatus.CONFLICT,
      );
    return this.repository.setStatus(id, ShowtimeStatus.CANCELLED)!;
  }
  availability(id: string): ShowtimeAvailabilityDto {
    const showtime = this.detail(id);
    return {
      showtimeId: id,
      status: "NOT_CONNECTED",
      configuredSeats: this.cinemas.seats(showtime.auditoriumId).length,
      availableSeats: null,
      message:
        "La disponibilidad requiere conectar entradas y reservas de cine",
    };
  }
  private assertSchedule(
    startsAt: string,
    endsAt: string,
    bookingOpensAt: string | null | undefined,
    auditoriumId: string,
    exceptId?: string,
  ): void {
    const start = Date.parse(startsAt),
      end = Date.parse(endsAt);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start <= Date.now() ||
      end <= start
    )
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "El horario debe iniciar en el futuro y terminar después",
        HttpStatus.BAD_REQUEST,
      );
    if (bookingOpensAt && Date.parse(bookingOpensAt) >= start)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La preventa debe iniciar antes de la función",
        HttpStatus.BAD_REQUEST,
      );
    const buffer =
      (this.cinemas.auditorium(auditoriumId).cleanupBufferMinutes ?? 15) *
      60_000;
    const overlaps = this.repository
      .list()
      .some(
        (other) =>
          other.id !== exceptId &&
          other.auditoriumId === auditoriumId &&
          other.status !== ShowtimeStatus.CANCELLED &&
          start < Date.parse(other.endsAt) + buffer &&
          end + buffer > Date.parse(other.startsAt),
      );
    if (overlaps)
      this.error(
        ShowtimeErrorCode.CONFLICT,
        "La sala tiene una función solapada o dentro del tiempo de limpieza",
        HttpStatus.CONFLICT,
      );
  }
  private localDate(iso: string, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(iso));
    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  }
  private error(
    code: ShowtimeErrorCode,
    message: string,
    status: HttpStatus,
  ): never {
    throw new AppException(code, message, status);
  }
}

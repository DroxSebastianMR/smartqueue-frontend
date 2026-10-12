import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { paginate, type Page } from "@/modules/catalog/dto/list-query.dto";
import {
  type CinemaQueryDto,
  type NearbyCinemasQueryDto,
  type CreateAuditoriumDto,
  type CreateCinemaDto,
  type CreateSeatDto,
  type UpdateAuditoriumDto,
  type UpdateCinemaDto,
} from "@/modules/cinemas/dto/cinema.dto";
import {
  AuditoriumStatus,
  CinemaCatalogErrorCode,
  CinemaStatus,
} from "@/modules/cinemas/enums/cinema-catalog.enum";
import {
  InMemoryCinemaRepository,
  type AuditoriumRecord,
  type CinemaRecord,
  type SeatRecord,
} from "@/modules/cinemas/repositories/in-memory-cinema.repository";
import { InMemoryShowtimeRepository } from "@/modules/showtimes/repositories/in-memory-showtime.repository";

@Injectable()
export class CinemasService {
  constructor(
    private readonly repository: InMemoryCinemaRepository,
    private readonly showtimes: InMemoryShowtimeRepository,
  ) {}

  list(query: CinemaQueryDto, includeClosed = false): Page<CinemaRecord> {
    const city = query.city?.trim().toLocaleLowerCase("es-PE");
    const district = query.district?.trim().toLocaleLowerCase("es-PE");
    return paginate(
      this.repository
        .listCinemas()
        .filter(
          (cinema) => includeClosed || cinema.status === CinemaStatus.ACTIVE,
        )
        .filter(
          (cinema) => !city || cinema.city.toLocaleLowerCase("es-PE") === city,
        )
        .filter(
          (cinema) =>
            !district ||
            cinema.district?.toLocaleLowerCase("es-PE") === district,
        )
        .filter(
          (cinema) =>
            !query.countryCode || cinema.countryCode === query.countryCode,
        ),
      query,
    );
  }
  nearby(
    query: NearbyCinemasQueryDto,
  ): Page<CinemaRecord & { distanceKm: number }> & {
    distanceType: "STRAIGHT_LINE";
  } {
    const positioned = this.repository
      .listCinemas()
      .filter(
        (cinema) =>
          cinema.status === CinemaStatus.ACTIVE &&
          cinema.latitude !== undefined &&
          cinema.longitude !== undefined,
      )
      .filter(
        (cinema) =>
          !query.countryCode || cinema.countryCode === query.countryCode,
      )
      .map((cinema) => ({
        ...cinema,
        distanceKm:
          Math.round(
            this.distanceKm(
              query.latitude,
              query.longitude,
              cinema.latitude!,
              cinema.longitude!,
            ) * 100,
          ) / 100,
      }))
      .sort(
        (a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name),
      );
    return { ...paginate(positioned, query), distanceType: "STRAIGHT_LINE" };
  }
  detail(slug: string, includeClosed = false): CinemaRecord {
    const cinema = this.repository.findCinema(slug);
    if (!cinema || (!includeClosed && cinema.status !== CinemaStatus.ACTIVE))
      this.error(
        CinemaCatalogErrorCode.CINEMA_NOT_FOUND,
        "Cine no encontrado",
        HttpStatus.NOT_FOUND,
      );
    return cinema!;
  }
  create(input: CreateCinemaDto): CinemaRecord {
    this.assertTimeZone(input.timeZone);
    this.assertCoordinates(input.latitude, input.longitude);
    const cinema = this.repository.createCinema(input);
    if (!cinema)
      this.error(
        CinemaCatalogErrorCode.CINEMA_CONFLICT,
        "El slug del cine ya existe",
        HttpStatus.CONFLICT,
      );
    return cinema!;
  }
  update(slug: string, input: UpdateCinemaDto): CinemaRecord {
    this.detail(slug, true);
    if (input.timeZone) this.assertTimeZone(input.timeZone);
    this.assertCoordinates(
      input.latitude,
      input.longitude,
      this.detail(slug, true),
    );
    if (
      input.status &&
      input.status !== CinemaStatus.ACTIVE &&
      this.showtimes.hasActiveForCinema(slug)
    )
      this.error(
        CinemaCatalogErrorCode.CINEMA_CONFLICT,
        "Cancela primero las funciones futuras del cine",
        HttpStatus.CONFLICT,
      );
    return this.repository.updateCinema(slug, input)!;
  }
  close(slug: string): void {
    this.detail(slug, true);
    if (this.showtimes.hasActiveForCinema(slug))
      this.error(
        CinemaCatalogErrorCode.CINEMA_CONFLICT,
        "Cancela primero las funciones futuras del cine",
        HttpStatus.CONFLICT,
      );
    this.repository.closeCinema(slug);
  }
  auditoriums(slug: string, includeMaintenance = false): AuditoriumRecord[] {
    this.detail(slug, includeMaintenance);
    return this.repository
      .listAuditoriums(slug)
      .filter(
        (room) => includeMaintenance || room.status === AuditoriumStatus.ACTIVE,
      );
  }
  auditorium(id: string): AuditoriumRecord {
    return (
      this.repository.findAuditorium(id) ??
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_NOT_FOUND,
        "Sala no encontrada",
        HttpStatus.NOT_FOUND,
      )
    );
  }
  createAuditorium(slug: string, input: CreateAuditoriumDto): AuditoriumRecord {
    this.detail(slug);
    if (!input.supportedFormats.length)
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "Indica al menos un formato",
        HttpStatus.BAD_REQUEST,
      );
    const room = this.repository.createAuditorium(slug, input);
    if (!room)
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "La sala ya existe en este cine",
        HttpStatus.CONFLICT,
      );
    return room!;
  }
  updateAuditorium(id: string, input: UpdateAuditoriumDto): AuditoriumRecord {
    const current = this.auditorium(id);
    if (
      this.showtimes.hasActiveForAuditorium(id) &&
      ((input.status && input.status !== AuditoriumStatus.ACTIVE) ||
        input.supportedFormats ||
        input.capacity !== undefined)
    )
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "Cancela primero las funciones futuras antes de cambiar el aforo, formato o estado",
        HttpStatus.CONFLICT,
      );
    if (
      input.capacity !== undefined &&
      input.capacity < this.repository.listSeats(id).length
    )
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "La capacidad no puede ser menor al número de butacas",
        HttpStatus.CONFLICT,
      );
    if (
      input.name &&
      this.repository
        .listAuditoriums(current.cinemaSlug)
        .some(
          (room) =>
            room.id !== id &&
            room.name.toLowerCase() === input.name!.toLowerCase(),
        )
    )
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "El nombre de sala ya existe",
        HttpStatus.CONFLICT,
      );
    return this.repository.updateAuditorium(id, input)!;
  }
  closeAuditorium(id: string): void {
    this.auditorium(id);
    if (this.showtimes.hasActiveForAuditorium(id))
      this.error(
        CinemaCatalogErrorCode.AUDITORIUM_CONFLICT,
        "Cancela primero las funciones futuras de la sala",
        HttpStatus.CONFLICT,
      );
    this.repository.setAuditoriumStatus(id, AuditoriumStatus.MAINTENANCE);
  }
  seats(id: string): SeatRecord[] {
    this.auditorium(id);
    return this.repository.listSeats(id);
  }
  addSeat(id: string, input: CreateSeatDto): SeatRecord {
    const room = this.auditorium(id);
    if (this.showtimes.hasActiveForAuditorium(id))
      this.error(
        CinemaCatalogErrorCode.SEAT_CONFLICT,
        "No se puede modificar el plano con funciones futuras",
        HttpStatus.CONFLICT,
      );
    if (this.repository.listSeats(id).length >= room.capacity)
      this.error(
        CinemaCatalogErrorCode.SEAT_CONFLICT,
        "Capacidad de sala alcanzada",
        HttpStatus.CONFLICT,
      );
    const seat = this.repository.addSeat(id, input);
    if (!seat)
      this.error(
        CinemaCatalogErrorCode.SEAT_CONFLICT,
        "La butaca ya existe",
        HttpStatus.CONFLICT,
      );
    return seat!;
  }
  removeSeat(id: string, seatId: string): void {
    this.auditorium(id);
    if (this.showtimes.hasActiveForAuditorium(id))
      this.error(
        CinemaCatalogErrorCode.SEAT_CONFLICT,
        "No se puede modificar el plano con funciones futuras",
        HttpStatus.CONFLICT,
      );
    if (!this.repository.removeSeat(id, seatId))
      this.error(
        CinemaCatalogErrorCode.SEAT_NOT_FOUND,
        "Butaca no encontrada",
        HttpStatus.NOT_FOUND,
      );
  }
  private assertTimeZone(value: string): void {
    try {
      new Intl.DateTimeFormat("es-PE", { timeZone: value });
    } catch {
      this.error(
        CinemaCatalogErrorCode.CINEMA_CONFLICT,
        "Zona horaria IANA inválida",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private assertCoordinates(
    latitude?: number,
    longitude?: number,
    current?: CinemaRecord,
  ): void {
    const hasLatitude = (latitude ?? current?.latitude) !== undefined;
    const hasLongitude = (longitude ?? current?.longitude) !== undefined;
    if (hasLatitude !== hasLongitude)
      this.error(
        CinemaCatalogErrorCode.CINEMA_CONFLICT,
        "Latitud y longitud deben configurarse juntas",
        HttpStatus.BAD_REQUEST,
      );
  }
  private distanceKm(
    latA: number,
    lonA: number,
    latB: number,
    lonB: number,
  ): number {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(latB - latA),
      dLon = toRadians(lonB - lonA);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(latA)) *
        Math.cos(toRadians(latB)) *
        Math.sin(dLon / 2) ** 2;
    return 6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  private error(
    code: CinemaCatalogErrorCode,
    message: string,
    status: HttpStatus,
  ): never {
    throw new AppException(code, message, status);
  }
}

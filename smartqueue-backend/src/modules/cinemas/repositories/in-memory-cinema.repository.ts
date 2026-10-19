import { randomUUID } from "node:crypto";
import { Injectable, Optional, type OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { MovieProjectionFormat } from "@/modules/movies/enums/movie-catalog.enum";
import {
  type CreateCinemaDto,
  type UpdateCinemaDto,
  type CreateAuditoriumDto,
  type UpdateAuditoriumDto,
  type CreateSeatDto,
} from "@/modules/cinemas/dto/cinema.dto";
import {
  AuditoriumStatus,
  CinemaStatus,
  SeatType,
} from "@/modules/cinemas/enums/cinema-catalog.enum";

export interface CinemaRecord extends CreateCinemaDto {
  id: string;
  status: CinemaStatus;
}
export interface AuditoriumRecord extends CreateAuditoriumDto {
  id: string;
  cinemaSlug: string;
  status: AuditoriumStatus;
}
export interface SeatRecord extends CreateSeatDto {
  id: string;
  auditoriumId: string;
  status: "AVAILABLE" | "BLOCKED" | "MAINTENANCE";
}

/** Read-optimized snapshot of cinemas, auditoriums and seats. */
@Injectable()
export class InMemoryCinemaRepository implements OnModuleInit {
  private readonly cinemas = new Map<string, CinemaRecord>();
  private readonly auditoriums = new Map<string, AuditoriumRecord>();
  private readonly seats = new Map<string, SeatRecord>();

  constructor(@Optional() private readonly db?: PrismaService) {
    for (const [slug, name] of [
      ["cinetrux-centro", "Cinetrux Centro"],
      ["cinetrux-san-miguel", "Cinetrux San Miguel"],
      ["cinetrux-primavera", "Cinetrux Primavera"],
    ]) {
      this.cinemas.set(slug, {
        id: randomUUID(),
        slug,
        name,
        city: "Lima",
        countryCode: "PE",
        address: slug === "cinetrux-centro"
          ? "Av. America Oeste 750 Urb. El Ingenio Trujillo"
          : "Por definir (demo)",
        timeZone: "America/Lima",
        status: CinemaStatus.ACTIVE,
      });
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.db || !process.env.DATABASE_URL || process.env.NODE_ENV === "test") return;
    const rows = await this.db.cinema.findMany({ include: { auditoriums: { include: { seats: true } } } });
    this.cinemas.clear(); this.auditoriums.clear(); this.seats.clear();
    for (const cinema of rows) {
      this.cinemas.set(cinema.slug, {
        id: cinema.id, slug: cinema.slug, name: cinema.name, city: cinema.city,
        countryCode: cinema.countryCode, region: cinema.region ?? undefined,
        district: cinema.district ?? undefined, address: cinema.address,
        timeZone: cinema.timeZone, latitude: cinema.latitude?.toNumber(),
        longitude: cinema.longitude?.toNumber(), status: cinema.status as CinemaStatus,
      });
      for (const room of cinema.auditoriums) {
        this.auditoriums.set(room.id, {
          id: room.id, cinemaSlug: cinema.slug, name: room.name,
          capacity: room.capacity, status: room.status as AuditoriumStatus,
          supportedFormats: room.supportedFormats.map((format) => format as MovieProjectionFormat),
          cleanupBufferMinutes: room.cleanupBufferMinutes,
        });
        for (const seat of room.seats) this.seats.set(seat.id, {
          id: seat.id, auditoriumId: room.id, row: seat.row,
          number: seat.number, type: seat.type as SeatType, status: seat.status,
        });
      }
    }
  }

  listCinemas(): CinemaRecord[] {
    return [...this.cinemas.values()].map((cinema) => ({ ...cinema }));
  }
  findCinema(slug: string): CinemaRecord | undefined {
    const cinema = this.cinemas.get(slug);
    return cinema ? { ...cinema } : undefined;
  }
  createCinema(input: CreateCinemaDto): CinemaRecord | undefined {
    if (this.cinemas.has(input.slug)) return undefined;
    const cinema = {
      ...input,
      countryCode: input.countryCode ?? "PE",
      id: randomUUID(),
      status: CinemaStatus.ACTIVE,
    };
    this.cinemas.set(input.slug, cinema);
    return { ...cinema };
  }
  updateCinema(slug: string, input: UpdateCinemaDto): CinemaRecord | undefined {
    const cinema = this.cinemas.get(slug);
    if (!cinema) return undefined;
    Object.assign(cinema, input);
    return { ...cinema };
  }
  closeCinema(slug: string): boolean {
    const cinema = this.cinemas.get(slug);
    if (!cinema) return false;
    cinema.status = CinemaStatus.CLOSED;
    return true;
  }
  listAuditoriums(cinemaSlug: string): AuditoriumRecord[] {
    return [...this.auditoriums.values()]
      .filter((room) => room.cinemaSlug === cinemaSlug)
      .map((room) => ({
        ...room,
        supportedFormats: [...room.supportedFormats],
      }));
  }
  findAuditorium(id: string): AuditoriumRecord | undefined {
    const room = this.auditoriums.get(id);
    return room
      ? { ...room, supportedFormats: [...room.supportedFormats] }
      : undefined;
  }
  createAuditorium(
    cinemaSlug: string,
    input: CreateAuditoriumDto,
  ): AuditoriumRecord | undefined {
    if (
      this.listAuditoriums(cinemaSlug).some(
        (room) => room.name.toLowerCase() === input.name.toLowerCase(),
      )
    )
      return undefined;
    const room = {
      ...input,
      cleanupBufferMinutes: input.cleanupBufferMinutes ?? 15,
      supportedFormats: [...input.supportedFormats],
      id: randomUUID(),
      cinemaSlug,
      status: AuditoriumStatus.ACTIVE,
    };
    this.auditoriums.set(room.id, room);
    return this.findAuditorium(room.id);
  }
  updateAuditorium(
    id: string,
    input: UpdateAuditoriumDto,
  ): AuditoriumRecord | undefined {
    const room = this.auditoriums.get(id);
    if (!room) return undefined;
    Object.assign(room, input);
    return this.findAuditorium(id);
  }
  setAuditoriumStatus(
    id: string,
    status: AuditoriumStatus,
  ): AuditoriumRecord | undefined {
    const room = this.auditoriums.get(id);
    if (!room) return undefined;
    room.status = status;
    return this.findAuditorium(id);
  }
  listSeats(auditoriumId: string): SeatRecord[] {
    return [...this.seats.values()]
      .filter((seat) => seat.auditoriumId === auditoriumId)
      .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
      .map((seat) => ({ ...seat }));
  }
  addSeat(auditoriumId: string, input: CreateSeatDto): SeatRecord | undefined {
    if (
      this.listSeats(auditoriumId).some(
        (seat) => seat.row === input.row && seat.number === input.number,
      )
    )
      return undefined;
    const seat = {
      ...input,
      type: input.type ?? SeatType.STANDARD,
      id: randomUUID(),
      auditoriumId,
      status: "AVAILABLE" as const,
    };
    this.seats.set(seat.id, seat);
    return { ...seat };
  }
  removeSeat(auditoriumId: string, id: string): boolean {
    if (this.seats.get(id)?.auditoriumId !== auditoriumId) return false;
    return this.seats.delete(id);
  }
}

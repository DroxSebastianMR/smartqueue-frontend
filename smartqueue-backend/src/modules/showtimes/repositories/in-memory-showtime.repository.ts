import { randomUUID } from "node:crypto";
import { Injectable, Optional, type OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  type CreateShowtimeDto,
  type UpdateShowtimeDto,
} from "@/modules/showtimes/dto/showtime.dto";
import { ShowtimeStatus } from "@/modules/showtimes/enums/showtime-catalog.enum";

export interface ShowtimeRecord extends CreateShowtimeDto {
  id: string;
  cinemaSlug: string;
  status: ShowtimeStatus;
}

@Injectable()
export class InMemoryShowtimeRepository implements OnModuleInit {
  private readonly records = new Map<string, ShowtimeRecord>();
  constructor(@Optional() private readonly db?: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (!this.db || !process.env.DATABASE_URL || process.env.NODE_ENV === "test") return;
    const rows = await this.db.showtime.findMany({
      where: { endsAt: { gt: new Date() } },
      include: { movieVersion: { include: { movie: { select: { slug: true } } } }, auditorium: { include: { cinema: { select: { slug: true } } } } },
    });
    this.records.clear();
    for (const row of rows) this.records.set(row.id, {
      id: row.id, movieSlug: row.movieVersion.movie.slug,
      movieVersionId: row.movieVersionId, auditoriumId: row.auditoriumId,
      cinemaSlug: row.auditorium.cinema.slug, startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(), status: row.status as ShowtimeStatus,
      basePriceCents: row.basePriceCents, currency: row.currency,
      bookingOpensAt: row.bookingOpensAt?.toISOString() ?? null,
    });
  }
  list(): ShowtimeRecord[] {
    return [...this.records.values()].map((showtime) => ({ ...showtime }));
  }
  find(id: string): ShowtimeRecord | undefined {
    const showtime = this.records.get(id);
    return showtime ? { ...showtime } : undefined;
  }
  create(input: CreateShowtimeDto, cinemaSlug: string): ShowtimeRecord {
    const showtime: ShowtimeRecord = {
      ...input,
      currency: input.currency ?? "PEN",
      bookingOpensAt: input.bookingOpensAt ?? null,
      id: randomUUID(),
      cinemaSlug,
      status: ShowtimeStatus.SCHEDULED,
    };
    this.records.set(showtime.id, showtime);
    return { ...showtime };
  }
  update(id: string, input: UpdateShowtimeDto): ShowtimeRecord | undefined {
    const showtime = this.records.get(id);
    if (!showtime) return undefined;
    Object.assign(showtime, input);
    return { ...showtime };
  }
  setStatus(id: string, status: ShowtimeStatus): ShowtimeRecord | undefined {
    const showtime = this.records.get(id);
    if (!showtime) return undefined;
    showtime.status = status;
    return { ...showtime };
  }
  hasActiveForMovie(slug: string): boolean {
    return this.list().some(
      (showtime) => showtime.movieSlug === slug && this.isActive(showtime),
    );
  }
  hasActiveForVersion(id: string): boolean {
    return this.list().some(
      (showtime) => showtime.movieVersionId === id && this.isActive(showtime),
    );
  }
  hasActiveForCinema(slug: string): boolean {
    return this.list().some(
      (showtime) => showtime.cinemaSlug === slug && this.isActive(showtime),
    );
  }
  hasActiveForAuditorium(id: string): boolean {
    return this.list().some(
      (showtime) => showtime.auditoriumId === id && this.isActive(showtime),
    );
  }
  private isActive(showtime: ShowtimeRecord): boolean {
    return (
      showtime.status !== ShowtimeStatus.CANCELLED &&
      showtime.status !== ShowtimeStatus.FINISHED &&
      Date.parse(showtime.endsAt) > Date.now()
    );
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SeatAvailability, SeatMapDto, SeatSelectionDto } from '@/modules/showtimes/dto/seat-map.dto';

@Injectable()
export class SeatMapService {
  constructor(private readonly prisma: PrismaService) {}

  async get(showtimeId: string): Promise<SeatMapDto> {
    const now = new Date();
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movieVersion: { include: { movie: true } },
        auditorium: { include: { cinema: true, seats: true } },
        tickets: {
          where: { OR: [
            { status: { in: ['PAID', 'USED'] } },
            { status: 'RESERVED', OR: [
              { orderId: null },
              { order: { status: 'PENDING_PAYMENT', expiresAt: { gt: now } } },
              { order: { status: 'PAID' } },
            ] },
          ] },
          select: { seatId: true },
        },
      },
    });
    if (!showtime) throw new NotFoundException('La función no existe');
    const { auditorium: room, movieVersion: version } = showtime;
    const occupied = new Set(showtime.tickets.map((ticket) => ticket.seatId));
    return {
      showtimeId, movieTitle: version.movie.title, posterUrl: version.movie.posterUrl,
      cinemaName: room.cinema.name, auditoriumName: room.name, timeZone: room.cinema.timeZone,
      startsAt: showtime.startsAt.toISOString(), format: version.format,
      audioLanguage: version.audioLanguageCode, basePriceCents: showtime.basePriceCents,
      currency: showtime.currency, maxSelection: 6, observedAt: now.toISOString(),
      bookable: showtime.status === 'ON_SALE' && showtime.startsAt > now &&
        (!showtime.bookingOpensAt || showtime.bookingOpensAt <= now) &&
        room.status === 'ACTIVE' && room.cinema.status === 'ACTIVE',
      seats: room.seats.sort((a, b) => a.row.localeCompare(b.row, 'es', { numeric: true }) || a.number - b.number)
        .map((seat) => ({ id: seat.id, row: seat.row, number: seat.number, type: seat.type,
          availability: seat.status !== 'AVAILABLE' ? SeatAvailability.UNAVAILABLE :
            occupied.has(seat.id) ? SeatAvailability.OCCUPIED : SeatAvailability.AVAILABLE })),
    };
  }

  async validate(showtimeId: string, seatIds: string[]): Promise<SeatSelectionDto> {
    const map = await this.get(showtimeId);
    if (!map.bookable) throw new ConflictException('Esta función no está disponible para compra');
    const selected = map.seats.filter((seat) => seatIds.includes(seat.id));
    if (selected.length !== seatIds.length || selected.some((seat) => seat.availability !== SeatAvailability.AVAILABLE)) {
      throw new ConflictException('Una de las butacas ya no está disponible. Actualiza tu selección.');
    }
    return { showtimeId, seats: selected, totalCents: selected.length * map.basePriceCents, currency: map.currency, reserved: false };
  }
}

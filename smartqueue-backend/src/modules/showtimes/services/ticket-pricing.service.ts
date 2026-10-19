import { BadRequestException, Injectable } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';
import { TicketCategory, TicketQuoteDto, TicketQuoteRequestDto, TicketRatesDto } from '../dto/ticket-pricing.dto';

// Explicit demo policy; the base price always comes from the persisted showtime.
const DEMO_RATES = [
  { category: TicketCategory.GENERAL, label: 'General', description: 'Tarifa regular', percentage: 100 },
  { category: TicketCategory.CHILD, label: 'Niños', description: 'Tarifa demo · menores de 12 años, según clasificación de la película', percentage: 80 },
  { category: TicketCategory.SENIOR, label: 'Adulto mayor', description: 'Tarifa demo · desde 60 años', percentage: 70 },
] as const;

@Injectable()
export class TicketPricingService {
  constructor(private readonly seats: SeatMapService) {}
  async rates(id: string): Promise<TicketRatesDto> {
    const map = await this.seats.get(id);
    return this.calculate(map.basePriceCents, map.currency);
  }
  private calculate(basePrice: number, currency: string): TicketRatesDto {
    return { currency, policy: 'DEMO_V1', rates: DEMO_RATES.map(({ percentage, ...rate }) => ({ ...rate, unitPriceCents: Math.round(basePrice * percentage / 100) })) };
  }
  async quote(id: string, input: TicketQuoteRequestDto): Promise<TicketQuoteDto> {
    if (new Set(input.tickets.map((line) => line.category)).size !== input.tickets.length ||
      input.tickets.reduce((sum, line) => sum + line.quantity, 0) !== input.seatIds.length) {
      throw new BadRequestException('Selecciona una entrada por butaca y no repitas categorías');
    }
    const selection = await this.seats.validate(id, input.seatIds);
    const catalog = this.calculate(selection.totalCents / selection.seats.length, selection.currency);
    const lines = input.tickets.map((line) => {
      const rate = catalog.rates.find((rate) => rate.category === line.category);
      if (!rate) throw new BadRequestException('Tarifa no disponible');
      return { ...rate, quantity: line.quantity, subtotalCents: rate.unitPriceCents * line.quantity };
    });
    return { showtimeId: id, currency: catalog.currency, totalCents: lines.reduce((sum, line) => sum + line.subtotalCents, 0), reserved: false, lines };
  }
}

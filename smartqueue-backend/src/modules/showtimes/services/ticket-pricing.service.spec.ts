import { TicketPricingService } from './ticket-pricing.service';
import { SeatMapService } from './seat-map.service';
import { TicketCategory } from '../dto/ticket-pricing.dto';

describe('TicketPricingService', () => {
  const seats = { get: jest.fn(), validate: jest.fn() };
  const service = new TicketPricingService(seats as unknown as SeatMapService);
  beforeEach(() => {
    jest.resetAllMocks();
    seats.get.mockResolvedValue({ basePriceCents: 2500, currency: 'PEN' });
    seats.validate.mockResolvedValue({ totalCents: 5000, currency: 'PEN', seats: [{ id: 'a' }, { id: 'b' }] });
  });
  it('derives demo rates from the stored showtime price', async () => {
    expect((await service.rates('show')).rates.map((r) => r.unitPriceCents)).toEqual([2500, 2000, 1750]);
  });
  it('quotes mixed categories server-side without reserving', async () => {
    const result = await service.quote('show', { seatIds: ['a', 'b'], tickets: [{ category: TicketCategory.GENERAL, quantity: 1 }, { category: TicketCategory.CHILD, quantity: 1 }] });
    expect(result.totalCents).toBe(4500);
    expect(result.reserved).toBe(false);
    expect(seats.validate).toHaveBeenCalledWith('show', ['a', 'b']);
  });
  it('rejects quantities not matching the seats', async () => {
    await expect(service.quote('show', { seatIds: ['a', 'b'], tickets: [{ category: TicketCategory.GENERAL, quantity: 1 }] })).rejects.toThrow();
  });
  it('rejects duplicate categories', async () => {
    await expect(service.quote('show', { seatIds: ['a', 'b'], tickets: [{ category: TicketCategory.GENERAL, quantity: 1 }, { category: TicketCategory.GENERAL, quantity: 1 }] })).rejects.toThrow();
  });
  it('propagates seat conflicts instead of issuing a quote', async () => {
    seats.validate.mockRejectedValue(new Error('Unavailable'));
    await expect(service.quote('show', { seatIds: ['a', 'b'], tickets: [{ category: TicketCategory.GENERAL, quantity: 2 }] })).rejects.toThrow('Unavailable');
  });
});

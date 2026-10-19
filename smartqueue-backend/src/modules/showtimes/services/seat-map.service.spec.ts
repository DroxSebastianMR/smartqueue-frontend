import { ConflictException, NotFoundException } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';

function fixture() {
  return {
    id: 'show-1', status: 'ON_SALE', startsAt: new Date(Date.now() + 86400000),
    bookingOpensAt: null, basePriceCents: 2500, currency: 'PEN',
    movieVersion: { format: 'TWO_D', audioLanguageCode: 'es-419', movie: { title: 'Película de prueba', posterUrl: null } },
    auditorium: { name: 'Sala 2', status: 'ACTIVE', cinema: { name: 'Sede', status: 'ACTIVE', timeZone: 'America/Lima' },
      seats: [
        { id: 'a', row: 'B', number: 2, type: 'STANDARD', status: 'AVAILABLE' },
        { id: 'b', row: 'A', number: 1, type: 'ACCESSIBLE', status: 'AVAILABLE' },
        { id: 'c', row: 'B', number: 1, type: 'STANDARD', status: 'MAINTENANCE' },
      ] }, tickets: [{ seatId: 'a' }],
  };
}
describe('SeatMapService', () => {
  const findUnique = jest.fn();
  const service = new SeatMapService({ showtime: { findUnique } } as never);
  beforeEach(() => findUnique.mockResolvedValue(fixture()));
  it('returns the correct movie, auditorium and sorted seat availability', async () => {
    const map = await service.get('show-1');
    expect(map.movieTitle).toBe('Película de prueba');
    expect(map.seats.map(({ id, availability }) => [id, availability])).toEqual([
      ['b', 'AVAILABLE'], ['c', 'UNAVAILABLE'], ['a', 'OCCUPIED'],
    ]);
    expect(map.bookable).toBe(true);
  });
  it('quotes from server pricing without claiming a reservation', async () => {
    expect(await service.validate('show-1', ['b'])).toMatchObject({ totalCents: 2500, reserved: false });
  });
  it('rejects occupied seats and seats from another room', async () => {
    await expect(service.validate('show-1', ['a'])).rejects.toThrow(ConflictException);
    await expect(service.validate('show-1', ['other-room'])).rejects.toThrow(ConflictException);
  });
  it('rejects a showtime that has already started', async () => {
    findUnique.mockResolvedValue({ ...fixture(), startsAt: new Date(0) });
    await expect(service.validate('show-1', ['b'])).rejects.toThrow(ConflictException);
  });
  it('does not fabricate a map for unknown showtimes', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toThrow(NotFoundException);
  });
});

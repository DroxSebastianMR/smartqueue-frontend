export enum SeatAvailability { AVAILABLE = 'AVAILABLE', OCCUPIED = 'OCCUPIED', UNAVAILABLE = 'UNAVAILABLE' }
export enum SeatType { STANDARD = 'STANDARD', PREMIUM = 'PREMIUM', ACCESSIBLE = 'ACCESSIBLE', COMPANION = 'COMPANION' }
export interface CinemaSeat { id: string; row: string; number: number; type: SeatType; availability: SeatAvailability }
export interface SeatMap {
  showtimeId: string; movieTitle: string; posterUrl: string | null; cinemaName: string;
  auditoriumName: string; timeZone: string; startsAt: string; format: string;
  audioLanguage: string; basePriceCents: number; currency: string; bookable: boolean;
  maxSelection: number; observedAt: string; seats: CinemaSeat[];
}
export interface SeatQuote { showtimeId: string; seats: CinemaSeat[]; totalCents: number; currency: string; reserved: boolean }

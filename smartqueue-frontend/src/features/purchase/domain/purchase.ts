export interface Reservation {
  id: string;
  eventId: string;
  queueEntryId: string;
  quantity: number;
  status: 'ACTIVE' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export interface Purchase {
  id: string;
  reservationId: string;
  quantity: number;
  confirmationCode: string;
  createdAt: string;
}

import type { Purchase, Reservation } from '@/features/purchase/domain/purchase';
import { DEMO_EVENT_ID } from '@/features/queue/infrastructure/queue.repository';
import { apiPost, useMocks } from '@/services/api/client';

export class PurchaseRepository {
  async reserve(quantity: number): Promise<Reservation> {
    if (useMocks) return { id: 'demo-reservation', eventId: DEMO_EVENT_ID, queueEntryId: 'demo-entry', quantity, status: 'ACTIVE', expiresAt: new Date(Date.now() + 300_000).toISOString() };
    const queueEntryId = localStorage.getItem('smartqueue.queue-entry-id');
    if (!queueEntryId) throw new Error('No se encontró un turno admitido');
    return apiPost('/sales/reservations', { eventId: DEMO_EVENT_ID, queueEntryId, quantity });
  }

  async confirm(reservationId: string): Promise<Purchase> {
    if (useMocks) return { id: 'demo-purchase', reservationId, quantity: 2, confirmationCode: 'SQ-DEMO26', createdAt: new Date().toISOString() };
    return apiPost(`/sales/reservations/${reservationId}/confirm`);
  }
}

import type { Purchase, Reservation } from '@/features/purchase/types/purchase.types';
import { DEMO_EVENT_ID } from '@/features/queue/services/queue.service';
import { apiPost, useMocks } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const purchaseService = {
  async reserve(quantity: number): Promise<Reservation> {
    if (useMocks) return { id: 'demo-reservation', eventId: DEMO_EVENT_ID, queueEntryId: 'demo-entry', quantity, status: 'ACTIVE', expiresAt: new Date(Date.now() + 300_000).toISOString() };
    const queueEntryId = localStorage.getItem('smartqueue.queue-entry-id');
    if (!queueEntryId) throw new Error('No se encontró un turno admitido');
    return apiPost(API_ENDPOINTS.SALES.RESERVE, { eventId: DEMO_EVENT_ID, queueEntryId, quantity });
  },

  async confirm(reservationId: string): Promise<Purchase> {
    if (useMocks) return { id: 'demo-purchase', reservationId, quantity: 2, confirmationCode: 'SQ-DEMO26', createdAt: new Date().toISOString() };
    return apiPost(API_ENDPOINTS.SALES.CONFIRM(reservationId));
  },
};

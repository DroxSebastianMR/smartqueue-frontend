import { apiClient } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { PaymentMethods, TicketQuantity, TicketQuote, TicketRates } from '@/features/purchase/types/ticket-pricing.types';

export const ticketPricingService = {
  async rates(id: string) { return (await apiClient.get<TicketRates>(API_ENDPOINTS.SHOWTIMES.TICKET_RATES(id))).data; },
  async quote(id: string, seatIds: string[], tickets: TicketQuantity[]) {
    return (await apiClient.post<TicketQuote>(API_ENDPOINTS.SHOWTIMES.TICKET_QUOTES(id), { seatIds, tickets })).data;
  },
  async paymentMethods() { return (await apiClient.get<PaymentMethods>(API_ENDPOINTS.PAYMENTS.METHODS, { params: { countryCode: 'PE', channel: 'ONLINE' } })).data; },
};

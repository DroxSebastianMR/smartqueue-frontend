import { apiClient } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { SeatMap, SeatQuote } from '@/features/purchase/types/seat-map.types';

export const seatsService = {
  async map(id: string): Promise<SeatMap> {
    const { data } = await apiClient.get<SeatMap>(API_ENDPOINTS.SHOWTIMES.SEATS(id));
    return data;
  },
  async validate(id: string, seatIds: string[]): Promise<SeatQuote> {
    const { data } = await apiClient.post<SeatQuote>(API_ENDPOINTS.SHOWTIMES.VALIDATE_SEATS(id), { seatIds });
    return data;
  },
};

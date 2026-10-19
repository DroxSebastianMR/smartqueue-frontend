import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { seatsService } from '@/infrastructure/api/purchase/services/seats.service';
import { SeatAvailability } from '@/features/purchase/types/seat-map.types';

export function useSeatSelection(showtimeId: string) {
  const [selection, setSelection] = useState<string[]>([]);
  const map = useQuery({ queryKey: ['showtime-seats', showtimeId], queryFn: () => seatsService.map(showtimeId), refetchInterval: 15_000 });
  const quote = useMutation({ mutationFn: (ids: string[]) => seatsService.validate(showtimeId, ids), onError: () => { void map.refetch(); } });
  const available = new Set(map.data?.seats.filter((seat) => seat.availability === SeatAvailability.AVAILABLE).map((seat) => seat.id));
  const selectedIds = selection.filter((id) => available.has(id));
  const selectionChanged = selectedIds.length !== selection.length;
  function toggle(id: string) {
    quote.reset();
    if (!available.has(id)) return;
    setSelection(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : selectedIds.length < (map.data?.maxSelection ?? 6) ? [...selectedIds, id] : selectedIds);
  }
  const validQuote = quote.data && map.data?.bookable && !selectionChanged && quote.data.currency === map.data.currency && quote.data.totalCents === selectedIds.length * map.data.basePriceCents && quote.data.seats.length === selectedIds.length && quote.data.seats.every((seat) => selectedIds.includes(seat.id));
  return { map, quote, selectedIds, toggle, selectionChanged, reviewing: Boolean(validQuote), edit: () => quote.reset() };
}

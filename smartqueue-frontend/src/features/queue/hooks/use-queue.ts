import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/infrastructure/api/client/axios.instance';
import { queueService } from '@/features/queue/services/queue.service';

export function useQueue() {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const requestedEventId = params.get('eventId');
  const event = useQuery({ queryKey: ['queue-event'], queryFn: async () =>
    (await apiClient.get<{ id: string; name: string; startsAt: string }>('/events/estreno-galactico')).data,
    enabled: !requestedEventId });
  const eventId = requestedEventId ?? event.data?.id;
  const status = useQuery({
    queryKey: ['queue-status', eventId], enabled: Boolean(eventId),
    queryFn: async () => {
      try { return await queueService.status(eventId!); }
      catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;
        await queueService.join(eventId!);
        return queueService.status(eventId!);
      }
    }, refetchInterval: 3_000, retry: 1,
  });
  const admit = useMutation({ mutationFn: () => queueService.runAdmission(eventId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-status', eventId] }) });
  return { status, admit, event, eventId };
}

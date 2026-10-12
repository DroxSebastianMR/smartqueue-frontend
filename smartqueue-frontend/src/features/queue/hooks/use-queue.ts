import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queueService } from '@/features/queue/services/queue.service';

export function useQueue() {
  const queryClient = useQueryClient();
  const join = useMutation({ mutationFn: () => queueService.join() });
  const status = useQuery({
    queryKey: ['queue-status'],
    queryFn: async () => {
      try { return await queueService.status(); }
      catch (error) {
        if (join.isIdle) await join.mutateAsync();
        return queueService.status();
      }
    },
    refetchInterval: 3_000,
    retry: 1,
  });
  const admit = useMutation({
    mutationFn: () => queueService.runAdmission(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-status'] }),
  });
  return { join, status, admit };
}

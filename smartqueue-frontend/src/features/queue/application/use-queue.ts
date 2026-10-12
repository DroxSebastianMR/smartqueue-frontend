import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QueueRepository } from '@/features/queue/infrastructure/queue.repository';

const repository = new QueueRepository();

export function useQueue() {
  const queryClient = useQueryClient();
  const join = useMutation({ mutationFn: () => repository.join() });
  const status = useQuery({
    queryKey: ['queue-status'],
    queryFn: async () => {
      try { return await repository.status(); }
      catch (error) {
        if (join.isIdle) await join.mutateAsync();
        return repository.status();
      }
    },
    refetchInterval: 3_000,
    retry: 1,
  });
  const admit = useMutation({
    mutationFn: () => repository.runAdmission(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-status'] }),
  });
  return { join, status, admit };
}

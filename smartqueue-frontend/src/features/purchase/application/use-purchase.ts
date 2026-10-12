import { useMutation } from '@tanstack/react-query';

import { PurchaseRepository } from '@/features/purchase/infrastructure/purchase.repository';

const repository = new PurchaseRepository();

export function usePurchase() {
  return useMutation({
    mutationFn: async (quantity: number) => {
      const reservation = await repository.reserve(quantity);
      return repository.confirm(reservation.id);
    },
  });
}

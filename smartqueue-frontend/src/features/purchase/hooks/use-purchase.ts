import { useMutation } from '@tanstack/react-query';

import { purchaseService } from '@/features/purchase/services/purchase.service';

export function usePurchase() {
  return useMutation({
    mutationFn: async (quantity: number) => {
      const reservation = await purchaseService.reserve(quantity);
      return purchaseService.confirm(reservation.id);
    },
  });
}

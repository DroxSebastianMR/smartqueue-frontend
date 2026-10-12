import { HttpStatus, Injectable } from "@nestjs/common";
import { QueueStatus, ReservationStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { PrismaService } from "@/common/prisma/prisma.service";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { invalidateDashboardCache } from "@/modules/metrics/services/invalidate-dashboard-cache";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AppException } from "@/common/exceptions/app.exception";

@Injectable()
export class ConfirmPurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStoreService,
    private readonly queueCache: QueueCacheService,
  ) {}

  async execute(reservationId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.purchase.findUnique({
        where: { reservationId },
      });
      if (existing) return existing;
      const reservation = await tx.purchaseReservation.findUnique({
        where: { id: reservationId },
      });
      if (
        !reservation ||
        reservation.status !== ReservationStatus.ACTIVE ||
        reservation.expiresAt <= new Date()
      ) {
        throw new AppException(
          CinemaErrorCode.RESERVATION_INVALID,
          "La reserva no está activa",
          HttpStatus.BAD_REQUEST,
        );
      }
      const purchase = await tx.purchase.create({
        data: {
          eventId: reservation.eventId,
          queueEntryId: reservation.queueEntryId,
          reservationId,
          quantity: reservation.quantity,
          confirmationCode: `SQ-${randomUUID().slice(0, 8).toUpperCase()}`,
        },
      });
      await tx.purchaseReservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CONFIRMED },
      });
      await tx.queueEntry.update({
        where: { id: reservation.queueEntryId },
        data: { status: QueueStatus.COMPLETED },
      });
      return purchase;
    });
    await invalidateDashboardCache(this.cache);
    await this.queueCache.invalidate(result.eventId);
    return result;
  }
}

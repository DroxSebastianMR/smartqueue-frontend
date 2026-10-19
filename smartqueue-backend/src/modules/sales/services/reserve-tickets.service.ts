import { HttpStatus, Injectable } from "@nestjs/common";
import { QueueStatus, ReservationStatus } from "@prisma/client";

import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AppException } from "@/common/exceptions/app.exception";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { invalidateDashboardCache } from "@/modules/metrics/services/invalidate-dashboard-cache";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";
import { OperationalTelemetryService } from "@/modules/metrics/services/operational-telemetry.service";

@Injectable()
export class ReserveTicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStoreService,
    private readonly queueCache: QueueCacheService,
    private readonly telemetry: OperationalTelemetryService,
  ) {}

  async execute(eventId: string, queueEntryId: string, quantity: number) {
    const result = await this.telemetry.capture(
      {
        requestType: "RESERVATION_CREATE",
        eventId,
        queueEntryId,
      },
      () =>
        this.prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
          const existing = await tx.purchaseReservation.findUnique({
            where: { queueEntryId },
          });
          if (existing) {
            if (
              existing.eventId !== eventId ||
              existing.quantity !== quantity ||
              existing.status !== ReservationStatus.ACTIVE ||
              existing.expiresAt <= new Date()
            ) {
              throw new AppException(
                CinemaErrorCode.RESERVATION_INVALID,
                "Reserva incompatible o vencida",
                HttpStatus.CONFLICT,
              );
            }
            return existing;
          }
          const entry = await tx.queueEntry.findUnique({
            where: { id: queueEntryId },
          });
          if (
            !entry ||
            entry.eventId !== eventId ||
            entry.status !== QueueStatus.ADMITTED ||
            !entry.accessExpiresAt ||
            entry.accessExpiresAt <= new Date()
          ) {
            throw new AppException(
              CinemaErrorCode.QUEUE_ACCESS_DENIED,
              "Se requiere una entrada admitida en la cola",
              HttpStatus.BAD_REQUEST,
            );
          }
          const changed = await tx.event.updateMany({
            where: { id: eventId, availableStock: { gte: quantity } },
            data: { availableStock: { decrement: quantity } },
          });
          if (changed.count !== 1)
            throw new AppException(
              CinemaErrorCode.INSUFFICIENT_STOCK,
              "No hay suficientes entradas disponibles",
              HttpStatus.CONFLICT,
            );
          const expiresAt = new Date(Date.now() + 300_000);
          const reservation = await tx.purchaseReservation.create({
            data: {
              eventId,
              queueEntryId,
              quantity,
              expiresAt,
              status: ReservationStatus.ACTIVE,
            },
          });
          await tx.queueEntry.update({
            where: { id: queueEntryId },
            data: { status: QueueStatus.RESERVED, accessExpiresAt: expiresAt },
          });
          return reservation;
        }),
    );
    await invalidateDashboardCache(this.cache);
    await this.queueCache.invalidate(eventId);
    return result;
  }
}

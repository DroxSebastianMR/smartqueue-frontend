import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { QueueCacheService } from "./queue-cache.service";

/** Anonymous participant lifecycle. All stock mutations use the same event lock as sales. */
@Injectable()
export class QueueLifecycleService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(QueueLifecycleService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: QueueCacheService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sweep(), 5000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async cancel(eventId: string, participantToken: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
      const entry = await tx.queueEntry.findUnique({
        where: { eventId_participantToken: { eventId, participantToken } },
      });
      if (!entry) throw new NotFoundException("Participante no encontrado");
      if (["COMPLETED", "CANCELLED", "EXPIRED"].includes(entry.status))
        return { id: entry.id, status: entry.status };
      const reservation = await tx.purchaseReservation.findUnique({
        where: { queueEntryId: entry.id },
      });
      if (reservation?.status === "ACTIVE") {
        await tx.purchaseReservation.update({
          where: { id: reservation.id },
          data: { status: "CANCELLED" },
        });
        await tx.event.update({
          where: { id: eventId },
          data: { availableStock: { increment: reservation.quantity } },
        });
      }
      await tx.queueEntry.update({
        where: { id: entry.id },
        data: { status: "CANCELLED" },
      });
      return { id: entry.id, status: "CANCELLED" };
    });
    await this.cache.invalidate(eventId);
    return result;
  }

  async sweep() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      const reservations = await this.prisma.purchaseReservation.findMany({
        where: { status: "ACTIVE", expiresAt: { lte: now } },
        select: { eventId: true },
        take: 500,
      });
      const entries = await this.prisma.queueEntry.findMany({
        where: { status: "ADMITTED", accessExpiresAt: { lte: now } },
        select: { eventId: true },
        take: 500,
      });
      for (const eventId of new Set(
        [...reservations, ...entries].map((item) => item.eventId),
      )) {
        await this.prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
          const expired = await tx.purchaseReservation.findMany({
            where: { eventId, status: "ACTIVE", expiresAt: { lte: now } },
          });
          for (const reservation of expired) {
            await tx.purchaseReservation.update({
              where: { id: reservation.id },
              data: { status: "EXPIRED" },
            });
            await tx.queueEntry.update({
              where: { id: reservation.queueEntryId },
              data: { status: "EXPIRED" },
            });
          }
          const quantity = expired.reduce(
            (total, reservation) => total + reservation.quantity,
            0,
          );
          if (quantity)
            await tx.event.update({
              where: { id: eventId },
              data: { availableStock: { increment: quantity } },
            });
          await tx.queueEntry.updateMany({
            where: {
              eventId,
              status: "ADMITTED",
              accessExpiresAt: { lte: now },
            },
            data: { status: "EXPIRED" },
          });
        });
        await this.cache.invalidate(eventId);
      }
    } catch {
      this.logger.warn("Queue expiry sweep failed; retrying next cycle");
    } finally {
      this.running = false;
    }
  }
}

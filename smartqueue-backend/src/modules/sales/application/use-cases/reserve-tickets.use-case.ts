import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueStatus, ReservationStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ReserveTicketsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(eventId: string, queueEntryId: string, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.purchaseReservation.findUnique({ where: { queueEntryId } });
      if (existing) return existing;
      const entry = await tx.queueEntry.findUnique({ where: { id: queueEntryId } });
      if (!entry || entry.eventId !== eventId || entry.status !== QueueStatus.ADMITTED) {
        throw new BadRequestException('A valid admitted queue entry is required');
      }
      const changed = await tx.event.updateMany({
        where: { id: eventId, availableStock: { gte: quantity } },
        data: { availableStock: { decrement: quantity } },
      });
      if (changed.count !== 1) throw new BadRequestException('Not enough ticket stock');
      const expiresAt = new Date(Date.now() + 300_000);
      const reservation = await tx.purchaseReservation.create({
        data: { eventId, queueEntryId, quantity, expiresAt, status: ReservationStatus.ACTIVE },
      });
      await tx.queueEntry.update({ where: { id: queueEntryId }, data: { status: QueueStatus.RESERVED } });
      return reservation;
    });
  }
}


import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueStatus, ReservationStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ConfirmPurchaseUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.purchase.findUnique({ where: { reservationId } });
      if (existing) return existing;
      const reservation = await tx.purchaseReservation.findUnique({ where: { id: reservationId } });
      if (!reservation || reservation.status !== ReservationStatus.ACTIVE || reservation.expiresAt <= new Date()) {
        throw new BadRequestException('Reservation is not active');
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
      await tx.purchaseReservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.CONFIRMED } });
      await tx.queueEntry.update({ where: { id: reservation.queueEntryId }, data: { status: QueueStatus.COMPLETED } });
      return purchase;
    });
  }
}


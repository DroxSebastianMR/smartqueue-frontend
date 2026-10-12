import { Injectable } from '@nestjs/common';
import { QueueStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RunAdmissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute(eventId: string, slots: number) {
    return this.prisma.$transaction(async (tx) => {
      const waiting = await tx.queueEntry.findMany({
        where: { eventId, status: QueueStatus.WAITING },
        orderBy: { turnNumber: 'asc' },
        take: slots,
      });
      const accessExpiresAt = new Date(Date.now() + 300_000);
      await Promise.all(waiting.map((entry) => tx.queueEntry.update({
        where: { id: entry.id },
        data: { status: QueueStatus.ADMITTED, admittedAt: new Date(), accessExpiresAt },
      })));
      return { admitted: waiting.length, entryIds: waiting.map((entry) => entry.id), accessExpiresAt };
    });
  }
}

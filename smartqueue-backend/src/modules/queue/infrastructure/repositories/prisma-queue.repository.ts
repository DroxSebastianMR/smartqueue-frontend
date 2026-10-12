import { Injectable } from '@nestjs/common';
import { QueueStatus as PrismaQueueStatus } from '@prisma/client';

import { QueueStatus } from '@/common/enums/queue-status.enum';
import { PrismaService } from '@/database/prisma.service';
import type { QueueRepository } from '@/modules/queue/domain/repositories/queue.repository';

@Injectable()
export class PrismaQueueRepository implements QueueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async join(eventId: string, participantToken: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.queueEntry.findUnique({
        where: { eventId_participantToken: { eventId, participantToken } },
      });
      if (existing) return existing as never;
      const aggregate = await tx.queueEntry.aggregate({
        where: { eventId },
        _max: { turnNumber: true },
      });
      return tx.queueEntry.create({
        data: {
          eventId,
          participantToken,
          turnNumber: (aggregate._max.turnNumber ?? 0n) + 1n,
        },
      }) as never;
    });
  }

  async getSnapshot(eventId: string, participantToken: string) {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { eventId_participantToken: { eventId, participantToken } },
    });
    if (!entry) return null;
    const peopleAhead = await this.prisma.queueEntry.count({
      where: {
        eventId,
        status: PrismaQueueStatus.WAITING,
        turnNumber: { lt: entry.turnNumber },
      },
    });
    return {
      entry: entry as never,
      peopleAhead,
      estimatedWaitMinutes: peopleAhead === 0 ? 0 : null,
    };
  }

  async cancel(eventId: string, participantToken: string) {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { eventId_participantToken: { eventId, participantToken } },
    });
    if (!entry || entry.status === PrismaQueueStatus.COMPLETED) return null;
    return this.prisma.queueEntry.update({
      where: { id: entry.id },
      data: { status: QueueStatus.CANCELLED },
    }) as never;
  }
}


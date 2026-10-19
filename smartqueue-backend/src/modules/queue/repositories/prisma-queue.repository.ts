import { Injectable } from "@nestjs/common";
import { estimateWaitMinutes } from '../services/estimate-wait';
import { QueueStatus as PrismaQueueStatus } from "@prisma/client";

import { PrismaService } from "@/common/prisma/prisma.service";
import type { QueueRepository } from "@/modules/queue/repositories/queue.repository";

@Injectable()
export class PrismaQueueRepository implements QueueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async join(eventId: string, participantToken: string) {
    return this.prisma.$transaction(async (tx) => {
      // Serialize turn allocation per event across API processes.
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
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
    const admissions = entry.status === PrismaQueueStatus.WAITING
      ? await this.prisma.queueEntry.count({ where: { eventId, admittedAt: { gte: new Date(Date.now() - 60_000) } } })
      : 0;
    return {
      entry: entry as never,
      peopleAhead,
      estimatedWaitMinutes: entry.status === PrismaQueueStatus.WAITING
        ? estimateWaitMinutes(peopleAhead, admissions)
        : entry.admittedAt ? 0 : null,
    };
  }
}

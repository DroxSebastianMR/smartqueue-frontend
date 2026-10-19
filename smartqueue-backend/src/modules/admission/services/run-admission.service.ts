import { Injectable } from "@nestjs/common";
import { QueueStatus } from "@prisma/client";

import { PrismaService } from "@/common/prisma/prisma.service";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { invalidateDashboardCache } from "@/modules/metrics/services/invalidate-dashboard-cache";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";

@Injectable()
export class RunAdmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStoreService,
    private readonly queueCache: QueueCacheService,
  ) {}

  async execute(eventId: string, slots: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
      const waiting = await tx.queueEntry.findMany({
        where: { eventId, status: QueueStatus.WAITING },
        orderBy: { turnNumber: "asc" },
        take: slots,
      });
      const accessExpiresAt = new Date(Date.now() + 300_000);
      await Promise.all(
        waiting.map((entry) =>
          tx.queueEntry.update({
            where: { id: entry.id },
            data: {
              status: QueueStatus.ADMITTED,
              admittedAt: new Date(),
              accessExpiresAt,
            },
          }),
        ),
      );
      return {
        admitted: waiting.length,
        entryIds: waiting.map((entry) => entry.id),
        accessExpiresAt,
      };
    });
    await invalidateDashboardCache(this.cache);
    await this.queueCache.invalidate(eventId);
    return result;
  }
}

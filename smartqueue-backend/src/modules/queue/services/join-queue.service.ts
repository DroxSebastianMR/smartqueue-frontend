import { Inject, Injectable } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { invalidateDashboardCache } from "@/modules/metrics/services/invalidate-dashboard-cache";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";

import {
  QUEUE_REPOSITORY,
  type QueueRepository,
} from "@/modules/queue/repositories/queue.repository";

@Injectable()
export class JoinQueueService {
  constructor(
    @Inject(QUEUE_REPOSITORY) private readonly queue: QueueRepository,
    private readonly cache: CacheStoreService,
    private readonly queueCache: QueueCacheService,
  ) {}
  async execute(eventId: string, participantToken: string) {
    const entry = await this.queue.join(eventId, participantToken);
    await this.queueCache.invalidate(eventId);
    await invalidateDashboardCache(this.cache);
    return { ...entry, turnNumber: Number(entry.turnNumber) };
  }
}

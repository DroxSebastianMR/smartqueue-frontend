import { Inject, Injectable } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { invalidateDashboardCache } from "@/modules/metrics/services/invalidate-dashboard-cache";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";
import { OperationalTelemetryService } from "@/modules/metrics/services/operational-telemetry.service";

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
    private readonly telemetry: OperationalTelemetryService,
  ) {}
  async execute(eventId: string, participantToken: string) {
    const entry = await this.telemetry.capture(
      { requestType: "QUEUE_JOIN", eventId, participantToken },
      () => this.queue.join(eventId, participantToken),
    );
    await this.queueCache.invalidate(eventId);
    await invalidateDashboardCache(this.cache);
    return { ...entry, turnNumber: Number(entry.turnNumber) };
  }
}

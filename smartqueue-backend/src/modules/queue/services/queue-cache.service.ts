import { createHash } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import {
  QUEUE_STATUS_TTL_SECONDS,
  QUEUE_VERSION_TTL_SECONDS,
  queueVersionKey,
} from "@/modules/queue/constants/queue-cache.constants";

@Injectable()
export class QueueCacheService {
  private readonly logger = new Logger(QueueCacheService.name);
  constructor(private readonly cache: CacheStoreService) {}
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }
  async set(key: string, value: unknown): Promise<void> {
    await this.cache.set(key, JSON.stringify(value), QUEUE_STATUS_TTL_SECONDS);
  }
  async invalidate(eventId: string): Promise<void> {
    try {
      await this.cache.increment(
        queueVersionKey(eventId),
        QUEUE_VERSION_TTL_SECONDS,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo invalidar la cola: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  async keyFor(eventId: string, participantToken: string): Promise<string> {
    const version = (await this.cache.get(queueVersionKey(eventId))) ?? "0";
    const tokenHash = createHash("sha256")
      .update(participantToken)
      .digest("hex");
    return `queue:status:${eventId}:${version}:${tokenHash}`;
  }
}

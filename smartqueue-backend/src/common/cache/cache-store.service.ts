import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type { CacheConfig } from "@/config/cache/cache-config.interface";

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

/** Shared cache API. Redis is opt-in; memory is bounded and process-local. */
@Injectable()
export class CacheStoreService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheStoreService.name);
  private readonly memory = new Map<string, MemoryCacheEntry>();
  private readonly config: CacheConfig;
  private readonly redis?: Redis;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<CacheConfig>("cache");
    if (this.config.driver === "redis") {
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.database,
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        retryStrategy: () => null,
        connectTimeout: 2_000,
        enableReadyCheck: true,
      });
      this.redis.on("error", (error) =>
        this.logger.error(`Redis: ${error.message}`),
      );
    }
  }
  async onModuleInit(): Promise<void> {
    if (this.redis?.status === "wait") await this.redis.connect();
  }
  async onModuleDestroy(): Promise<void> {
    if (this.redis && this.redis.status !== "end") await this.redis.quit();
  }
  async get(key: string): Promise<string | null> {
    if (this.redis) return this.redis.get(this.redisKey(key));
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.assertTtl(ttlSeconds);
    if (this.redis) {
      await this.redis.set(this.redisKey(key), value, "EX", ttlSeconds);
      return;
    }
    this.evictExpired();
    if (
      !this.memory.has(key) &&
      this.memory.size >= this.config.maxMemoryEntries
    ) {
      const oldest = this.memory.keys().next().value;
      if (oldest) this.memory.delete(oldest);
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  async delete(key: string): Promise<void> {
    if (this.redis) await this.redis.del(this.redisKey(key));
    else this.memory.delete(key);
  }
  async increment(key: string, ttlSeconds: number): Promise<number> {
    this.assertTtl(ttlSeconds);
    if (this.redis) {
      const result = await this.redis.eval(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n",
        1,
        this.redisKey(key),
        ttlSeconds,
      );
      return Number(result);
    }
    const existing = this.memory.get(key);
    const valid = existing && existing.expiresAt > Date.now();
    const count = valid ? Number(existing.value) + 1 : 1;
    if (valid)
      this.memory.set(key, {
        value: String(count),
        expiresAt: existing.expiresAt,
      });
    else await this.set(key, String(count), ttlSeconds);
    return count;
  }
  private assertTtl(seconds: number): void {
    if (!Number.isInteger(seconds) || seconds < 1)
      throw new Error("Cache TTL must be a positive integer");
  }
  private redisKey(key: string): string {
    return `${this.config.redis.keyPrefix}${key}`;
  }
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memory)
      if (entry.expiresAt <= now) this.memory.delete(key);
  }
}

import { Injectable } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";

@Injectable()
export class CatalogCacheService {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  constructor(private readonly cache: CacheStoreService) {}

  async remember<T>(key: string, load: () => T | Promise<T>, ttlSeconds = 60): Promise<T> {
    const scope = key.split(":", 1)[0];
    const revision = (await this.cache.get(`catalog:revision:${scope}`)) ?? "0";
    const cacheKey = `catalog:v1:${scope}:${revision}:${key}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as T;
    const pending = this.inFlight.get(cacheKey);
    if (pending) return pending as Promise<T>;
    const task = (async () => {
      const value = await load();
      await this.cache.set(cacheKey, JSON.stringify(value), ttlSeconds);
      return value;
    })();
    this.inFlight.set(cacheKey, task);
    try { return await task; }
    finally { this.inFlight.delete(cacheKey); }
  }

  async invalidate(scope: string): Promise<void> {
    await this.cache.increment(`catalog:revision:${scope}`, 3600);
  }
}

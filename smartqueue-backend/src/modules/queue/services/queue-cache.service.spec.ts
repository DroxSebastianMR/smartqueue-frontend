import { ConfigService } from "@nestjs/config";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import type { CacheConfig } from "@/config/cache/cache-config.interface";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";

describe("QueueCacheService", () => {
  it("aísla por token e invalida versiones del evento", async () => {
    const config: CacheConfig = {
      driver: "memory",
      maxMemoryEntries: 100,
      redis: { host: "localhost", port: 6379, database: 0, keyPrefix: "test:" },
    };
    const cache = new QueueCacheService(
      new CacheStoreService({
        getOrThrow: () => config,
      } as unknown as ConfigService),
    );
    const keyA = await cache.keyFor("event-1", "private-token-a");
    const keyB = await cache.keyFor("event-1", "private-token-b");
    expect(keyA).not.toContain("private-token-a");
    await cache.set(keyA, { peopleAhead: 3 });
    expect(await cache.get(keyA)).toEqual({ peopleAhead: 3 });
    expect(await cache.get(keyB)).toBeNull();
    await cache.invalidate("event-1");
    expect(
      await cache.get(await cache.keyFor("event-1", "private-token-a")),
    ).toBeNull();
  });
});

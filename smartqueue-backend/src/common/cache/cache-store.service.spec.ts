import { ConfigService } from "@nestjs/config";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import type { CacheConfig } from "@/config/cache/cache-config.interface";

const config: CacheConfig = {
  driver: "memory",
  maxMemoryEntries: 2,
  redis: { host: "localhost", port: 6379, database: 0, keyPrefix: "test:" },
};
const service = () =>
  new CacheStoreService({
    getOrThrow: () => config,
  } as unknown as ConfigService);

describe("CacheStoreService (memory)", () => {
  afterEach(() => jest.useRealTimers());
  it("respeta TTL e invalida explícitamente", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const cache = service();
    await cache.set("a", "valor", 2);
    expect(await cache.get("a")).toBe("valor");
    jest.advanceTimersByTime(2_001);
    expect(await cache.get("a")).toBeNull();
    await cache.set("a", "nuevo", 2);
    await cache.delete("a");
    expect(await cache.get("a")).toBeNull();
  });
  it("limita tamaño y mantiene ventana de incremento fija", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const cache = service();
    await cache.set("a", "1", 100);
    await cache.set("b", "2", 100);
    await cache.set("c", "3", 100);
    expect(await cache.get("a")).toBeNull();
    expect(await cache.increment("count", 2)).toBe(1);
    jest.advanceTimersByTime(1_000);
    expect(await cache.increment("count", 2)).toBe(2);
    jest.advanceTimersByTime(1_001);
    expect(await cache.get("count")).toBeNull();
  });
});

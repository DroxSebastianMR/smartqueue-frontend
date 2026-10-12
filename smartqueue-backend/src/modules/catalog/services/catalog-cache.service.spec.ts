import { CacheStoreService } from "@/common/cache/cache-store.service";
import { CatalogCacheService } from "@/modules/catalog/services/catalog-cache.service";

describe("CatalogCacheService", () => {
  it("loads a cold key once for concurrent callers and caches the result", async () => {
    const values = new Map<string, string>();
    const store = {
      get: jest.fn(async (key: string) => values.get(key) ?? null),
      set: jest.fn(async (key: string, value: string) => { values.set(key, value); }),
      increment: jest.fn(async () => 1),
    } as unknown as CacheStoreService;
    const cache = new CatalogCacheService(store);
    const load = jest.fn(async () => ({ movies: ["demo"] }));

    const [first, second] = await Promise.all([
      cache.remember("movies:upcoming:1:10", load),
      cache.remember("movies:upcoming:1:10", load),
    ]);
    expect(first).toEqual(second);
    expect(load).toHaveBeenCalledTimes(1);
    await cache.remember("movies:upcoming:1:10", load);
    expect(load).toHaveBeenCalledTimes(1);
  });
});

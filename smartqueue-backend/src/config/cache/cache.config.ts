import { registerAs } from "@nestjs/config";
import type {
  CacheConfig,
  CacheDriver,
} from "@/config/cache/cache-config.interface";
import {
  CACHE_CONFIG_NAMESPACE,
  CACHE_DEFAULTS,
} from "@/config/cache/cache.constants";

export default registerAs(CACHE_CONFIG_NAMESPACE, (): CacheConfig => {
  const driver = process.env.CACHE_DRIVER ?? CACHE_DEFAULTS.driver;
  if (driver !== "memory" && driver !== "redis")
    throw new Error("CACHE_DRIVER debe ser memory o redis");
  const port = Number(process.env.REDIS_PORT ?? CACHE_DEFAULTS.redisPort);
  const database = Number(
    process.env.REDIS_DATABASE ?? CACHE_DEFAULTS.redisDatabase,
  );
  const maxMemoryEntries = Number(
    process.env.CACHE_MEMORY_MAX_ENTRIES ?? CACHE_DEFAULTS.maxMemoryEntries,
  );
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !Number.isInteger(database) ||
    database < 0 ||
    !Number.isInteger(maxMemoryEntries) ||
    maxMemoryEntries < 1
  )
    throw new Error("Configuración de caché inválida");
  return {
    driver: driver as CacheDriver,
    maxMemoryEntries,
    redis: {
      host: process.env.REDIS_HOST ?? CACHE_DEFAULTS.redisHost,
      port,
      password: process.env.REDIS_PASSWORD || undefined,
      database,
      keyPrefix: process.env.REDIS_KEY_PREFIX ?? CACHE_DEFAULTS.redisKeyPrefix,
    },
  };
});

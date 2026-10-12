export const CACHE_CONFIG_NAMESPACE = "cache";
export const CACHE_DEFAULTS = {
  driver: "memory",
  maxMemoryEntries: 2_000,
  redisHost: "localhost",
  redisPort: 6379,
  redisDatabase: 0,
  redisKeyPrefix: "cinetrux:",
} as const;

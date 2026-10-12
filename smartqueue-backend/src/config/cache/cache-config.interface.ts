export type CacheDriver = "memory" | "redis";
export interface CacheConfig {
  driver: CacheDriver;
  maxMemoryEntries: number;
  redis: {
    host: string;
    port: number;
    password?: string;
    database: number;
    keyPrefix: string;
  };
}

import { Logger } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { METRICS_DASHBOARD_CACHE_KEY } from "@/modules/metrics/constants/metrics-cache.constants";

const logger = new Logger("MetricsCache");
/** A cache outage must never turn a committed write into a misleading 500. */
export async function invalidateDashboardCache(
  cache: CacheStoreService,
): Promise<void> {
  try {
    await cache.delete(METRICS_DASHBOARD_CACHE_KEY);
  } catch (error) {
    logger.warn(
      `No se pudo invalidar el dashboard: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

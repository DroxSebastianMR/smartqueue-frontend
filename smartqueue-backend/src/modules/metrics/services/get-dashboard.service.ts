import { Injectable } from "@nestjs/common";
import { QueueStatus } from "@prisma/client";

import { CacheStoreService } from "@/common/cache/cache-store.service";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  METRICS_DASHBOARD_CACHE_KEY,
  METRICS_DASHBOARD_CACHE_TTL_SECONDS,
} from "@/modules/metrics/constants/metrics-cache.constants";

@Injectable()
export class GetDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStoreService,
  ) {}

  async execute() {
    const cached = await this.cache.get(METRICS_DASHBOARD_CACHE_KEY);
    if (cached)
      return JSON.parse(cached) as {
        waiting: number;
        activeBuyers: number;
        completed: number;
        latest: unknown;
      };
    const [waiting, activeBuyers, completed, latest] = await Promise.all([
      this.prisma.queueEntry.count({ where: { status: QueueStatus.WAITING } }),
      this.prisma.queueEntry.count({
        where: { status: { in: [QueueStatus.ADMITTED, QueueStatus.RESERVED] } },
      }),
      this.prisma.purchase.count(),
      this.prisma.predictionLog.findFirst({
        orderBy: { requestedAt: "desc" },
        include: { metricWindow: true },
      }),
    ]);
    const response = { waiting, activeBuyers, completed, latest };
    await this.cache.set(
      METRICS_DASHBOARD_CACHE_KEY,
      JSON.stringify(response),
      METRICS_DASHBOARD_CACHE_TTL_SECONDS,
    );
    return response;
  }
}

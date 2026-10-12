import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueStatus, TelemetryRequestType } from "@prisma/client";

import { PrismaService } from "@/common/prisma/prisma.service";

export function percentile(values: number[], quantile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * quantile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

@Injectable()
export class MetricWindowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async close(runId: string, requestedEnd = new Date()) {
    const run = await this.prisma.experimentRun.findUniqueOrThrow({
      where: { id: runId },
    });
    const windowMs = run.windowSeconds * 1_000;
    const windowEnd = new Date(
      Math.floor(requestedEnd.getTime() / windowMs) * windowMs,
    );
    const existing = await this.prisma.metricWindow.findUnique({
      where: { runId_windowEnd: { runId, windowEnd } },
    });
    if (existing) return existing;

    const windowStart = new Date(windowEnd.getTime() - windowMs);
    const [logs, arrivals, waiting, activeBuyers, completed, previous] =
      await Promise.all([
        this.prisma.operationalRequestLog.findMany({
          where: { runId, timestamp: { gt: windowStart, lte: windowEnd } },
        }),
        this.prisma.queueEntry.count({
          where: {
            eventId: run.eventId,
            createdAt: { gt: windowStart, lte: windowEnd },
          },
        }),
        this.prisma.queueEntry.count({
          where: { eventId: run.eventId, status: QueueStatus.WAITING },
        }),
        this.prisma.queueEntry.count({
          where: {
            eventId: run.eventId,
            status: { in: [QueueStatus.ADMITTED, QueueStatus.RESERVED] },
            OR: [
              { accessExpiresAt: null },
              { accessExpiresAt: { gt: windowEnd } },
            ],
          },
        }),
        this.prisma.purchase.count({
          where: {
            eventId: run.eventId,
            createdAt: { gt: windowStart, lte: windowEnd },
          },
        }),
        this.prisma.metricWindow.findFirst({
          where: { runId, windowEnd: { lt: windowEnd } },
          orderBy: { windowEnd: "desc" },
        }),
      ]);
    const criticalTypes = new Set<TelemetryRequestType>([
      TelemetryRequestType.RESERVATION_CREATE,
      TelemetryRequestType.PURCHASE_CONFIRM,
    ]);
    const critical = logs.filter((log) => criticalTypes.has(log.requestType));
    const durations = critical.map((log) => log.durationMs);
    const technicalErrors = critical.filter((log) => log.technicalError).length;
    const arrivalRate = arrivals / run.windowSeconds;
    const minimumRequests = Number(
      this.config.get("ML_MIN_CRITICAL_REQUESTS", 1),
    );
    const evaluable = critical.length >= minimumRequests;

    return this.prisma.metricWindow.create({
      data: {
        runId,
        windowEnd,
        arrivalRate,
        arrivalTrend: arrivalRate - (previous?.arrivalRate ?? arrivalRate),
        queueLength: waiting,
        activeBuyers,
        admissionLimit: run.currentLimit,
        latencyP50Ms: percentile(durations, 0.5),
        latencyP95Ms: percentile(durations, 0.95),
        latencyP99Ms: percentile(durations, 0.99),
        errorRate: critical.length ? technicalErrors / critical.length : 0,
        completionRate: completed / run.windowSeconds,
        criticalRequestCount: critical.length,
        technicalErrorCount: technicalErrors,
        completedPurchaseCount: completed,
        evaluable,
        exclusionReason: evaluable ? null : "INSUFFICIENT_CRITICAL_REQUESTS",
      },
    });
  }
}

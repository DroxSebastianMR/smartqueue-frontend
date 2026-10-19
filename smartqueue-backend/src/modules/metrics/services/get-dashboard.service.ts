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

  async execute(runId?: string) {
    const key = runId
      ? `${METRICS_DASHBOARD_CACHE_KEY}:${runId}`
      : METRICS_DASHBOARD_CACHE_KEY;
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);
    const run = await this.prisma.experimentRun.findFirst({
      where: runId ? { id: runId } : {},
      orderBy: { startedAt: "desc" },
    });
    if (!run) {
      return {
        run: null,
        kpis: null,
        prediction: null,
        history: [],
        comparison: [],
        message: runId
          ? "No se encontró esa corrida experimental."
          : "Todavía no existen corridas experimentales.",
      };
    }
    const [waiting, activeBuyers, completed, latest, history, comparableRuns] =
      await Promise.all([
        this.prisma.queueEntry.count({
          where: { eventId: run.eventId, status: QueueStatus.WAITING },
        }),
        this.prisma.queueEntry.count({
          where: {
            eventId: run.eventId,
            status: { in: [QueueStatus.ADMITTED, QueueStatus.RESERVED] },
          },
        }),
        this.prisma.purchase.count({ where: { eventId: run.eventId } }),
        this.prisma.predictionLog.findFirst({
          where: { metricWindow: { runId: run.id } },
          orderBy: { requestedAt: "desc" },
          include: { metricWindow: true },
        }),
        this.prisma.metricWindow.findMany({
          where: { runId: run.id },
          orderBy: { windowEnd: "desc" },
          take: 60,
          include: { prediction: true },
        }),
        this.prisma.experimentRun.findMany({
          where: {
            scenario: run.scenario,
            seed: run.seed,
            generatorVersion: run.generatorVersion,
            durationSeconds: run.durationSeconds,
            minLimit: run.minLimit,
            maxLimit: run.maxLimit,
            fixedLimit: run.fixedLimit,
            purchaseProbability: run.purchaseProbability,
            abandonProbability: run.abandonProbability,
            status: "COMPLETED",
          },
          include: { metricWindows: true },
          orderBy: { finishedAt: "desc" },
          take: 30,
        }),
      ]);
    const response = {
      run: {
        id: run.id,
        scenario: run.scenario,
        controlMode: run.controlMode,
        seed: run.seed,
        generatorVersion: run.generatorVersion,
        startedAt: run.startedAt,
        status: run.status,
      },
      kpis: latest
        ? {
            waiting:
              run.status === "RUNNING"
                ? waiting
                : latest.metricWindow.queueLength,
            activeBuyers:
              run.status === "RUNNING"
                ? activeBuyers
                : latest.metricWindow.activeBuyers,
            currentLimit: latest.appliedLimit,
            arrivalRate: latest.metricWindow.arrivalRate,
            latencyP50Ms: latest.metricWindow.latencyP50Ms,
            latencyP95Ms: latest.metricWindow.latencyP95Ms,
            latencyP99Ms: latest.metricWindow.latencyP99Ms,
            errorRate: latest.metricWindow.errorRate,
            throughput: latest.metricWindow.completionRate,
            completed,
          }
        : null,
      prediction: latest
        ? {
            riskScore: latest.riskScore,
            riskClass: latest.riskClass,
            modelVersion: latest.modelVersion,
            horizonSeconds: latest.horizonSeconds,
            predictionAgeMs: latest.predictionAgeMs,
            responseMs: latest.responseMs,
            fallbackUsed: latest.fallbackUsed,
            fallbackReason: latest.fallbackReason,
            previousLimit: latest.previousLimit,
            appliedLimit: latest.appliedLimit,
            appliedMode: latest.appliedMode,
            windowEnd: latest.metricWindow.windowEnd,
            evaluable: latest.metricWindow.evaluable,
          }
        : null,
      history: history.reverse(),
      comparison: this.summarize(comparableRuns),
      message: latest
        ? null
        : "La corrida está activa, pero aún no cerró su primera ventana.",
    };
    await this.cache.set(
      key,
      JSON.stringify(response),
      METRICS_DASHBOARD_CACHE_TTL_SECONDS,
    );
    return response;
  }

  private summarize(
    runs: Array<{
      controlMode: string;
      metricWindows: Array<{
        latencyP95Ms: number;
        errorRate: number;
        completedPurchaseCount: number;
      }>;
    }>,
  ) {
    const groups = new Map<string, typeof runs>();
    for (const run of runs) {
      groups.set(run.controlMode, [
        ...(groups.get(run.controlMode) ?? []),
        run,
      ]);
    }
    return [...groups.entries()].map(([controlMode, modeRuns]) => {
      const windows = modeRuns.flatMap((item) => item.metricWindows);
      const average = (values: number[]) =>
        values.length
          ? values.reduce((total, value) => total + value, 0) / values.length
          : null;
      return {
        controlMode,
        runs: modeRuns.length,
        latencyP95Ms: average(windows.map((item) => item.latencyP95Ms)),
        errorRate: average(windows.map((item) => item.errorRate)),
        completed: windows.reduce(
          (total, item) => total + item.completedPurchaseCount,
          0,
        ),
      };
    });
  }
}

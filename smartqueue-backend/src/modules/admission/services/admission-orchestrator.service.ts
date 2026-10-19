import { Injectable } from "@nestjs/common";
import { ControlMode, Prisma } from "@prisma/client";

import { PrismaService } from "@/common/prisma/prisma.service";
import { ControlMode as PolicyControlMode } from "@/common/enums/control-mode.enum";
import { RunAdmissionService } from "@/modules/admission/services/run-admission.service";
import { nextAdmissionLimit } from "@/modules/admission/utils/admission-policy";
import { MetricWindowService } from "@/modules/metrics/services/metric-window.service";
import { HttpMlClientService } from "@/modules/ml-client/services/http-ml-client.service";

@Injectable()
export class AdmissionOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly windows: MetricWindowService,
    private readonly ml: HttpMlClientService,
    private readonly admission: RunAdmissionService,
  ) {}

  async execute(runId: string, requestedEnd?: Date) {
    const window = await this.windows.close(runId, requestedEnd);
    const run = await this.prisma.experimentRun.findUniqueOrThrow({
      where: { id: runId },
    });
    const claimed = await this.claimWindow(
      window.id,
      run.controlMode,
      run.currentLimit,
    );
    if (!claimed) {
      return this.prisma.predictionLog.findUniqueOrThrow({
        where: { metricWindowId: window.id },
        include: { metricWindow: true },
      });
    }

    const requestedAt = Date.now();
    let riskScore: number | undefined;
    let riskClass: string | undefined;
    let modelVersion: string | undefined;
    let responseMs: number | undefined;
    let predictionAgeMs: number | undefined;
    let fallbackUsed = false;
    let fallbackReason: string | undefined;
    let appliedMode = run.controlMode;

    if (run.controlMode === ControlMode.PREDICTIVE) {
      try {
        if (!window.evaluable) throw new Error("INSUFFICIENT_TELEMETRY");
        const prediction = await this.ml.predict({
          schema_version: "1.0",
          window_end: window.windowEnd.toISOString(),
          features: {
            arrival_rate: window.arrivalRate,
            arrival_trend: window.arrivalTrend,
            queue_length: window.queueLength,
            active_buyers: window.activeBuyers,
            admission_limit: window.admissionLimit,
            latency_p95_ms: window.latencyP95Ms,
            error_rate: window.errorRate,
            completion_rate: window.completionRate,
          },
        });
        responseMs = Date.now() - requestedAt;
        predictionAgeMs = Date.now() - window.windowEnd.getTime();
        if (predictionAgeMs > run.windowSeconds * 2_000) {
          throw new Error("STALE_PREDICTION");
        }
        riskScore = prediction.risk_score;
        riskClass = prediction.risk_class;
        modelVersion = prediction.model_version;
      } catch (error) {
        responseMs = Date.now() - requestedAt;
        fallbackUsed = true;
        fallbackReason = this.fallbackReason(error);
        appliedMode = ControlMode.REACTIVE;
      }
    }

    const recoveryWindows = await this.countHealthyWindows(
      runId,
      run.lowThreshold,
      appliedMode,
    );
    const proposed = nextAdmissionLimit(appliedMode as PolicyControlMode, {
      currentLimit: run.currentLimit,
      minLimit: run.minLimit,
      maxLimit: run.maxLimit,
      latencyP95Ms: window.latencyP95Ms,
      errorRate: window.errorRate,
      riskScore,
      stepUp: run.stepUp,
      stepDown: run.stepDown,
      highThreshold: run.highThreshold,
      lowThreshold: run.lowThreshold,
      cooldownWindows: run.cooldownWindows,
      recoveryWindows,
    });
    const appliedLimit = fallbackUsed
      ? Math.min(run.currentLimit, proposed)
      : proposed;
    const availableSlots = Math.max(0, appliedLimit - window.activeBuyers);

    await this.prisma.$transaction([
      this.prisma.experimentRun.update({
        where: { id: run.id },
        data: { currentLimit: appliedLimit },
      }),
      this.prisma.predictionLog.update({
        where: { metricWindowId: window.id },
        data: {
          riskScore,
          riskClass,
          horizonSeconds: riskScore === undefined ? undefined : 30,
          modelVersion,
          responseMs,
          predictionAgeMs,
          fallbackUsed,
          fallbackReason: fallbackReason ?? null,
          failureReason: null,
          appliedMode,
          appliedLimit,
        },
      }),
    ]);
    const admission = availableSlots
      ? await this.admission.execute(run.eventId, availableSlots)
      : { admitted: 0, entryIds: [], accessExpiresAt: null };
    return {
      ...(await this.prisma.predictionLog.findUniqueOrThrow({
        where: { metricWindowId: window.id },
        include: { metricWindow: true },
      })),
      admission,
    };
  }

  private async claimWindow(
    metricWindowId: string,
    mode: ControlMode,
    currentLimit: number,
  ) {
    try {
      await this.prisma.predictionLog.create({
        data: {
          metricWindowId,
          fallbackUsed: true,
          fallbackReason: "PROCESSING",
          failureReason: "PROCESSING",
          appliedMode: mode,
          previousLimit: currentLimit,
          appliedLimit: currentLimit,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return false;
      }
      throw error;
    }
  }

  private async countHealthyWindows(
    runId: string,
    lowThreshold: number,
    mode: ControlMode,
  ) {
    const recent = await this.prisma.predictionLog.findMany({
      where: { metricWindow: { runId }, failureReason: null },
      include: { metricWindow: true },
      orderBy: { requestedAt: "desc" },
      take: 20,
    });
    let count = 0;
    for (const prediction of recent) {
      const metrics = prediction.metricWindow;
      if (
        !metrics.evaluable ||
        metrics.latencyP95Ms >= 650 ||
        metrics.errorRate >= 0.02
      )
        break;
      if (
        mode === ControlMode.PREDICTIVE &&
        (prediction.fallbackUsed || (prediction.riskScore ?? 1) > lowThreshold)
      )
        break;
      count += 1;
    }
    return count;
  }

  private fallbackReason(error: unknown) {
    const message = error instanceof Error ? error.message : "ML_UNKNOWN_ERROR";
    if (/timeout/i.test(message)) return "ML_TIMEOUT";
    if (/503|MODEL_UNAVAILABLE/i.test(message)) return "MODEL_UNAVAILABLE";
    if (
      /ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ECONNRESET|Network Error/i.test(
        message,
      )
    )
      return "ML_SERVICE_UNAVAILABLE";
    if (/STALE_PREDICTION/i.test(message)) return "STALE_PREDICTION";
    if (/INSUFFICIENT_TELEMETRY/i.test(message))
      return "INSUFFICIENT_TELEMETRY";
    return "INVALID_ML_RESPONSE";
  }
}

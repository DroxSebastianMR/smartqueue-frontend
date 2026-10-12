import { HttpException, Injectable, Logger } from "@nestjs/common";
import { TelemetryRequestType, TelemetryResult } from "@prisma/client";
import { createHash } from "node:crypto";

import { PrismaService } from "@/common/prisma/prisma.service";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";

export interface TelemetryContext {
  requestType: TelemetryRequestType;
  eventId: string;
  queueEntryId?: string;
  participantToken?: string;
  runId?: string;
}

@Injectable()
export class OperationalTelemetryService {
  private readonly logger = new Logger(OperationalTelemetryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async capture<T>(context: TelemetryContext, operation: () => Promise<T>) {
    const startedAt = performance.now();
    try {
      const result = await operation();
      await this.persist(context, {
        durationMs: Math.round(performance.now() - startedAt),
        statusCode: 201,
        result: TelemetryResult.SUCCESS,
        technicalError: false,
        businessRejection: false,
      });
      return result;
    } catch (error) {
      const classified = this.classify(error);
      await this.persist(context, {
        ...classified,
        durationMs: Math.round(performance.now() - startedAt),
      });
      throw error;
    }
  }

  private classify(error: unknown) {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      const code =
        typeof response === "object" && response !== null && "code" in response
          ? String(response.code)
          : undefined;
      if (code === CinemaErrorCode.INSUFFICIENT_STOCK) {
        return this.failure(
          error.getStatus(),
          TelemetryResult.STOCK_REJECTION,
          code,
          false,
        );
      }
      if (
        code === CinemaErrorCode.RESERVATION_EXPIRED ||
        code === CinemaErrorCode.RESERVATION_INVALID ||
        code === CinemaErrorCode.QUEUE_ACCESS_DENIED
      ) {
        return this.failure(
          error.getStatus(),
          TelemetryResult.ACCESS_EXPIRED,
          code,
          false,
        );
      }
      if (error.getStatus() < 500) {
        return this.failure(
          error.getStatus(),
          TelemetryResult.VALIDATION_REJECTION,
          code,
          false,
        );
      }
      return this.failure(
        error.getStatus(),
        TelemetryResult.SERVER_ERROR,
        code,
        true,
      );
    }
    const timeout = error instanceof Error && /timeout/i.test(error.message);
    return this.failure(
      timeout ? 504 : 500,
      timeout ? TelemetryResult.TIMEOUT : TelemetryResult.TECHNICAL_ERROR,
      error instanceof Error ? error.name : "UNKNOWN_ERROR",
      true,
    );
  }

  private failure(
    statusCode: number,
    result: TelemetryResult,
    errorCode: string | undefined,
    technicalError: boolean,
  ) {
    return {
      statusCode,
      result,
      errorCode,
      technicalError,
      businessRejection: !technicalError,
    };
  }

  private async persist(
    context: TelemetryContext,
    outcome: {
      durationMs: number;
      statusCode: number;
      result: TelemetryResult;
      technicalError: boolean;
      businessRejection: boolean;
      errorCode?: string;
    },
  ) {
    try {
      const [entry, activeRun] = await Promise.all([
        context.queueEntryId
          ? this.prisma.queueEntry.findUnique({
              where: { id: context.queueEntryId },
            })
          : Promise.resolve(null),
        context.runId
          ? Promise.resolve(null)
          : this.prisma.experimentRun.findFirst({
              where: { eventId: context.eventId, status: "RUNNING" },
              orderBy: { startedAt: "desc" },
            }),
      ]);
      const participant =
        context.participantToken ?? entry?.participantToken ?? "anonymous";
      await this.prisma.operationalRequestLog.create({
        data: {
          ...outcome,
          requestType: context.requestType,
          eventId: context.eventId,
          runId: context.runId ?? activeRun?.id,
          participantHash: createHash("sha256")
            .update(participant)
            .digest("hex"),
        },
      });
    } catch (error) {
      // Observability must never break the protected purchase transaction.
      this.logger.error("Operational telemetry could not be persisted", error);
    }
  }
}

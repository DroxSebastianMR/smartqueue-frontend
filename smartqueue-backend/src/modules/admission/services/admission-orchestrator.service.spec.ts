import { ControlMode } from "@prisma/client";

import { AdmissionOrchestratorService } from "@/modules/admission/services/admission-orchestrator.service";

const window = {
  id: "window-1",
  runId: "run-1",
  windowEnd: new Date(),
  arrivalRate: 2,
  arrivalTrend: 1,
  queueLength: 10,
  activeBuyers: 4,
  admissionLimit: 10,
  latencyP50Ms: 100,
  latencyP95Ms: 1_200,
  latencyP99Ms: 1_300,
  errorRate: 0.08,
  completionRate: 1,
  criticalRequestCount: 4,
  technicalErrorCount: 1,
  completedPurchaseCount: 1,
  schemaVersion: "1.0",
  evaluable: true,
  exclusionReason: null,
  saturationLabel: null,
};
const run = {
  id: "run-1",
  eventId: "event-1",
  controlMode: ControlMode.PREDICTIVE,
  currentLimit: 10,
  minLimit: 2,
  maxLimit: 20,
  stepUp: 1,
  stepDown: 2,
  highThreshold: 0.65,
  lowThreshold: 0.35,
  cooldownWindows: 2,
  windowSeconds: 10,
};

describe("AdmissionOrchestratorService", () => {
  it("persists timeout fallback and uses conservative reactive admission", async () => {
    const update = jest.fn().mockResolvedValue({});
    const prisma = {
      experimentRun: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(run),
        update: jest.fn().mockResolvedValue({}),
      },
      predictionLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        update,
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "prediction-1" }),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const ml = { predict: jest.fn().mockRejectedValue(new Error("Timeout has occurred")) };
    const admission = { execute: jest.fn().mockResolvedValue({ admitted: 4 }) };
    const service = new AdmissionOrchestratorService(
      prisma as never,
      { close: jest.fn().mockResolvedValue(window) } as never,
      ml as never,
      admission as never,
    );
    await service.execute("run-1");
    expect(ml.predict).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fallbackUsed: true,
          fallbackReason: "ML_TIMEOUT",
          appliedMode: ControlMode.REACTIVE,
        }),
      }),
    );
    expect(admission.execute).toHaveBeenCalledWith("event-1", 4);
  });
});

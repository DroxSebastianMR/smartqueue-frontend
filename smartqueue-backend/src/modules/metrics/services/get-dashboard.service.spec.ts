import { GetDashboardService } from "./get-dashboard.service";

describe("GetDashboardService", () => {
  it("returns historical decisions and matches comparison runs by trace metadata across events", async () => {
    const run = {
      id: "run-1",
      eventId: "event-1",
      status: "COMPLETED",
      scenario: "BURST",
      seed: 42,
      generatorVersion: "clients-v1-same-trace",
      durationSeconds: 60,
      minLimit: 2,
      maxLimit: 10,
      fixedLimit: 4,
      purchaseProbability: 0.85,
      abandonProbability: 0.15,
      controlMode: "PREDICTIVE",
      startedAt: new Date(),
    };
    const metricWindow = {
      id: "window-2",
      windowEnd: new Date(),
      queueLength: 2,
      activeBuyers: 0,
      arrivalRate: 1,
      latencyP50Ms: 20,
      latencyP95Ms: 30,
      latencyP99Ms: 40,
      errorRate: 0,
      completionRate: 0.2,
      completedPurchaseCount: 2,
      evaluable: false,
    };
    const latest = {
      metricWindow,
      appliedLimit: 4,
      previousLimit: 4,
      appliedMode: "REACTIVE",
      fallbackUsed: true,
      fallbackReason: "INSUFFICIENT_TELEMETRY",
      riskScore: null,
      riskClass: null,
      modelVersion: null,
    };
    const history = [
      {
        ...metricWindow,
        prediction: {
          modelVersion: "bootstrap-v1",
          riskScore: 0.25,
          fallbackUsed: false,
          appliedMode: "PREDICTIVE",
          appliedLimit: 5,
        },
      },
      { ...metricWindow, prediction: latest },
    ];
    const prisma = {
      experimentRun: {
        findFirst: jest.fn().mockResolvedValue(run),
        findMany: jest.fn().mockResolvedValue([
          {
            controlMode: "FIXED",
            metricWindows: [metricWindow],
          },
        ]),
      },
      queueEntry: { count: jest.fn().mockResolvedValue(99) },
      purchase: { count: jest.fn().mockResolvedValue(2) },
      predictionLog: { findFirst: jest.fn().mockResolvedValue(latest) },
      metricWindow: { findMany: jest.fn().mockResolvedValue(history) },
    };
    const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
    const dashboard = new GetDashboardService(prisma as never, cache as never);
    const response = await dashboard.execute("run-1");
    const decisions = response.history as Array<{
      prediction?: { modelVersion?: string };
    }>;
    expect(
      decisions.some(
        (point) => point.prediction?.modelVersion === "bootstrap-v1",
      ),
    ).toBe(true);
    expect(response.prediction?.fallbackReason).toBe("INSUFFICIENT_TELEMETRY");
    expect(response.kpis?.waiting).toBe(2);
    expect(prisma.experimentRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scenario: "BURST",
          seed: 42,
          generatorVersion: "clients-v1-same-trace",
          durationSeconds: 60,
          status: "COMPLETED",
        }),
      }),
    );
    expect(prisma.metricWindow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { prediction: true },
      }),
    );
  });
});

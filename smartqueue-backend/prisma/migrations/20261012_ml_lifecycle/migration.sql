-- SmartQueue ML lifecycle: reproducible runs, operational telemetry, windows and predictions.
CREATE TYPE "ExperimentScenario" AS ENUM ('NORMAL', 'BURST', 'SUSTAINED_PEAK', 'STEPPED');
CREATE TYPE "ExperimentStatus" AS ENUM ('RUNNING', 'COMPLETED', 'CANCELLED', 'FAILED');
CREATE TYPE "TelemetryRequestType" AS ENUM ('QUEUE_JOIN', 'RESERVATION_CREATE', 'PURCHASE_CONFIRM');
CREATE TYPE "TelemetryResult" AS ENUM ('SUCCESS', 'TECHNICAL_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'VALIDATION_REJECTION', 'STOCK_REJECTION', 'ACCESS_EXPIRED', 'BUSINESS_REJECTION');

ALTER TABLE "ExperimentRun"
  ADD COLUMN "eventId" TEXT,
  ADD COLUMN "status" "ExperimentStatus" NOT NULL DEFAULT 'RUNNING',
  ADD COLUMN "schemaVersion" TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN "windowSeconds" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN "horizonSeconds" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "durationSeconds" INTEGER NOT NULL DEFAULT 300,
  ADD COLUMN "minLimit" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "maxLimit" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "currentLimit" INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN "fixedLimit" INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN "stepUp" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "stepDown" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "highThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
  ADD COLUMN "lowThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
  ADD COLUMN "cooldownWindows" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "latencyThresholdMs" DOUBLE PRECISION NOT NULL DEFAULT 1000,
  ADD COLUMN "errorThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  ADD COLUMN "arrivalProfile" JSONB,
  ADD COLUMN "purchaseProbability" DOUBLE PRECISION,
  ADD COLUMN "abandonProbability" DOUBLE PRECISION;

UPDATE "ExperimentRun" SET "eventId" = (SELECT "id" FROM "Event" ORDER BY "createdAt" LIMIT 1)
WHERE "eventId" IS NULL;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "ExperimentRun" WHERE "eventId" IS NULL) THEN
    RAISE EXCEPTION 'Existing ExperimentRun rows require an Event before this migration';
  END IF;
END $$;
ALTER TABLE "ExperimentRun" ALTER COLUMN "eventId" SET NOT NULL;
ALTER TABLE "ExperimentRun" ALTER COLUMN "scenario" TYPE "ExperimentScenario" USING "scenario"::"ExperimentScenario";

ALTER TABLE "MetricWindow"
  ADD COLUMN "latencyP50Ms" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "latencyP99Ms" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "criticalRequestCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "technicalErrorCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "completedPurchaseCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "schemaVersion" TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN "exclusionReason" TEXT;

ALTER TABLE "PredictionLog"
  ADD COLUMN "predictionAgeMs" INTEGER,
  ADD COLUMN "fallbackReason" TEXT,
  ADD COLUMN "previousLimit" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "OperationalRequestLog" (
  "id" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestType" "TelemetryRequestType" NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "result" "TelemetryResult" NOT NULL,
  "technicalError" BOOLEAN NOT NULL DEFAULT false,
  "businessRejection" BOOLEAN NOT NULL DEFAULT false,
  "eventId" TEXT NOT NULL,
  "runId" TEXT,
  "participantHash" TEXT NOT NULL,
  "errorCode" TEXT,
  CONSTRAINT "OperationalRequestLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExperimentRun_eventId_status_idx" ON "ExperimentRun"("eventId", "status");
CREATE INDEX "ExperimentRun_scenario_controlMode_seed_idx" ON "ExperimentRun"("scenario", "controlMode", "seed");
CREATE INDEX "MetricWindow_runId_windowEnd_idx" ON "MetricWindow"("runId", "windowEnd");
CREATE INDEX "OperationalRequestLog_runId_timestamp_idx" ON "OperationalRequestLog"("runId", "timestamp");
CREATE INDEX "OperationalRequestLog_eventId_requestType_timestamp_idx" ON "OperationalRequestLog"("eventId", "requestType", "timestamp");
CREATE INDEX "OperationalRequestLog_technicalError_timestamp_idx" ON "OperationalRequestLog"("technicalError", "timestamp");

ALTER TABLE "ExperimentRun" ADD CONSTRAINT "ExperimentRun_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationalRequestLog" ADD CONSTRAINT "OperationalRequestLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalRequestLog" ADD CONSTRAINT "OperationalRequestLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ExperimentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

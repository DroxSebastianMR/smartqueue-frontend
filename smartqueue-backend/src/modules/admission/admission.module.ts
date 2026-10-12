import { Module } from "@nestjs/common";

import { RunAdmissionService } from "@/modules/admission/services/run-admission.service";
import { AdmissionController } from "@/modules/admission/controllers/admission.controller";
import { MlClientModule } from "@/modules/ml-client/ml-client.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { QueueModule } from "@/modules/queue/queue.module";
import { MetricsModule } from "@/modules/metrics/metrics.module";
import { AdmissionOrchestratorService } from "@/modules/admission/services/admission-orchestrator.service";

@Module({
  imports: [MlClientModule, AuthModule, QueueModule, MetricsModule],
  controllers: [AdmissionController],
  providers: [RunAdmissionService, AdmissionOrchestratorService],
})
export class AdmissionModule {}

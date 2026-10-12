import { Module } from "@nestjs/common";

import { RunAdmissionService } from "@/modules/admission/services/run-admission.service";
import { AdmissionController } from "@/modules/admission/controllers/admission.controller";
import { MlClientModule } from "@/modules/ml-client/ml-client.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { QueueModule } from "@/modules/queue/queue.module";

@Module({
  imports: [MlClientModule, AuthModule, QueueModule],
  controllers: [AdmissionController],
  providers: [RunAdmissionService],
})
export class AdmissionModule {}

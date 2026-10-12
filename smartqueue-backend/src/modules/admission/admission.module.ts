import { Module } from '@nestjs/common';

import { CalculateAdmissionUseCase } from '@/modules/admission/application/use-cases/calculate-admission.use-case';
import { RunAdmissionUseCase } from '@/modules/admission/application/use-cases/run-admission.use-case';
import { AdmissionController } from '@/modules/admission/presentation/controllers/admission.controller';
import { MlClientModule } from '@/modules/ml-client/ml-client.module';

@Module({
  imports: [MlClientModule],
  controllers: [AdmissionController],
  providers: [CalculateAdmissionUseCase, RunAdmissionUseCase],
  exports: [CalculateAdmissionUseCase],
})
export class AdmissionModule {}


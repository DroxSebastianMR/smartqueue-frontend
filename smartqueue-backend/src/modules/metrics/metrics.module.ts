import { Module } from '@nestjs/common';

import { GetDashboardUseCase } from '@/modules/metrics/application/use-cases/get-dashboard.use-case';
import { MetricsController } from '@/modules/metrics/presentation/controllers/metrics.controller';

@Module({ controllers: [MetricsController], providers: [GetDashboardUseCase] })
export class MetricsModule {}


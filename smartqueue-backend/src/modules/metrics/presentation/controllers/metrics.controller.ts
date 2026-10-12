import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetDashboardUseCase } from '@/modules/metrics/application/use-cases/get-dashboard.use-case';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly dashboard: GetDashboardUseCase) {}
  @Get('dashboard')
  getDashboard() {
    return this.dashboard.execute();
  }
}


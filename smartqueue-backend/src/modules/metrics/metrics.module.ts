import { Module } from "@nestjs/common";

import { GetDashboardService } from "@/modules/metrics/services/get-dashboard.service";
import { MetricsController } from "@/modules/metrics/controllers/metrics.controller";
import { AuthModule } from "@/modules/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [MetricsController],
  providers: [GetDashboardService],
})
export class MetricsModule {}

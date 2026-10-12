import { Module } from "@nestjs/common";

import { GetDashboardService } from "@/modules/metrics/services/get-dashboard.service";
import { MetricsController } from "@/modules/metrics/controllers/metrics.controller";
import { AuthModule } from "@/modules/auth/auth.module";
import { OperationalTelemetryService } from "@/modules/metrics/services/operational-telemetry.service";
import { MetricWindowService } from "@/modules/metrics/services/metric-window.service";
import { GetRunWindowsService } from "@/modules/metrics/services/get-run-windows.service";

@Module({
  imports: [AuthModule],
  controllers: [MetricsController],
  providers: [
    GetDashboardService,
    OperationalTelemetryService,
    MetricWindowService,
    GetRunWindowsService,
  ],
  exports: [OperationalTelemetryService, MetricWindowService],
})
export class MetricsModule {}

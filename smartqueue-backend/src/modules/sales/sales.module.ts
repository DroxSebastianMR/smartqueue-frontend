import { Module } from "@nestjs/common";

import { ConfirmPurchaseService } from "@/modules/sales/services/confirm-purchase.service";
import { ReserveTicketsService } from "@/modules/sales/services/reserve-tickets.service";
import { SalesController } from "@/modules/sales/controllers/sales.controller";
import { AuthModule } from "@/modules/auth/auth.module";
import { QueueModule } from "@/modules/queue/queue.module";
import { MetricsModule } from "@/modules/metrics/metrics.module";

@Module({
  imports: [AuthModule, QueueModule, MetricsModule],
  controllers: [SalesController],
  providers: [ReserveTicketsService, ConfirmPurchaseService],
})
export class SalesModule {}

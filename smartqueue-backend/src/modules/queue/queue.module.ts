import { Module } from "@nestjs/common";
import { QueueLifecycleService } from "./services/queue-lifecycle.service";

import { GetQueueStatusService } from "@/modules/queue/services/get-queue-status.service";
import { JoinQueueService } from "@/modules/queue/services/join-queue.service";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";
import { QUEUE_REPOSITORY } from "@/modules/queue/repositories/queue.repository";
import { PrismaQueueRepository } from "@/modules/queue/repositories/prisma-queue.repository";
import { QueueController } from "@/modules/queue/controllers/queue.controller";
import { AuthModule } from "@/modules/auth/auth.module";
import { MetricsModule } from "@/modules/metrics/metrics.module";

@Module({
  imports: [AuthModule, MetricsModule],
  controllers: [QueueController],
  providers: [
    QueueLifecycleService,
    JoinQueueService,
    GetQueueStatusService,
    QueueCacheService,
    { provide: QUEUE_REPOSITORY, useClass: PrismaQueueRepository },
  ],
  exports: [QueueCacheService],
})
export class QueueModule {}

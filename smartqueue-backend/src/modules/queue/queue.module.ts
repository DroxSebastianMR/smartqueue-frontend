import { Module } from '@nestjs/common';

import { GetQueueStatusUseCase } from '@/modules/queue/application/use-cases/get-queue-status.use-case';
import { JoinQueueUseCase } from '@/modules/queue/application/use-cases/join-queue.use-case';
import { QUEUE_REPOSITORY } from '@/modules/queue/domain/repositories/queue.repository';
import { PrismaQueueRepository } from '@/modules/queue/infrastructure/repositories/prisma-queue.repository';
import { QueueController } from '@/modules/queue/presentation/controllers/queue.controller';

@Module({
  controllers: [QueueController],
  providers: [
    JoinQueueUseCase,
    GetQueueStatusUseCase,
    { provide: QUEUE_REPOSITORY, useClass: PrismaQueueRepository },
  ],
})
export class QueueModule {}


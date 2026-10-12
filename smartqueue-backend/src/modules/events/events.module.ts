import { Module } from '@nestjs/common';

import { GetEventUseCase } from '@/modules/events/application/use-cases/get-event.use-case';
import { EVENT_REPOSITORY } from '@/modules/events/domain/repositories/event.repository';
import { PrismaEventRepository } from '@/modules/events/infrastructure/repositories/prisma-event.repository';
import { EventsController } from '@/modules/events/presentation/controllers/events.controller';

@Module({
  controllers: [EventsController],
  providers: [GetEventUseCase, { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository }],
})
export class EventsModule {}


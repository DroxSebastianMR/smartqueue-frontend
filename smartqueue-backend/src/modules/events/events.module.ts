import { Module } from "@nestjs/common";

import { GetEventService } from "@/modules/events/services/get-event.service";
import { EVENT_REPOSITORY } from "@/modules/events/repositories/event.repository";
import { PrismaEventRepository } from "@/modules/events/repositories/prisma-event.repository";
import { EventsController } from "@/modules/events/controllers/events.controller";

@Module({
  controllers: [EventsController],
  providers: [
    GetEventService,
    { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository },
  ],
})
export class EventsModule {}

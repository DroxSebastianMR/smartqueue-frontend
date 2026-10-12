import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetEventUseCase } from '@/modules/events/application/use-cases/get-event.use-case';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly getEvent: GetEventUseCase) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.getEvent.execute(slug);
  }
}


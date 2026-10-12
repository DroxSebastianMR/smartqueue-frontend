import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetQueueStatusUseCase } from '@/modules/queue/application/use-cases/get-queue-status.use-case';
import { JoinQueueUseCase } from '@/modules/queue/application/use-cases/join-queue.use-case';
import { JoinQueueDto } from '@/modules/queue/presentation/dto/join-queue.dto';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(
    private readonly joinQueue: JoinQueueUseCase,
    private readonly getStatus: GetQueueStatusUseCase,
  ) {}

  @Post('entries')
  join(@Body() dto: JoinQueueDto) {
    return this.joinQueue.execute(dto.eventId, dto.participantToken);
  }

  @Get('events/:eventId/status')
  status(@Param('eventId') eventId: string, @Query('token') token: string) {
    return this.getStatus.execute(eventId, token);
  }
}


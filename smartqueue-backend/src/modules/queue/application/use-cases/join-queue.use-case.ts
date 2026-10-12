import { Inject, Injectable } from '@nestjs/common';

import {
  QUEUE_REPOSITORY,
  type QueueRepository,
} from '@/modules/queue/domain/repositories/queue.repository';

@Injectable()
export class JoinQueueUseCase {
  constructor(@Inject(QUEUE_REPOSITORY) private readonly queue: QueueRepository) {}
  async execute(eventId: string, participantToken: string) {
    const entry = await this.queue.join(eventId, participantToken);
    return { ...entry, turnNumber: Number(entry.turnNumber) };
  }
}


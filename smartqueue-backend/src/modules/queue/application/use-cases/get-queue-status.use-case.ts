import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { QUEUE_REPOSITORY, type QueueRepository } from '@/modules/queue/domain/repositories/queue.repository';

@Injectable()
export class GetQueueStatusUseCase {
  constructor(@Inject(QUEUE_REPOSITORY) private readonly queue: QueueRepository) {}
  async execute(eventId: string, token: string) {
    const snapshot = await this.queue.getSnapshot(eventId, token);
    if (!snapshot) throw new NotFoundException('Queue entry not found');
    return { ...snapshot, entry: { ...snapshot.entry, turnNumber: Number(snapshot.entry.turnNumber) } };
  }
}


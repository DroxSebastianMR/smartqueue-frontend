import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  EVENT_REPOSITORY,
  type EventRepository,
} from '@/modules/events/domain/repositories/event.repository';

@Injectable()
export class GetEventUseCase {
  constructor(@Inject(EVENT_REPOSITORY) private readonly events: EventRepository) {}

  async execute(slug: string) {
    const event = await this.events.findActiveBySlug(slug);
    if (!event) throw new NotFoundException('Active event not found');
    return event;
  }
}


import type { Event } from '@/features/events/domain/event';
import { EventRepository } from '@/features/events/infrastructure/event.repository';

export class GetFeaturedEventUseCase {
  constructor(private readonly repository = new EventRepository()) {}
  execute(): Promise<Event> {
    return this.repository.findFeatured();
  }
}


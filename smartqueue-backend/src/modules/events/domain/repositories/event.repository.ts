import type { EventEntity } from '@/modules/events/domain/entities/event.entity';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export interface EventRepository {
  findActiveBySlug(slug: string): Promise<EventEntity | null>;
}


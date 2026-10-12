import type { QueueEntryEntity } from '@/modules/queue/domain/entities/queue-entry.entity';

export const QUEUE_REPOSITORY = Symbol('QUEUE_REPOSITORY');

export interface QueueSnapshot {
  entry: QueueEntryEntity;
  peopleAhead: number;
  estimatedWaitMinutes: number | null;
}

export interface QueueRepository {
  join(eventId: string, participantToken: string): Promise<QueueEntryEntity>;
  getSnapshot(eventId: string, participantToken: string): Promise<QueueSnapshot | null>;
  cancel(eventId: string, participantToken: string): Promise<QueueEntryEntity | null>;
}


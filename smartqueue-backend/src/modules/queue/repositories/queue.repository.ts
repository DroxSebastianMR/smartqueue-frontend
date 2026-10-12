import type { QueueEntryEntity } from "@/modules/queue/types/queue-entry.types";

export const QUEUE_REPOSITORY = Symbol("QUEUE_REPOSITORY");

export interface QueueSnapshot {
  entry: QueueEntryEntity;
  peopleAhead: number;
  estimatedWaitMinutes: number | null;
}

export interface QueueRepository {
  join(eventId: string, participantToken: string): Promise<QueueEntryEntity>;
  getSnapshot(
    eventId: string,
    participantToken: string,
  ): Promise<QueueSnapshot | null>;
}

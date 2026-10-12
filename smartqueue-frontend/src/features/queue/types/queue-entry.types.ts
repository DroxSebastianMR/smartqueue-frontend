import type { QueueStatus } from '@/features/queue/enums/queue-status.enum';

export interface QueueEntry {
  id: string;
  eventId: string;
  participantToken: string;
  turnNumber: number;
  status: QueueStatus;
  admittedAt: string | null;
  accessExpiresAt: string | null;
  createdAt: string;
}

export interface QueueSnapshot {
  entry: QueueEntry;
  peopleAhead: number;
  estimatedWaitMinutes: number | null;
}

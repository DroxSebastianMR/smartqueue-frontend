import type { QueueStatus } from '@/common/enums/queue-status.enum';

export interface QueueEntryEntity {
  id: string;
  eventId: string;
  participantToken: string;
  turnNumber: bigint;
  status: QueueStatus;
  admittedAt: Date | null;
  accessExpiresAt: Date | null;
  createdAt: Date;
}


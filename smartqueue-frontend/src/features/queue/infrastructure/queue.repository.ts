import { QueueStatus } from '@/features/queue/domain/enums/queue-status.enum';
import type { QueueEntry, QueueSnapshot } from '@/features/queue/domain/queue-entry';
import { apiGet, apiPost, useMocks } from '@/services/api/client';

export const DEMO_EVENT_ID = '001f5a1b-9a0e-4cb4-8c76-8fe880bfe17d';

function participantToken() {
  const stored = localStorage.getItem('smartqueue.participant-token');
  if (stored) return stored;
  const token = crypto.randomUUID();
  localStorage.setItem('smartqueue.participant-token', token);
  return token;
}

const mockEntry: QueueEntry = {
  id: '001f5a1b-9a0e-4cb4-8c76-8fe880bfe18e', eventId: DEMO_EVENT_ID,
  participantToken: 'demo-participant-token', turnNumber: 42, status: QueueStatus.WAITING,
  admittedAt: null, accessExpiresAt: null, createdAt: new Date().toISOString(),
};

export class QueueRepository {
  async join(eventId = DEMO_EVENT_ID): Promise<QueueEntry> {
    if (useMocks) return mockEntry;
    const entry = await apiPost<QueueEntry>('/queue/entries', { eventId, participantToken: participantToken() });
    localStorage.setItem('smartqueue.queue-entry-id', entry.id);
    return entry;
  }

  async status(eventId = DEMO_EVENT_ID): Promise<QueueSnapshot> {
    if (useMocks) return { entry: mockEntry, peopleAhead: 17, estimatedWaitMinutes: 4 };
    return apiGet<QueueSnapshot>(`/queue/events/${eventId}/status?token=${encodeURIComponent(participantToken())}`);
  }

  async runAdmission(eventId = DEMO_EVENT_ID): Promise<void> {
    if (useMocks) { mockEntry.status = QueueStatus.ADMITTED; return; }
    await apiPost(`/admission/events/${eventId}/run`, { slots: 1 });
  }
}

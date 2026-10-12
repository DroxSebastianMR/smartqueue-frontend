import { QueueStatus } from '@/features/queue/enums/queue-status.enum';
import type { QueueEntry, QueueSnapshot } from '@/features/queue/types/queue-entry.types';
import { apiGet, apiPost, useMocks } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

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

export const queueService = {
  async join(eventId = DEMO_EVENT_ID): Promise<QueueEntry> {
    if (useMocks) return mockEntry;
    const entry = await apiPost<QueueEntry>(API_ENDPOINTS.QUEUE.JOIN, { eventId, participantToken: participantToken() });
    localStorage.setItem('smartqueue.queue-entry-id', entry.id);
    return entry;
  },

  async status(eventId = DEMO_EVENT_ID): Promise<QueueSnapshot> {
    if (useMocks) return { entry: mockEntry, peopleAhead: 17, estimatedWaitMinutes: 4 };
    return apiGet<QueueSnapshot>(`${API_ENDPOINTS.QUEUE.STATUS(eventId)}?token=${encodeURIComponent(participantToken())}`);
  },

  async runAdmission(eventId = DEMO_EVENT_ID): Promise<void> {
    if (useMocks) { mockEntry.status = QueueStatus.ADMITTED; return; }
    await apiPost(API_ENDPOINTS.ADMISSION.RUN(eventId), { slots: 1 });
  },
};

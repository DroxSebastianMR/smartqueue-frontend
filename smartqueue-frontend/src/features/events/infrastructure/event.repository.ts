import type { Event } from '@/features/events/domain/event';
import { apiGet, useMocks } from '@/services/api/client';

const demoEvent: Event = {
  id: '001f5a1b-9a0e-4cb4-8c76-8fe880bfe17d',
  slug: 'estreno-galactico',
  name: 'Doomsday: estreno de medianoche',
  description: 'Una preventa ficticia para poner a prueba una cola inteligente bajo alta demanda.',
  dateLabel: 'Jueves 17 · 11:45 p. m.',
  availableStock: 100,
  capacity: 100,
};

export class EventRepository {
  async findFeatured(): Promise<Event> {
    if (useMocks) return demoEvent;
    const event = await apiGet<Omit<Event, 'dateLabel'>>(`/events/${demoEvent.slug}`);
    const date = event.startsAt ? new Date(event.startsAt) : null;
    return {
      ...event,
      dateLabel: date
        ? new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
        : demoEvent.dateLabel,
    };
  }
}


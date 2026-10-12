export interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  startsAt?: string;
  dateLabel: string;
  availableStock: number;
  capacity: number;
}


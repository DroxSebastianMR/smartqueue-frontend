export interface EventEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  startsAt: Date;
  capacity: number;
  availableStock: number;
  isActive: boolean;
}


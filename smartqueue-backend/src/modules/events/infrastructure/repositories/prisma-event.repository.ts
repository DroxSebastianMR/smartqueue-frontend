import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import type { EventRepository } from '@/modules/events/domain/repositories/event.repository';

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveBySlug(slug: string) {
    return this.prisma.event.findFirst({ where: { slug, isActive: true } });
  }
}


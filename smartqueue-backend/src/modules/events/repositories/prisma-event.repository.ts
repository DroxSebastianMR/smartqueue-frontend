import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/common/prisma/prisma.service";
import type { EventRepository } from "@/modules/events/repositories/event.repository";

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveBySlug(slug: string) {
    return this.prisma.event.findFirst({ where: { slug, isActive: true } });
  }
}

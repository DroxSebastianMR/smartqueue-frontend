import { Injectable } from '@nestjs/common';
import { QueueStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class GetDashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [waiting, activeBuyers, completed, latest] = await Promise.all([
      this.prisma.queueEntry.count({ where: { status: QueueStatus.WAITING } }),
      this.prisma.queueEntry.count({ where: { status: { in: [QueueStatus.ADMITTED, QueueStatus.RESERVED] } } }),
      this.prisma.purchase.count(),
      this.prisma.predictionLog.findFirst({ orderBy: { requestedAt: 'desc' }, include: { metricWindow: true } }),
    ]);
    return { waiting, activeBuyers, completed, latest };
  }
}


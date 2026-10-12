import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class GetRunWindowsService {
  constructor(private readonly prisma: PrismaService) {}

  execute(runId: string) {
    return this.prisma.metricWindow.findMany({
      where: { runId },
      orderBy: { windowEnd: "asc" },
      include: { run: true, prediction: true },
    });
  }
}

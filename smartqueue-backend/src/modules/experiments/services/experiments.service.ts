import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/common/prisma/prisma.service";
import { StartExperimentDto } from "@/modules/experiments/dto/start-experiment.dto";

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: StartExperimentDto) {
    if (dto.minLimit > dto.initialLimit || dto.initialLimit > dto.maxLimit) {
      throw new BadRequestException(
        "minLimit <= initialLimit <= maxLimit is required",
      );
    }
    if ((dto.lowThreshold ?? 0.35) >= (dto.highThreshold ?? 0.65)) {
      throw new BadRequestException(
        "lowThreshold must be lower than highThreshold",
      );
    }
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException("Event not found");
    await this.prisma.experimentRun.updateMany({
      where: { eventId: dto.eventId, status: "RUNNING" },
      data: { status: "CANCELLED", finishedAt: new Date() },
    });
    return this.prisma.experimentRun.create({
      data: {
        eventId: dto.eventId,
        scenario: dto.scenario,
        controlMode: dto.controlMode,
        seed: dto.seed,
        generatorVersion: dto.generatorVersion,
        durationSeconds: dto.durationSeconds,
        minLimit: dto.minLimit,
        maxLimit: dto.maxLimit,
        currentLimit: dto.initialLimit,
        fixedLimit: dto.initialLimit,
        stepUp: dto.stepUp,
        stepDown: dto.stepDown,
        highThreshold: dto.highThreshold,
        lowThreshold: dto.lowThreshold,
        cooldownWindows: dto.cooldownWindows,
        purchaseProbability: dto.purchaseProbability,
        abandonProbability: dto.abandonProbability,
      },
    });
  }

  async finish(id: string) {
    return this.prisma.experimentRun.update({
      where: { id },
      data: { status: "COMPLETED", finishedAt: new Date() },
    });
  }

  find(id: string) {
    return this.prisma.experimentRun.findUniqueOrThrow({
      where: { id },
      include: { metricWindows: { orderBy: { windowEnd: "asc" } } },
    });
  }

  list() {
    return this.prisma.experimentRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
    });
  }
}

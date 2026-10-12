import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AppException } from "@/common/exceptions/app.exception";
import { QueueCacheService } from "@/modules/queue/services/queue-cache.service";

import {
  QUEUE_REPOSITORY,
  type QueueRepository,
} from "@/modules/queue/repositories/queue.repository";

@Injectable()
export class GetQueueStatusService {
  constructor(
    @Inject(QUEUE_REPOSITORY) private readonly queue: QueueRepository,
    private readonly cache: QueueCacheService,
  ) {}
  async execute(eventId: string, token: string) {
    const cacheKey = await this.cache.keyFor(eventId, token);
    const cached = await this.cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;
    const snapshot = await this.queue.getSnapshot(eventId, token);
    if (!snapshot)
      throw new AppException(
        CinemaErrorCode.QUEUE_ENTRY_NOT_FOUND,
        "Entrada de cola no encontrada",
        HttpStatus.NOT_FOUND,
      );
    const { participantToken: _participantToken, ...safeEntry } =
      snapshot.entry;
    const response = {
      ...snapshot,
      entry: {
        ...safeEntry,
        turnNumber: Number(snapshot.entry.turnNumber),
      },
    };
    await this.cache.set(cacheKey, response);
    return response;
  }
}

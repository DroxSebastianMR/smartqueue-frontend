import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AppException } from "@/common/exceptions/app.exception";

import {
  EVENT_REPOSITORY,
  type EventRepository,
} from "@/modules/events/repositories/event.repository";

@Injectable()
export class GetEventService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly events: EventRepository,
  ) {}

  async execute(slug: string) {
    const event = await this.events.findActiveBySlug(slug);
    if (!event)
      throw new AppException(
        CinemaErrorCode.EVENT_NOT_FOUND,
        "Evento activo no encontrado",
        HttpStatus.NOT_FOUND,
      );
    return event;
  }
}

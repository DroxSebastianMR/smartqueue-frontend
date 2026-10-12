import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { EventResponseDto } from "@/modules/events/dto/event-response.dto";
import { GetEventService } from "@/modules/events/services/get-event.service";

@ApiTags("events")
@Controller("events")
export class EventsController {
  constructor(private readonly getEvent: GetEventService) {}

  @Get(":slug")
  @ApiOperation({ summary: "Consultar evento de preventa activo" })
  @ApiParam({ name: "slug", example: "avengers-doomsday" })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiErrors(
    {
      status: 404,
      code: CinemaErrorCode.EVENT_NOT_FOUND,
      message: "Evento no encontrado",
      path: "/api/v1/events/:slug",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/events/:slug",
    },
  )
  findOne(@Param("slug") slug: string) {
    return this.getEvent.execute(slug);
  }
}

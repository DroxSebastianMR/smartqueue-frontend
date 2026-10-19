import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { GetQueueStatusService } from "@/modules/queue/services/get-queue-status.service";
import { JoinQueueService } from "@/modules/queue/services/join-queue.service";
import { JoinQueueDto } from "@/modules/queue/dto/join-queue.dto";
import {
  QueueEntryDto,
  QueueStatusDto,
} from "@/modules/queue/dto/queue-response.dto";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { QueueLifecycleService } from "../services/queue-lifecycle.service";

@ApiTags("queue")
@ApiBearerAuth("access-token")
@UseGuards(AccessTokenGuard)
@Controller("queue")
export class QueueController {
  constructor(
    private readonly joinQueue: JoinQueueService,
    private readonly getStatus: GetQueueStatusService,
    private readonly lifecycle: QueueLifecycleService,
  ) {}

  @Post("entries")
  @ApiOperation({ summary: "Ingresar a la cola de un evento" })
  @ApiCreatedResponse({ type: QueueEntryDto })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Solicitud inválida",
      path: "/api/v1/queue/entries",
    },
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/queue/entries",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/queue/entries",
    },
  )
  join(@Body() dto: JoinQueueDto) {
    return this.joinQueue.execute(dto.eventId, dto.participantToken);
  }

  @Post("entries/cancel")
  @ApiOperation({
    summary:
      "Abandonar la cola y liberar una reserva activa; operación idempotente",
  })
  cancel(@Body() dto: JoinQueueDto) {
    return this.lifecycle.cancel(dto.eventId, dto.participantToken);
  }

  @Get("events/:eventId/status")
  @ApiOperation({ summary: "Consultar posición y espera estimada en la cola" })
  @ApiParam({ name: "eventId", format: "uuid" })
  @ApiQuery({ name: "token", description: "Token del participante" })
  @ApiOkResponse({ type: QueueStatusDto })
  @ApiErrors(
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/queue/events/:eventId/status",
    },
    {
      status: 404,
      code: CinemaErrorCode.QUEUE_ENTRY_NOT_FOUND,
      message: "Entrada de cola no encontrada",
      path: "/api/v1/queue/events/:eventId/status",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/queue/events/:eventId/status",
    },
  )
  status(@Param("eventId") eventId: string, @Query("token") token: string) {
    return this.getStatus.execute(eventId, token);
  }
}

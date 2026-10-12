import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { CinemaErrorCode } from "@/common/enums/cinema-error-code.enum";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import {
  ReservationResponseDto,
  PurchaseResponseDto,
} from "@/modules/sales/dto/sales-response.dto";
import { ConfirmPurchaseService } from "@/modules/sales/services/confirm-purchase.service";
import { ReserveTicketsService } from "@/modules/sales/services/reserve-tickets.service";
import { ReserveTicketsDto } from "@/modules/sales/dto/reserve-tickets.dto";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { Permission } from "@/modules/auth/enums/permission.enum";

@ApiTags("sales")
@ApiBearerAuth("access-token")
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.TICKET_PURCHASE)
@Controller("sales")
export class SalesController {
  constructor(
    private readonly reserve: ReserveTicketsService,
    private readonly confirm: ConfirmPurchaseService,
  ) {}

  @Post("reservations")
  @ApiOperation({ summary: "Reservar stock tras admisión en cola" })
  @ApiCreatedResponse({ type: ReservationResponseDto })
  @ApiErrors(
    {
      status: 400,
      code: CinemaErrorCode.QUEUE_ACCESS_DENIED,
      message: "Se requiere una entrada admitida",
      path: "/api/v1/sales/reservations",
    },
    {
      status: 409,
      code: CinemaErrorCode.INSUFFICIENT_STOCK,
      message: "Entradas insuficientes",
      path: "/api/v1/sales/reservations",
    },
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/sales/reservations",
    },
    {
      status: 403,
      code: AuthErrorCode.PERMISSION_FORBIDDEN,
      message: "Permiso de compra requerido",
      path: "/api/v1/sales/reservations",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/sales/reservations",
    },
  )
  createReservation(@Body() dto: ReserveTicketsDto) {
    return this.reserve.execute(dto.eventId, dto.queueEntryId, dto.quantity);
  }

  @Post("reservations/:reservationId/confirm")
  @ApiOperation({ summary: "Confirmar una reserva de la preventa simulada" })
  @ApiParam({ name: "reservationId", format: "uuid" })
  @ApiCreatedResponse({ type: PurchaseResponseDto })
  @ApiErrors(
    {
      status: 400,
      code: CinemaErrorCode.RESERVATION_INVALID,
      message: "Reserva no activa o vencida",
      path: "/api/v1/sales/reservations/:reservationId/confirm",
    },
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/sales/reservations/:reservationId/confirm",
    },
    {
      status: 403,
      code: AuthErrorCode.PERMISSION_FORBIDDEN,
      message: "Permiso de compra requerido",
      path: "/api/v1/sales/reservations/:reservationId/confirm",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/sales/reservations/:reservationId/confirm",
    },
  )
  confirmReservation(@Param("reservationId") reservationId: string) {
    return this.confirm.execute(reservationId);
  }
}

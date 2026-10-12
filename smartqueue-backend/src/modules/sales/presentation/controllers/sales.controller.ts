import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConfirmPurchaseUseCase } from '@/modules/sales/application/use-cases/confirm-purchase.use-case';
import { ReserveTicketsUseCase } from '@/modules/sales/application/use-cases/reserve-tickets.use-case';
import { ReserveTicketsDto } from '@/modules/sales/presentation/dto/reserve-tickets.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly reserve: ReserveTicketsUseCase, private readonly confirm: ConfirmPurchaseUseCase) {}

  @Post('reservations')
  createReservation(@Body() dto: ReserveTicketsDto) {
    return this.reserve.execute(dto.eventId, dto.queueEntryId, dto.quantity);
  }

  @Post('reservations/:reservationId/confirm')
  confirmReservation(@Param('reservationId') reservationId: string) {
    return this.confirm.execute(reservationId);
  }
}


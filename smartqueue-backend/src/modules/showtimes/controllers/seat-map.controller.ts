import { Body, Controller, Get, Header, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeatMapService } from '@/modules/showtimes/services/seat-map.service';
import { SeatMapDto, SeatSelectionDto, ValidateSeatSelectionDto } from '@/modules/showtimes/dto/seat-map.dto';

@ApiTags('showtimes')
@Controller('showtimes')
export class SeatMapController {
  constructor(private readonly seats: SeatMapService) {}

  @Get(':id/seats')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Mapa de butacas y disponibilidad real por función' })
  @ApiOkResponse({ type: SeatMapDto })
  @ApiNotFoundResponse({ description: 'Función inexistente' })
  get(@Param('id', ParseUUIDPipe) id: string) { return this.seats.get(id); }

  @Post(':id/seats/validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validar selección y cotizar entradas', description: 'Consulta sin reserva, bloqueo ni cobro. La disponibilidad puede cambiar después de validar.' })
  @ApiOkResponse({ type: SeatSelectionDto })
  @ApiConflictResponse({ description: 'Función cerrada o butacas no disponibles' })
  validate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidateSeatSelectionDto) {
    return this.seats.validate(id, dto.seatIds);
  }
}

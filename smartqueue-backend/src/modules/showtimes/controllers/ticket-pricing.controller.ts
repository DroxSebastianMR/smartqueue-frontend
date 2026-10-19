import { Body, Controller, Get, Header, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketPricingService } from '../services/ticket-pricing.service';
import { TicketQuoteDto, TicketQuoteRequestDto, TicketRatesDto } from '../dto/ticket-pricing.dto';

@ApiTags('showtimes')
@Controller('showtimes')
export class TicketPricingController {
  constructor(private readonly pricing: TicketPricingService) {}
  @Get(':id/ticket-rates')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Tarifas por función', description: 'Política demo: general 100%, niños 80%, adulto mayor 70% del precio persistido. No constituye una política comercial definitiva.' })
  @ApiOkResponse({ type: TicketRatesDto })
  @ApiNotFoundResponse({ description: 'Función inexistente' })
  rates(@Param('id', ParseUUIDPipe) id: string) { return this.pricing.rates(id); }

  @Post(':id/ticket-quotes') @HttpCode(200)
  @ApiOperation({ summary: 'Cotizar entradas por categoría', description: 'Revalida las butacas y calcula importes en céntimos en el servidor. No reserva ni cobra.' })
  @ApiOkResponse({ type: TicketQuoteDto })
  @ApiBadRequestResponse({ description: 'Categorías o cantidades incorrectas; debe existir una entrada por butaca.' })
  @ApiConflictResponse({ description: 'Butacas o función no disponibles' })
  quote(@Param('id', ParseUUIDPipe) id: string, @Body() input: TicketQuoteRequestDto) { return this.pricing.quote(id, input); }
}

import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { type Page } from "@/modules/catalog/dto/list-query.dto";
import {
  AuditoriumResponseDto,
  CinemaPageDto,
  CinemaQueryDto,
  CinemaResponseDto,
  NearbyCinemasPageDto,
  NearbyCinemasQueryDto,
  SeatResponseDto,
} from "@/modules/cinemas/dto/cinema.dto";
import {
  type AuditoriumRecord,
  type CinemaRecord,
  type SeatRecord,
} from "@/modules/cinemas/repositories/in-memory-cinema.repository";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";

@ApiTags("cinemas")
@Controller("cinemas")
export class CinemasController {
  constructor(private readonly cinemas: CinemasService) {}

  @Get()
  @ApiOperation({ summary: "Cines activos filtrables por ciudad" })
  @ApiOkResponse({ type: CinemaPageDto })
  list(@Query() query: CinemaQueryDto): Page<CinemaRecord> {
    return this.cinemas.list(query);
  }

  @Get("nearby")
  @ApiOperation({
    summary: "Cines cercanos a una coordenada",
    description:
      "Usa distancia en línea recta; omite sedes sin coordenadas verificadas. El navegador solicita el permiso de ubicación.",
  })
  @ApiOkResponse({ type: NearbyCinemasPageDto })
  nearby(@Query() query: NearbyCinemasQueryDto) {
    return this.cinemas.nearby(query);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Detalle de sede" })
  @ApiOkResponse({ type: CinemaResponseDto })
  detail(@Param("slug") slug: string): CinemaRecord {
    return this.cinemas.detail(slug);
  }

  @Get(":slug/auditoriums")
  @ApiOperation({ summary: "Salas activas del cine" })
  @ApiOkResponse({ type: AuditoriumResponseDto, isArray: true })
  auditoriums(@Param("slug") slug: string): AuditoriumRecord[] {
    return this.cinemas.auditoriums(slug);
  }
}

@ApiTags("auditoriums")
@Controller("auditoriums")
export class AuditoriumsController {
  constructor(private readonly cinemas: CinemasService) {}

  @Get(":id/seats")
  @ApiOperation({
    summary:
      "Distribución física de butacas; no indica disponibilidad de compra",
  })
  @ApiOkResponse({ type: SeatResponseDto, isArray: true })
  seats(@Param("id") id: string): SeatRecord[] {
    return this.cinemas.seats(id);
  }
}

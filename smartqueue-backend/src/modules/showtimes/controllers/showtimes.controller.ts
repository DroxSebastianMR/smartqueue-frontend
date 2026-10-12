import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { type Page } from "@/modules/catalog/dto/list-query.dto";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";
import {
  ShowtimeAvailabilityDto,
  ShowtimePageDto,
  ShowtimeQueryDto,
  ShowtimeResponseDto,
} from "@/modules/showtimes/dto/showtime.dto";
import { type ShowtimeRecord } from "@/modules/showtimes/repositories/in-memory-showtime.repository";
import {
  MovieScheduleDto,
  MovieScheduleQueryDto,
} from "@/modules/showtimes/dto/movie-schedule.dto";
import { ShowtimesService } from "@/modules/showtimes/services/showtimes.service";

@ApiTags("showtimes")
@Controller("showtimes")
export class ShowtimesController {
  constructor(private readonly showtimes: ShowtimesService) {}

  @Get()
  @ApiOperation({
    summary: "Consultar horarios por cine, película y fecha local",
  })
  @ApiOkResponse({ type: ShowtimePageDto })
  list(@Query() query: ShowtimeQueryDto): Page<ShowtimeRecord> {
    return this.showtimes.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de función" })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  detail(@Param("id") id: string): ShowtimeRecord {
    return this.showtimes.detail(id);
  }

  @Get(":id/availability")
  @ApiOperation({
    summary: "Estado de disponibilidad",
    description:
      "Hasta integrar entradas/pagos, informa que no hay cálculo de butacas libres.",
  })
  @ApiOkResponse({ type: ShowtimeAvailabilityDto })
  availability(@Param("id") id: string): ShowtimeAvailabilityDto {
    return this.showtimes.availability(id);
  }
}

@ApiTags("cinemas")
@Controller("cinemas")
export class CinemaShowtimesController {
  constructor(
    private readonly showtimes: ShowtimesService,
    private readonly cinemas: CinemasService,
  ) {}
  @Get(":slug/showtimes")
  @ApiOperation({ summary: "Funciones de una sede" })
  @ApiOkResponse({ type: ShowtimePageDto })
  list(
    @Param("slug") slug: string,
    @Query() query: ShowtimeQueryDto,
  ): Page<ShowtimeRecord> {
    this.cinemas.detail(slug);
    return this.showtimes.list({ ...query, cinemaSlug: slug });
  }
}

@ApiTags("movies")
@Controller("movies")
export class MovieShowtimesController {
  constructor(private readonly showtimes: ShowtimesService) {}
  @Get(":slug/schedule")
  @ApiOperation({
    summary: "Próximos cinco días de funciones por cine, formato e idioma",
    description:
      "Selecciona cine explícito o usa coordenadas para elegir el más cercano con funciones. La disponibilidad de butacas permanece desconocida hasta integrar reservas.",
  })
  @ApiOkResponse({ type: MovieScheduleDto })
  schedule(
    @Param("slug") slug: string,
    @Query() query: MovieScheduleQueryDto,
  ): MovieScheduleDto {
    return this.showtimes.movieSchedule(slug, query);
  }
  @Get(":slug/showtimes")
  @ApiOperation({ summary: "Horarios de una película" })
  @ApiOkResponse({ type: ShowtimePageDto })
  list(
    @Param("slug") slug: string,
    @Query() query: ShowtimeQueryDto,
  ): Page<ShowtimeRecord> {
    return this.showtimes.list({ ...query, movieSlug: slug });
  }
}

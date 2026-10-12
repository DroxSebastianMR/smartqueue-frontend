import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ErrorResponseDto } from "@/common/dto/error-response.dto";
import { type Page } from "@/modules/catalog/dto/list-query.dto";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import {
  AuditoriumResponseDto,
  CinemaPageDto,
  CinemaQueryDto,
  CinemaResponseDto,
  CreateAuditoriumDto,
  CreateCinemaDto,
  CreateSeatDto,
  SeatResponseDto,
  UpdateAuditoriumDto,
  UpdateCinemaDto,
} from "@/modules/cinemas/dto/cinema.dto";
import {
  type AuditoriumRecord,
  type CinemaRecord,
  type SeatRecord,
} from "@/modules/cinemas/repositories/in-memory-cinema.repository";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";

@ApiTags("admin/cinemas")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: "Administración global requerida",
})
@ApiResponse({
  status: 400,
  type: ErrorResponseDto,
  description: "DTO o parámetro inválido",
})
@ApiResponse({
  status: 404,
  type: ErrorResponseDto,
  description: "Cine, sala o butaca no encontrada",
})
@ApiResponse({
  status: 409,
  type: ErrorResponseDto,
  description: "Conflicto de aforo, plano o funciones futuras",
})
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.CINEMA_MANAGE_GLOBAL)
@Controller("admin/cinemas")
export class AdminCinemasController {
  constructor(private readonly cinemas: CinemasService) {}

  @Get()
  @ApiOperation({ summary: "Listar sedes, incluidas las cerradas" })
  @ApiOkResponse({ type: CinemaPageDto })
  list(@Query() query: CinemaQueryDto): Page<CinemaRecord> {
    return this.cinemas.list(query, true);
  }

  @Post()
  @ApiOperation({ summary: "Registrar cine" })
  @ApiCreatedResponse({ type: CinemaResponseDto })
  create(@Body() input: CreateCinemaDto): CinemaRecord {
    return this.cinemas.create(input);
  }

  @Patch(":slug")
  @ApiOperation({ summary: "Actualizar sede y estado" })
  @ApiOkResponse({ type: CinemaResponseDto })
  update(
    @Param("slug") slug: string,
    @Body() input: UpdateCinemaDto,
  ): CinemaRecord {
    return this.cinemas.update(slug, input);
  }

  @Delete(":slug")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Cerrar cine sin borrar historial" })
  @ApiNoContentResponse()
  close(@Param("slug") slug: string): void {
    this.cinemas.close(slug);
  }

  @Get(":slug/auditoriums")
  @ApiOperation({ summary: "Listar salas, incluidas las de mantenimiento" })
  @ApiOkResponse({ type: AuditoriumResponseDto, isArray: true })
  auditoriums(@Param("slug") slug: string): AuditoriumRecord[] {
    return this.cinemas.auditoriums(slug, true);
  }

  @Post(":slug/auditoriums")
  @ApiOperation({ summary: "Registrar sala y formatos compatibles" })
  @ApiCreatedResponse({ type: AuditoriumResponseDto })
  createAuditorium(
    @Param("slug") slug: string,
    @Body() input: CreateAuditoriumDto,
  ): AuditoriumRecord {
    return this.cinemas.createAuditorium(slug, input);
  }
}

@ApiTags("admin/auditoriums")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: "Administración global requerida",
})
@ApiResponse({
  status: 400,
  type: ErrorResponseDto,
  description: "DTO o parámetro inválido",
})
@ApiResponse({
  status: 404,
  type: ErrorResponseDto,
  description: "Sala o butaca no encontrada",
})
@ApiResponse({
  status: 409,
  type: ErrorResponseDto,
  description: "Conflicto de aforo, plano o funciones futuras",
})
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.CINEMA_MANAGE_GLOBAL)
@Controller("admin/auditoriums")
export class AdminAuditoriumsController {
  constructor(private readonly cinemas: CinemasService) {}

  @Patch(":id")
  @ApiOperation({ summary: "Editar sala, aforo y formatos" })
  @ApiOkResponse({ type: AuditoriumResponseDto })
  update(
    @Param("id") id: string,
    @Body() input: UpdateAuditoriumDto,
  ): AuditoriumRecord {
    return this.cinemas.updateAuditorium(id, input);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Poner sala en mantenimiento sin borrar funciones" })
  @ApiNoContentResponse()
  close(@Param("id") id: string): void {
    this.cinemas.closeAuditorium(id);
  }

  @Post(":id/seats")
  @ApiOperation({ summary: "Registrar butaca física en una sala" })
  @ApiCreatedResponse({ type: SeatResponseDto })
  addSeat(@Param("id") id: string, @Body() input: CreateSeatDto): SeatRecord {
    return this.cinemas.addSeat(id, input);
  }

  @Delete(":id/seats/:seatId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar butaca física si no tiene entradas" })
  @ApiNoContentResponse()
  removeSeat(@Param("id") id: string, @Param("seatId") seatId: string): void {
    this.cinemas.removeSeat(id, seatId);
  }
}

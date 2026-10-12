import {
  Body,
  Controller,
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
  CreateShowtimeDto,
  ShowtimePageDto,
  ShowtimeQueryDto,
  ShowtimeResponseDto,
  UpdateShowtimeDto,
} from "@/modules/showtimes/dto/showtime.dto";
import { type ShowtimeRecord } from "@/modules/showtimes/repositories/in-memory-showtime.repository";
import { ShowtimesService } from "@/modules/showtimes/services/showtimes.service";

@ApiTags("admin/showtimes")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: "Administración global requerida",
})
@ApiResponse({
  status: 400,
  type: ErrorResponseDto,
  description: "DTO u horario inválido",
})
@ApiResponse({
  status: 404,
  type: ErrorResponseDto,
  description: "Función no encontrada",
})
@ApiResponse({
  status: 409,
  type: ErrorResponseDto,
  description: "Solapamiento o estado incompatible",
})
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.SHOWTIME_MANAGE_GLOBAL)
@Controller("admin/showtimes")
export class AdminShowtimesController {
  constructor(private readonly showtimes: ShowtimesService) {}

  @Get()
  @ApiOperation({
    summary: "Listar funciones, incluidas canceladas y terminadas",
  })
  @ApiOkResponse({ type: ShowtimePageDto })
  list(@Query() query: ShowtimeQueryDto): Page<ShowtimeRecord> {
    return this.showtimes.list(query, true);
  }

  @Post()
  @ApiOperation({ summary: "Programar función en una sala" })
  @ApiCreatedResponse({ type: ShowtimeResponseDto })
  create(@Body() input: CreateShowtimeDto): ShowtimeRecord {
    return this.showtimes.create(input);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Modificar función programada" })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  update(
    @Param("id") id: string,
    @Body() input: UpdateShowtimeDto,
  ): ShowtimeRecord {
    return this.showtimes.update(id, input);
  }

  @Post(":id/on-sale")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Habilitar venta tras configurar butacas" })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  onSale(@Param("id") id: string): ShowtimeRecord {
    return this.showtimes.onSale(id);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancelar función conservando el historial" })
  @ApiOkResponse({ type: ShowtimeResponseDto })
  cancel(@Param("id") id: string): ShowtimeRecord {
    return this.showtimes.cancel(id);
  }
}

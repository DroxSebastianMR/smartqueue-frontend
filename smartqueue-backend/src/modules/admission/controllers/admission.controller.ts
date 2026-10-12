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
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { AdmissionResponseDto } from "@/modules/admission/dto/admission-response.dto";
import { RunAdmissionService } from "@/modules/admission/services/run-admission.service";
import { RunAdmissionDto } from "@/modules/admission/dto/run-admission.dto";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import { AdmissionOrchestratorService } from "@/modules/admission/services/admission-orchestrator.service";
import { CloseWindowDto } from "@/modules/admission/dto/close-window.dto";

@ApiTags("admission")
@ApiBearerAuth("access-token")
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.QUEUE_CONTROL)
@Controller("admission")
export class AdmissionController {
  constructor(
    private readonly runAdmission: RunAdmissionService,
    private readonly orchestrator: AdmissionOrchestratorService,
  ) {}

  @Post("runs/:runId/windows/close")
  @ApiOperation({
    summary: "Cerrar ventana, predecir, aplicar fallback y admitir en FIFO",
  })
  @ApiParam({ name: "runId", format: "uuid" })
  closeWindow(@Param("runId") runId: string, @Body() dto: CloseWindowDto) {
    return this.orchestrator.execute(
      runId,
      dto.windowEnd ? new Date(dto.windowEnd) : undefined,
    );
  }

  @Post("events/:eventId/run")
  @ApiOperation({ summary: "Admitir participantes de la cola según cupos" })
  @ApiParam({ name: "eventId", format: "uuid" })
  @ApiCreatedResponse({ type: AdmissionResponseDto })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Cupos inválidos",
      path: "/api/v1/admission/events/:eventId/run",
    },
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/admission/events/:eventId/run",
    },
    {
      status: 403,
      code: AuthErrorCode.PERMISSION_FORBIDDEN,
      message: "Permiso de control de cola requerido",
      path: "/api/v1/admission/events/:eventId/run",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/admission/events/:eventId/run",
    },
  )
  run(@Param("eventId") eventId: string, @Body() dto: RunAdmissionDto) {
    return this.runAdmission.execute(eventId, dto.slots);
  }
}

import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { DashboardResponseDto } from "@/modules/metrics/dto/dashboard-response.dto";
import { GetDashboardService } from "@/modules/metrics/services/get-dashboard.service";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";

@ApiTags("metrics")
@ApiBearerAuth("access-token")
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Permissions(Permission.METRICS_READ)
@Controller("metrics")
export class MetricsController {
  constructor(private readonly dashboard: GetDashboardService) {}
  @Get("dashboard")
  @ApiOperation({
    summary: "Consultar métricas de cola y última predicción ML",
  })
  @ApiOkResponse({ type: DashboardResponseDto })
  @ApiErrors(
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token de acceso requerido",
      path: "/api/v1/metrics/dashboard",
    },
    {
      status: 403,
      code: AuthErrorCode.PERMISSION_FORBIDDEN,
      message: "Permiso de métricas requerido",
      path: "/api/v1/metrics/dashboard",
    },
    {
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Error de persistencia",
      path: "/api/v1/metrics/dashboard",
    },
  )
  getDashboard() {
    return this.dashboard.execute();
  }
}

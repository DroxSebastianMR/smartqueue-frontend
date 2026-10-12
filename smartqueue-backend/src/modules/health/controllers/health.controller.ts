import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthResponseDto } from "@/modules/health/dto/health-response.dto";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({
    summary: "Verificar que la API Nest esté activa; no verifica PostgreSQL",
  })
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponseDto {
    return {
      status: "ok",
      service: "smartqueue-backend",
      timestamp: new Date().toISOString(),
    };
  }
}

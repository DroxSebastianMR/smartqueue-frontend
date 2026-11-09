import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { ConcessionProductPageDto } from "@/modules/concessions/dto/concession-response.dto";
import { ListConcessionsQueryDto } from "@/modules/concessions/dto/list-concessions.query.dto";
import { ConcessionsService, type ConcessionProductView } from "@/modules/concessions/services/concessions.service";
import type { Page } from "@/modules/catalog/dto/list-query.dto";

@ApiTags("concessions")
@Controller("concessions")
export class ConcessionsController {
  constructor(private readonly concessions: ConcessionsService) {}

  @Get("catalog")
  @ApiOperation({ summary: "Catálogo de dulcería disponible para complementar una compra" })
  @ApiOkResponse({ type: ConcessionProductPageDto })
  @ApiErrors({ status: 400, code: ErrorCode.VALIDATION_ERROR, message: "Filtros o paginación inválidos", path: "/api/v1/concessions/catalog" })
  list(@Query() query: ListConcessionsQueryDto): Promise<Page<ConcessionProductView>> {
    return this.concessions.list(query);
  }
}

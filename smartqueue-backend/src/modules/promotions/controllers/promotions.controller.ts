import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import {
  CompactListQueryDto,
  type Page,
} from "@/modules/catalog/dto/list-query.dto";
import type { CatalogPromotion } from "@/modules/catalog/repositories/demo-catalog.repository";
import { PromotionPageDto } from "@/modules/promotions/dto/promotion-response.dto";
import { PromotionsService } from "@/modules/promotions/services/promotions.service";

@ApiTags("promotions")
@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}
  @Get()
  @ApiOperation({
    summary: "Promociones vigentes; máximo 5 por página",
    description: "El fixture no ofrece precios ni descuentos reales.",
  })
  @ApiOkResponse({ type: PromotionPageDto })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Paginación inválida",
    path: "/api/v1/promotions",
  })
  list(@Query() query: CompactListQueryDto): Promise<Page<CatalogPromotion>> {
    return this.promotions.list(query);
  }
}

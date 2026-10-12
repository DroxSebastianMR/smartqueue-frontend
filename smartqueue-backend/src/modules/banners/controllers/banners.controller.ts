import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { ListQueryDto, type Page } from "@/modules/catalog/dto/list-query.dto";
import type { CatalogBanner } from "@/modules/catalog/repositories/demo-catalog.repository";
import { BannerPageDto } from "@/modules/banners/dto/banner-response.dto";
import { BannersService } from "@/modules/banners/services/banners.service";

@ApiTags("banners")
@Controller("banners")
export class BannersController {
  constructor(private readonly banners: BannersService) {}
  @Get()
  @ApiOperation({
    summary: "Banners activos del hero, ordenados por prioridad",
    description:
      "Fuente de demostración; cada banner puede asociarse a una película y un video.",
  })
  @ApiOkResponse({ type: BannerPageDto })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Paginación inválida",
    path: "/api/v1/banners",
  })
  list(@Query() query: ListQueryDto): Promise<Page<CatalogBanner>> {
    return this.banners.list(query);
  }
}

import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import {
  CompactListQueryDto,
  type Page,
} from "@/modules/catalog/dto/list-query.dto";
import type { CatalogAdvertisement } from "@/modules/catalog/repositories/demo-catalog.repository";
import { AdvertisementPageDto } from "@/modules/advertisements/dto/advertisement-response.dto";
import { AdvertisementsService } from "@/modules/advertisements/services/advertisements.service";

@ApiTags("advertisements")
@Controller("advertisements")
export class AdvertisementsController {
  constructor(private readonly advertisements: AdvertisementsService) {}
  @Get()
  @ApiOperation({
    summary: "Anuncios editoriales; máximo 5 por página",
    description: "Las promociones comerciales son un recurso separado.",
  })
  @ApiOkResponse({ type: AdvertisementPageDto })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Paginación inválida",
    path: "/api/v1/advertisements",
  })
  list(
    @Query() query: CompactListQueryDto,
  ): Promise<Page<CatalogAdvertisement>> {
    return this.advertisements.list(query);
  }
}

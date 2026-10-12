import { Module } from "@nestjs/common";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { PromotionsController } from "@/modules/promotions/controllers/promotions.controller";
import { PromotionsService } from "@/modules/promotions/services/promotions.service";

@Module({
  imports: [CatalogModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
})
export class PromotionsModule {}

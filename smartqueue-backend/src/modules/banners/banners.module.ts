import { Module } from "@nestjs/common";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { BannersController } from "@/modules/banners/controllers/banners.controller";
import { BannersService } from "@/modules/banners/services/banners.service";

@Module({
  imports: [CatalogModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}

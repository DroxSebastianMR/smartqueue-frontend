import { Module } from "@nestjs/common";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { AdvertisementsController } from "@/modules/advertisements/controllers/advertisements.controller";
import { AdvertisementsService } from "@/modules/advertisements/services/advertisements.service";

@Module({
  imports: [CatalogModule],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
})
export class AdvertisementsModule {}

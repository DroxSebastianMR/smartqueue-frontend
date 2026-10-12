import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import {
  AdminAuditoriumsController,
  AdminCinemasController,
} from "@/modules/cinemas/controllers/admin-cinemas.controller";
import {
  AuditoriumsController,
  CinemasController,
} from "@/modules/cinemas/controllers/cinemas.controller";
import { InMemoryCinemaRepository } from "@/modules/cinemas/repositories/in-memory-cinema.repository";
import { CinemasService } from "@/modules/cinemas/services/cinemas.service";
import { CatalogModule } from "@/modules/catalog/catalog.module";

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [
    CinemasController,
    AuditoriumsController,
    AdminCinemasController,
    AdminAuditoriumsController,
  ],
  providers: [InMemoryCinemaRepository, CinemasService],
  exports: [InMemoryCinemaRepository, CinemasService],
})
export class CinemasModule {}

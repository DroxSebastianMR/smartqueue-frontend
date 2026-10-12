import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { CinemasModule } from "@/modules/cinemas/cinemas.module";
import { AdminShowtimesController } from "@/modules/showtimes/controllers/admin-showtimes.controller";
import {
  CinemaShowtimesController,
  MovieShowtimesController,
  ShowtimesController,
} from "@/modules/showtimes/controllers/showtimes.controller";
import { ShowtimesService } from "@/modules/showtimes/services/showtimes.service";

@Module({
  imports: [AuthModule, CatalogModule, CinemasModule],
  controllers: [
    ShowtimesController,
    CinemaShowtimesController,
    MovieShowtimesController,
    AdminShowtimesController,
  ],
  providers: [ShowtimesService],
})
export class ShowtimesModule {}

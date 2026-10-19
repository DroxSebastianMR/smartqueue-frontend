import { Module } from "@nestjs/common";
import { TicketPricingController } from './controllers/ticket-pricing.controller';
import { TicketPricingService } from './services/ticket-pricing.service';
import { SeatMapController } from '@/modules/showtimes/controllers/seat-map.controller';
import { SeatMapService } from '@/modules/showtimes/services/seat-map.service';
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
    SeatMapController,
    TicketPricingController,
    ShowtimesController,
    CinemaShowtimesController,
    MovieShowtimesController,
    AdminShowtimesController,
  ],
  providers: [ShowtimesService, SeatMapService, TicketPricingService],
})
export class ShowtimesModule {}

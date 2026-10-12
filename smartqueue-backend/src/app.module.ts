import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import cacheConfig from "@/config/cache/cache.config";
import { CacheStoreModule } from "@/common/cache/cache-store.module";

import { PrismaModule } from "@/common/prisma/prisma.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { BannersModule } from "@/modules/banners/banners.module";
import { MoviesModule } from "@/modules/movies/movies.module";
import { AdvertisementsModule } from "@/modules/advertisements/advertisements.module";
import { PromotionsModule } from "@/modules/promotions/promotions.module";
import { CinemasModule } from "@/modules/cinemas/cinemas.module";
import { ShowtimesModule } from "@/modules/showtimes/showtimes.module";
import { PaymentsModule } from "@/modules/payments/payments.module";
import { AdmissionModule } from "@/modules/admission/admission.module";
import { EventsModule } from "@/modules/events/events.module";
import { HealthModule } from "@/modules/health/health.module";
import { MetricsModule } from "@/modules/metrics/metrics.module";
import { QueueModule } from "@/modules/queue/queue.module";
import { SalesModule } from "@/modules/sales/sales.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [cacheConfig] }),
    CacheStoreModule,
    PrismaModule,
    AuthModule,
    BannersModule,
    MoviesModule,
    AdvertisementsModule,
    PromotionsModule,
    CinemasModule,
    ShowtimesModule,
    PaymentsModule,
    EventsModule,
    QueueModule,
    SalesModule,
    MetricsModule,
    AdmissionModule,
    HealthModule,
  ],
})
export class AppModule {}

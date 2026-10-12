import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@/database/database.module';
import { AdmissionModule } from '@/modules/admission/admission.module';
import { EventsModule } from '@/modules/events/events.module';
import { HealthModule } from '@/modules/health/health.module';
import { MetricsModule } from '@/modules/metrics/metrics.module';
import { QueueModule } from '@/modules/queue/queue.module';
import { SalesModule } from '@/modules/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EventsModule,
    QueueModule,
    SalesModule,
    MetricsModule,
    AdmissionModule,
    HealthModule,
  ],
})
export class AppModule {}


import { Module } from '@nestjs/common';

import { ConfirmPurchaseUseCase } from '@/modules/sales/application/use-cases/confirm-purchase.use-case';
import { ReserveTicketsUseCase } from '@/modules/sales/application/use-cases/reserve-tickets.use-case';
import { SalesController } from '@/modules/sales/presentation/controllers/sales.controller';

@Module({ controllers: [SalesController], providers: [ReserveTicketsUseCase, ConfirmPurchaseUseCase] })
export class SalesModule {}


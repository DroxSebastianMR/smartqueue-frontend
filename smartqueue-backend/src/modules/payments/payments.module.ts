import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import {
  PaymentsController,
  ReceiptsController,
} from "@/modules/payments/controllers/payments.controller";
import { PaymentsService } from "@/modules/payments/services/payments.service";

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController, ReceiptsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

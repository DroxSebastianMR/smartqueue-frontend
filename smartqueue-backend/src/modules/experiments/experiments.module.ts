import { Module } from "@nestjs/common";

import { AuthModule } from "@/modules/auth/auth.module";
import { ExperimentsController } from "@/modules/experiments/controllers/experiments.controller";
import { ExperimentsService } from "@/modules/experiments/services/experiments.service";

@Module({
  imports: [AuthModule],
  controllers: [ExperimentsController],
  providers: [ExperimentsService],
  exports: [ExperimentsService],
})
export class ExperimentsModule {}

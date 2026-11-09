import { Module } from "@nestjs/common";
import { ConcessionsController } from "@/modules/concessions/controllers/concessions.controller";
import { ConcessionsService } from "@/modules/concessions/services/concessions.service";

@Module({
  controllers: [ConcessionsController],
  providers: [ConcessionsService],
})
export class ConcessionsModule {}

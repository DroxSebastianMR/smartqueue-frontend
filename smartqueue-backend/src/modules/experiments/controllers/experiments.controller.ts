import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import { StartExperimentDto } from "@/modules/experiments/dto/start-experiment.dto";
import { ExperimentsService } from "@/modules/experiments/services/experiments.service";

@ApiTags("experiments")
@ApiBearerAuth("access-token")
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller("experiments")
export class ExperimentsController {
  constructor(private readonly experiments: ExperimentsService) {}

  @Post()
  @Permissions(Permission.QUEUE_CONTROL)
  @ApiOperation({ summary: "Iniciar una corrida reproducible" })
  start(@Body() dto: StartExperimentDto) {
    return this.experiments.start(dto);
  }

  @Patch(":id/finish")
  @Permissions(Permission.QUEUE_CONTROL)
  @ApiOperation({ summary: "Cerrar una corrida experimental" })
  finish(@Param("id") id: string) {
    return this.experiments.finish(id);
  }

  @Get()
  @Permissions(Permission.METRICS_READ)
  list() {
    return this.experiments.list();
  }

  @Get(":id")
  @Permissions(Permission.METRICS_READ)
  find(@Param("id") id: string) {
    return this.experiments.find(id);
  }
}

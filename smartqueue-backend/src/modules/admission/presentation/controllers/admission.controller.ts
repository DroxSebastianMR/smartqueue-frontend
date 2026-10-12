import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RunAdmissionUseCase } from '@/modules/admission/application/use-cases/run-admission.use-case';
import { RunAdmissionDto } from '@/modules/admission/presentation/dto/run-admission.dto';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  constructor(private readonly runAdmission: RunAdmissionUseCase) {}

  @Post('events/:eventId/run')
  run(@Param('eventId') eventId: string, @Body() dto: RunAdmissionDto) {
    return this.runAdmission.execute(eventId, dto.slots);
  }
}

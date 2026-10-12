import { Injectable } from '@nestjs/common';

import { ControlMode } from '@/common/enums/control-mode.enum';
import { AdmissionSignal, nextAdmissionLimit } from '@/modules/admission/domain/admission-policy';

@Injectable()
export class CalculateAdmissionUseCase {
  execute(mode: ControlMode, signal: AdmissionSignal) {
    return { mode, nextLimit: nextAdmissionLimit(mode, signal) };
  }
}


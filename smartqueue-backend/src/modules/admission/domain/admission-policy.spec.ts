import { ControlMode } from '@/common/enums/control-mode.enum';
import { nextAdmissionLimit } from '@/modules/admission/domain/admission-policy';

describe('nextAdmissionLimit', () => {
  it('reduces predictive admission before the current metrics cross a threshold', () => {
    expect(
      nextAdmissionLimit(ControlMode.PREDICTIVE, {
        currentLimit: 20,
        minLimit: 5,
        maxLimit: 30,
        latencyP95Ms: 500,
        errorRate: 0.01,
        riskScore: 0.82,
      }),
    ).toBe(18);
  });

  it('never exceeds safeguards', () => {
    expect(
      nextAdmissionLimit(ControlMode.REACTIVE, {
        currentLimit: 5,
        minLimit: 5,
        maxLimit: 30,
        latencyP95Ms: 2_000,
        errorRate: 0.2,
      }),
    ).toBe(5);
  });
});


import { ControlMode } from "@/common/enums/control-mode.enum";
import { nextAdmissionLimit } from "@/modules/admission/utils/admission-policy";

describe("nextAdmissionLimit", () => {
  it("reduces predictive admission before the current metrics cross a threshold", () => {
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

  it("never exceeds safeguards", () => {
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

  it("requires consecutive healthy windows before increasing predictive capacity", () => {
    const base = {
      currentLimit: 10,
      minLimit: 2,
      maxLimit: 30,
      latencyP95Ms: 200,
      errorRate: 0,
      riskScore: 0.1,
      cooldownWindows: 3,
    };
    expect(
      nextAdmissionLimit(ControlMode.PREDICTIVE, {
        ...base,
        recoveryWindows: 2,
      }),
    ).toBe(10);
    expect(
      nextAdmissionLimit(ControlMode.PREDICTIVE, {
        ...base,
        recoveryWindows: 3,
      }),
    ).toBe(11);
  });
});

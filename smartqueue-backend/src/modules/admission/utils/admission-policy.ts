import { ControlMode } from "@/common/enums/control-mode.enum";

export interface AdmissionSignal {
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  latencyP95Ms: number;
  errorRate: number;
  riskScore?: number;
  stepUp?: number;
  stepDown?: number;
  highThreshold?: number;
  lowThreshold?: number;
  recoveryWindows?: number;
  cooldownWindows?: number;
}

export function nextAdmissionLimit(
  mode: ControlMode,
  signal: AdmissionSignal,
): number {
  if (mode === ControlMode.FIXED) return signal.currentLimit;
  const highThreshold = signal.highThreshold ?? 0.65;
  const lowThreshold = signal.lowThreshold ?? 0.35;
  const danger =
    signal.latencyP95Ms >= 1_000 ||
    signal.errorRate >= 0.05 ||
    (mode === ControlMode.PREDICTIVE &&
      (signal.riskScore ?? 0) >= highThreshold);
  const recovery =
    signal.latencyP95Ms < 650 &&
    signal.errorRate < 0.02 &&
    (mode !== ControlMode.PREDICTIVE ||
      (signal.riskScore ?? 1) <= lowThreshold);
  if (danger)
    return Math.max(
      signal.minLimit,
      signal.currentLimit - (signal.stepDown ?? 2),
    );
  if (
    recovery &&
    (signal.recoveryWindows ?? signal.cooldownWindows ?? 1) >=
      (signal.cooldownWindows ?? 1)
  )
    return Math.min(
      signal.maxLimit,
      signal.currentLimit + (signal.stepUp ?? 1),
    );
  return signal.currentLimit;
}

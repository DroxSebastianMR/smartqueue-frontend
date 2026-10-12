import { ControlMode } from "@/common/enums/control-mode.enum";

export interface AdmissionSignal {
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  latencyP95Ms: number;
  errorRate: number;
  riskScore?: number;
}

export function nextAdmissionLimit(
  mode: ControlMode,
  signal: AdmissionSignal,
): number {
  if (mode === ControlMode.FIXED) return signal.currentLimit;
  const danger =
    signal.latencyP95Ms >= 1_000 ||
    signal.errorRate >= 0.05 ||
    (mode === ControlMode.PREDICTIVE && (signal.riskScore ?? 0) >= 0.65);
  const recovery =
    signal.latencyP95Ms < 650 &&
    signal.errorRate < 0.02 &&
    (mode !== ControlMode.PREDICTIVE || (signal.riskScore ?? 1) <= 0.35);
  if (danger) return Math.max(signal.minLimit, signal.currentLimit - 2);
  if (recovery) return Math.min(signal.maxLimit, signal.currentLimit + 1);
  return signal.currentLimit;
}

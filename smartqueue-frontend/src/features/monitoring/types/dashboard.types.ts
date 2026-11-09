import type { ControlMode } from '@/features/monitoring/enums/control-mode.enum';
import type { ExperimentScenario } from '@/features/monitoring/enums/experiment-scenario.enum';
import type { ExperimentStatus } from '@/features/monitoring/enums/experiment-status.enum';
import type { RiskClass } from '@/features/monitoring/enums/risk-class.enum';

export interface ExperimentRunSummary {
  id: string;
  scenario: ExperimentScenario;
  controlMode: ControlMode;
  seed: number;
  generatorVersion: string;
  startedAt: string;
  status: ExperimentStatus;
}

export interface MonitoringKpis {
  waiting: number;
  activeBuyers: number;
  currentLimit: number;
  arrivalRate: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorRate: number;
  throughput: number;
  completed: number;
}

export interface MonitoringPrediction {
  appliedMode: ControlMode;
  windowEnd: string;
  evaluable: boolean;
  riskScore: number | null;
  riskClass: RiskClass | null;
  modelVersion: string | null;
  horizonSeconds: number | null;
  predictionAgeMs: number | null;
  responseMs: number | null;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  previousLimit: number;
  appliedLimit: number;
}

export interface MetricWindowPoint {
  id: string;
  windowEnd: string;
  arrivalRate: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorRate: number;
  completionRate: number;
  evaluable: boolean;
  prediction: Omit<MonitoringPrediction, 'windowEnd' | 'evaluable'> | null;
}

export interface ModeComparison {
  controlMode: ControlMode;
  runs: number;
  latencyP95Ms: number | null;
  errorRate: number | null;
  completed: number;
}

export interface MonitoringDashboard {
  run: ExperimentRunSummary | null;
  kpis: MonitoringKpis | null;
  prediction: MonitoringPrediction | null;
  history: MetricWindowPoint[];
  comparison: ModeComparison[];
  message: string | null;
}

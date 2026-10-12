import type { ControlMode } from '@/features/monitoring/enums/control-mode.enum';

export interface ExperimentRunSummary {
  id: string;
  scenario: 'NORMAL' | 'BURST' | 'SUSTAINED_PEAK' | 'STEPPED';
  controlMode: ControlMode;
  seed: number;
  generatorVersion: string;
  startedAt: string;
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
  riskScore: number | null;
  riskClass: 'HEALTHY' | 'SATURATION' | null;
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

import { ControlMode } from '@/features/monitoring/enums/control-mode.enum';
import { ExperimentScenario } from '@/features/monitoring/enums/experiment-scenario.enum';
import { ExperimentStatus } from '@/features/monitoring/enums/experiment-status.enum';
import { FallbackReason } from '@/features/monitoring/enums/fallback-reason.enum';
import { RiskClass } from '@/features/monitoring/enums/risk-class.enum';

export const controlModeCopy: Record<ControlMode, { label: string; detail: string }> = {
  [ControlMode.FIXED]: { label: 'Límite fijo', detail: 'Mantiene una capacidad constante.' },
  [ControlMode.REACTIVE]: { label: 'Control reactivo', detail: 'Ajusta según la telemetría actual.' },
  [ControlMode.PREDICTIVE]: { label: 'Control predictivo', detail: 'Anticipa riesgo con el modelo ML.' },
};

export const scenarioCopy: Record<ExperimentScenario, string> = {
  [ExperimentScenario.NORMAL]: 'Demanda normal',
  [ExperimentScenario.BURST]: 'Pico concentrado',
  [ExperimentScenario.SUSTAINED_PEAK]: 'Pico sostenido',
  [ExperimentScenario.STEPPED]: 'Demanda escalonada',
};

export const experimentStatusCopy: Record<ExperimentStatus, { label: string; tone: 'success' | 'info' | 'danger' | 'muted' }> = {
  [ExperimentStatus.RUNNING]: { label: 'En ejecución', tone: 'info' },
  [ExperimentStatus.COMPLETED]: { label: 'Finalizada', tone: 'success' },
  [ExperimentStatus.FAILED]: { label: 'Con incidencias', tone: 'danger' },
  [ExperimentStatus.CANCELLED]: { label: 'Cancelada', tone: 'muted' },
};

export const riskClassCopy: Record<RiskClass, { label: string; detail: string; tone: 'success' | 'warning' }> = {
  [RiskClass.HEALTHY]: { label: 'Riesgo controlado', detail: 'No se anticipa saturación en el horizonte evaluado.', tone: 'success' },
  [RiskClass.SATURATION]: { label: 'Riesgo de saturación', detail: 'Se recomienda limitar admisiones temporalmente.', tone: 'warning' },
};

export const fallbackReasonCopy: Record<FallbackReason, { label: string; detail: string }> = {
  [FallbackReason.INSUFFICIENT_TELEMETRY]: { label: 'Datos insuficientes', detail: 'Aún no hay observaciones suficientes para una predicción confiable.' },
  [FallbackReason.MODEL_UNAVAILABLE]: { label: 'Modelo no disponible', detail: 'El sistema continúa con control reactivo seguro.' },
  [FallbackReason.ML_TIMEOUT]: { label: 'Tiempo de espera agotado', detail: 'La respuesta del modelo tardó más de lo permitido.' },
  [FallbackReason.ML_ERROR]: { label: 'Servicio ML no disponible', detail: 'El sistema continúa con control reactivo seguro.' },
};

export function fallbackCopy(reason: string | null | undefined) {
  if (!reason) return { label: 'Respaldo activo', detail: 'Se aplica el control seguro.' };
  return fallbackReasonCopy[reason as FallbackReason] ?? { label: 'Respaldo activo', detail: reason.replaceAll('_', ' ').toLowerCase() };
}

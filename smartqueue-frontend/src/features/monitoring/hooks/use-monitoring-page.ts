import { useSearchParams } from 'react-router-dom';

import { controlModeCopy, experimentStatusCopy, fallbackCopy, riskClassCopy, scenarioCopy } from '@/features/monitoring/constants/monitoring-copy';
import { useExperimentRuns, useMonitoringDashboard } from '@/features/monitoring/hooks/use-monitoring-dashboard';
import type { MonitoringView } from '@/features/monitoring/types/monitoring-view.type';

const pageMeta: Record<MonitoringView, { eyebrow: string; title: string; description: string }> = {
  summary: { eyebrow: 'Centro de operaciones', title: 'Resumen de venta de entradas', description: 'Estado de la compra online, capacidad habilitada y riesgo operativo del cine.' },
  analytics: { eyebrow: 'Operación de entradas', title: 'Flujo de compra online', description: 'Ingresos al checkout, tiempos de respuesta y ventas confirmadas.' },
  saturation: { eyebrow: 'Saturación y capacidad', title: 'Protección del checkout', description: 'Riesgo próximo y cupos de compra para mantener la venta disponible.' },
  decisions: { eyebrow: 'Auditoría del controlador', title: 'Decisiones registradas', description: 'Trazabilidad de las decisiones de capacidad por ventana de observación.' },
  experiments: { eyebrow: 'Laboratorio ML', title: 'Validación del modelo', description: 'Resultados y comparación de estrategias de control.' },
};

export function useMonitoringPage(view: MonitoringView) {
  const [params, setParams] = useSearchParams();
  const selectedRunId = params.get('runId') ?? undefined;
  const dashboardQuery = useMonitoringDashboard(selectedRunId);
  const runsQuery = useExperimentRuns();
  const dashboard = dashboardQuery.data;
  const run = dashboard?.run;
  const history = dashboard?.history ?? [];
  const prediction = dashboard?.prediction ?? null;

  return {
    view,
    meta: pageMeta[view],
    selectedRunId,
    selectRun: (runId: string) => setParams(runId ? { runId } : {}),
    runs: runsQuery.data ?? [],
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    message: dashboard?.message ?? null,
    dashboard,
    run,
    history,
    prediction,
    status: run ? experimentStatusCopy[run.status] : null,
    mode: run ? controlModeCopy[run.controlMode] : null,
    scenario: run ? scenarioCopy[run.scenario] : null,
    risk: prediction?.riskClass ? riskClassCopy[prediction.riskClass] : null,
    fallback: fallbackCopy(prediction?.fallbackReason),
    validPredictions: history.filter(point => point.prediction?.modelVersion && !point.prediction.fallbackUsed).length,
    fallbackCount: history.filter(point => point.prediction?.fallbackUsed).length,
  };
}

export type MonitoringPageModel = ReturnType<typeof useMonitoringPage>;

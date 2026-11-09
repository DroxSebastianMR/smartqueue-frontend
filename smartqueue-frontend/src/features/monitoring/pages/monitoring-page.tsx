import { MonitoringContent } from '@/features/monitoring/components/monitoring-content';
import { MonitoringEmptyState } from '@/features/monitoring/components/monitoring-empty-state';
import { MonitoringHeader } from '@/features/monitoring/components/monitoring-header';
import { MonitoringRunSelector } from '@/features/monitoring/components/monitoring-run-selector';
import { useMonitoringPage } from '@/features/monitoring/hooks/use-monitoring-page';
import type { MonitoringView } from '@/features/monitoring/types/monitoring-view.type';
import { monitoringStyles } from '@/features/monitoring/constants/monitoring-styles';

export function MonitoringPage({ view = 'summary' }: { view?: MonitoringView }) {
  const monitor = useMonitoringPage(view);

  if (monitor.isLoading) return <MonitoringEmptyState title="Cargando el monitor del cine" message="Recuperando las últimas mediciones de compra y capacidad." />;
  if (monitor.isError) return <MonitoringEmptyState title="No se pudo obtener la telemetría" message="Verifica que el backend y la sesión de administrador estén activos." />;

  return <div className={monitoringStyles.page}>
    {!monitor.run ? <><MonitoringRunSelector monitor={monitor} /><MonitoringEmptyState title="Todavía no hay una corrida" message={monitor.message ?? 'Inicia un experimento para registrar indicadores operativos.'} /></> : <>
      <MonitoringHeader meta={monitor.meta} status={monitor.status!} mode={monitor.mode!} />
      <MonitoringRunSelector monitor={monitor} />
      <MonitoringContent monitor={monitor} />
    </>}
  </div>;
}

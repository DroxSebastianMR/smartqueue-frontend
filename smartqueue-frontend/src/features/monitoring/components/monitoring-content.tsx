import type { MonitoringPageModel } from '@/features/monitoring/hooks/use-monitoring-page';

import { MonitoringAnalytics } from './monitoring-analytics';
import { MonitoringDecisions } from './monitoring-decisions';
import { MonitoringExperiments } from './monitoring-experiments';
import { MonitoringSaturation } from './monitoring-saturation';
import { MonitoringSummary } from './monitoring-summary';

export function MonitoringContent({ monitor }: { monitor: MonitoringPageModel }) {
  if (monitor.view === 'analytics') return <MonitoringAnalytics monitor={monitor} />;
  if (monitor.view === 'saturation') return <MonitoringSaturation monitor={monitor} />;
  if (monitor.view === 'decisions') return <MonitoringDecisions monitor={monitor} />;
  if (monitor.view === 'experiments') return <MonitoringExperiments monitor={monitor} />;
  return <MonitoringSummary monitor={monitor} />;
}

import type { MonitoringDashboard, ExperimentRunSummary } from '@/features/monitoring/types/dashboard.types';
import { apiGet } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';

export const monitoringService = {
  dashboard: (runId?: string): Promise<MonitoringDashboard> => apiGet(API_ENDPOINTS.METRICS.DASHBOARD + (runId ? `?runId=${encodeURIComponent(runId)}` : '')),
  runs: (): Promise<ExperimentRunSummary[]> => apiGet('/experiments'),
};

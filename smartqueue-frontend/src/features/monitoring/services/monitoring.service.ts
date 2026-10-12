import type { MonitoringDashboard } from '@/features/monitoring/types/dashboard.types';
import { apiGet } from '@/infrastructure/api/client/axios.instance';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';

export const monitoringService = {
  dashboard: (): Promise<MonitoringDashboard> => apiGet(API_ENDPOINTS.METRICS.DASHBOARD),
};

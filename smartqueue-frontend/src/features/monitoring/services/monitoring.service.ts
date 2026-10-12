import type { MonitoringDashboard } from '@/features/monitoring/types/dashboard.types';
import { apiGet } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const monitoringService = {
  dashboard: (): Promise<MonitoringDashboard> => apiGet(API_ENDPOINTS.METRICS.DASHBOARD),
};

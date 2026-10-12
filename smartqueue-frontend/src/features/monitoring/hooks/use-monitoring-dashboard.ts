import { useQuery } from '@tanstack/react-query';
import { monitoringService } from '@/features/monitoring/services/monitoring.service';

export function useMonitoringDashboard() {
  return useQuery({ queryKey: ['monitoring', 'dashboard'], queryFn: monitoringService.dashboard, refetchInterval: 10_000 });
}

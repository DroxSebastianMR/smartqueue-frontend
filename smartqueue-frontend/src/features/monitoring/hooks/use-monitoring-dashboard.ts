import { useQuery } from '@tanstack/react-query';
import { monitoringService } from '@/features/monitoring/services/monitoring.service';
import { useMocks } from '@/infrastructure/api/client/axios.instance';

export function useMonitoringDashboard() {
  return useQuery({ queryKey: ['monitoring', 'dashboard'], queryFn: monitoringService.dashboard, enabled: !useMocks, refetchInterval: 10_000 });
}

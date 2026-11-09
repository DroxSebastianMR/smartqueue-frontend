import { useQuery } from '@tanstack/react-query';
import { monitoringService } from '@/features/monitoring/services/monitoring.service';

export function useMonitoringDashboard(runId?: string) {
  return useQuery({ queryKey: ['monitoring', 'dashboard', runId], queryFn: () => monitoringService.dashboard(runId), refetchInterval: 5_000 });
}

export function useExperimentRuns() {
  return useQuery({ queryKey: ['monitoring', 'runs'], queryFn: monitoringService.runs, refetchInterval: 5_000 });
}

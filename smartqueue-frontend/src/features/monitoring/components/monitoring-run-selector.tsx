import { RefreshCcw } from 'lucide-react';

import { controlModeCopy, experimentStatusCopy, scenarioCopy } from '@/features/monitoring/constants/monitoring-copy';
import { monitoringStyles } from '@/features/monitoring/constants/monitoring-styles';
import type { MonitoringPageModel } from '@/features/monitoring/hooks/use-monitoring-page';

export function MonitoringRunSelector({ monitor }: { monitor: MonitoringPageModel }) {
  return <section className={`grid gap-4 p-4 lg:grid-cols-[1.25fr_.75fr] lg:p-5 ${monitoringStyles.elevatedPanel}`}><label className="block text-sm font-medium text-slate-300">Seleccionar una corrida<select className="mt-2 block w-full rounded-xl border border-slate-700 bg-[#101827] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400" value={monitor.selectedRunId ?? ''} onChange={event => monitor.selectRun(event.target.value)}><option value="">Última corrida disponible</option>{monitor.runs.map(item => <option key={item.id} value={item.id}>{controlModeCopy[item.controlMode].label} · {scenarioCopy[item.scenario]} · {experimentStatusCopy[item.status].label}</option>)}</select></label>{monitor.run && <div className="grid gap-3 sm:grid-cols-3"><MiniMetric label="Escenario" value={monitor.scenario!} /><MiniMetric label="Inicio" value={new Date(monitor.run.startedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} /><MiniMetric label="Panel" value="Cada 5 segundos" icon={<RefreshCcw />} /></div>}</section>;
}

function MiniMetric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="rounded-xl bg-white/[.035] px-3 py-3"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-100">{icon && <span className="text-sky-300 [&>svg]:size-3.5">{icon}</span>}{value}</p></div>; }

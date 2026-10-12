import { Activity, BrainCircuit, Gauge, Server, ShieldAlert, UsersRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMonitoringDashboard } from '@/features/monitoring/hooks/use-monitoring-dashboard';
import type { MetricWindowPoint } from '@/features/monitoring/types/dashboard.types';

const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });

export function MonitoringPage() {
  const { data, isLoading, isError } = useMonitoringDashboard();
  if (isLoading) return <EmptyState title="Cargando telemetría" message="Consultando ventanas persistidas en NestJS." />;
  if (isError) return <EmptyState title="No se pudo cargar el monitoreo" message="Verifica NestJS, la sesión de administrador y la conexión con PostgreSQL." />;
  if (!data?.run) return <EmptyState title="Sin corrida activa" message={data?.message ?? 'Inicia un experimento para producir métricas reales.'} />;

  const { run, kpis, prediction, history, comparison } = data;
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.25em] text-sky-300">Panel experimental</p><h1 className="mt-2 text-4xl font-black tracking-tight">Control de saturación</h1><p className="mt-2 text-zinc-500">{run.id} · {run.scenario} · semilla {run.seed}</p></div>
        <Badge className="border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sky-200"><BrainCircuit className="mr-2 size-4" /> {run.controlMode}</Badge>
      </header>

      {!kpis ? <Card className="p-8 text-sm text-zinc-400">{data.message ?? 'Esperando el cierre de la primera ventana de 10 segundos.'}</Card> : <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={<UsersRound />} label="Cola actual" value={number.format(kpis.waiting)} />
          <Kpi icon={<Gauge />} label="Compradores activos" value={number.format(kpis.activeBuyers)} />
          <Kpi icon={<ShieldAlert />} label="Tasa de error técnico" value={percent.format(kpis.errorRate)} />
          <Kpi icon={<Activity />} label="Compras completadas" value={number.format(kpis.completed)} />
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
          <HistoryChart history={history} />
          <Card className="p-7">
            <div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">Riesgo a 30 segundos</p><p className="mt-2 text-5xl font-black">{prediction?.riskScore == null ? 'N/D' : percent.format(prediction.riskScore)}</p></div><span className="grid size-11 place-items-center rounded-xl bg-sky-500/12 text-sky-300"><BrainCircuit /></span></div>
            {prediction?.riskScore != null ? <div className="mt-8"><Progress value={prediction.riskScore * 100} /></div> : null}
            <dl className="mt-7 space-y-4 text-sm">
              <Row label="Clase" value={prediction?.riskClass ?? 'No disponible'} />
              <Row label="Modelo" value={prediction?.modelVersion ?? 'No disponible'} />
              <Row label="Edad" value={prediction?.predictionAgeMs == null ? 'No disponible' : `${number.format(prediction.predictionAgeMs)} ms`} />
              <Row label="Respuesta ML" value={prediction?.responseMs == null ? 'No disponible' : `${number.format(prediction.responseMs)} ms`} />
              <Row label="Fallback" value={prediction?.fallbackUsed ? prediction.fallbackReason ?? 'Activo' : 'No'} />
            </dl>
          </Card>
        </section>
        <section className="grid gap-6 lg:grid-cols-3"><Decision title="Límite anterior" value={prediction ? String(prediction.previousLimit) : 'N/D'} /><Decision title="Límite aplicado" value={String(kpis.currentLimit)} active /><Decision title="Throughput" value={`${number.format(kpis.throughput)} /s`} /></section>
      </>}
      <ComparisonTable comparison={comparison} />
    </div>
  );
}

function HistoryChart({ history }: { history: MetricWindowPoint[] }) {
  const max = Math.max(...history.map((point) => point.arrivalRate), 1);
  return <Card className="p-7"><div className="flex items-center justify-between"><div><h2 className="font-bold">Demanda por ventana</h2><p className="mt-1 text-sm text-zinc-500">Arrival rate persistido cada 10 segundos</p></div><span className="text-xs text-zinc-500">{history.length} ventanas</span></div>{history.length === 0 ? <p className="mt-12 text-sm text-zinc-500">Todavía no existen ventanas para graficar.</p> : <div className="mt-8 flex h-56 items-end gap-1">{history.map((point) => <div key={point.id} title={`${point.windowEnd}: ${point.arrivalRate}/s`} className="h-full flex-1 flex items-end"><div className="w-full min-w-1 rounded-t bg-gradient-to-t from-sky-800 to-cyan-300" style={{ height: `${Math.max(3, (point.arrivalRate / max) * 100)}%` }} /></div>)}</div>}</Card>;
}

function ComparisonTable({ comparison }: { comparison: Array<{ controlMode: string; runs: number; latencyP95Ms: number | null; errorRate: number | null; completed: number }> }) {
  return <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/8 p-6"><div><h2 className="font-bold">Comparación A/B/C</h2><p className="mt-1 text-sm text-zinc-500">Solo corridas completadas del mismo escenario</p></div><Server className="size-5 text-zinc-500" /></div>{comparison.length === 0 ? <p className="p-6 text-sm text-zinc-500">Aún no hay corridas comparables. Completa FIXED, REACTIVE y PREDICTIVE con las mismas semillas.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-600"><tr>{['Modo', 'Corridas', 'Latencia p95', 'Errores', 'Completadas'].map((heading) => <th key={heading} className="px-6 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-white/6">{comparison.map((item) => <tr key={item.controlMode}><td className="px-6 py-4 font-bold text-white">{item.controlMode}</td><td className="px-6 py-4 text-zinc-400">{item.runs}</td><td className="px-6 py-4 text-zinc-400">{item.latencyP95Ms == null ? 'N/D' : `${number.format(item.latencyP95Ms)} ms`}</td><td className="px-6 py-4 text-zinc-400">{item.errorRate == null ? 'N/D' : percent.format(item.errorRate)}</td><td className="px-6 py-4 text-zinc-400">{item.completed}</td></tr>)}</tbody></table></div>}</Card>;
}

function EmptyState({ title, message }: { title: string; message: string }) { return <div className="mx-auto max-w-3xl px-5 py-20"><Card className="p-10 text-center"><h1 className="text-2xl font-black">{title}</h1><p className="mt-3 text-zinc-500">{message}</p></Card></div>; }
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><span className="text-sky-300 [&>svg]:size-5">{icon}</span></div><p className="mt-4 text-xs text-zinc-600">Dato persistido</p></Card>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-zinc-500">{label}</dt><dd className="truncate font-semibold" title={value}>{value}</dd></div>; }
function Decision({ title, value, active = false }: { title: string; value: string; active?: boolean }) { return <Card className={`p-6 ${active ? 'border-sky-500/30 bg-sky-500/[.06]' : ''}`}><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-600">{title}</p><p className="mt-3 text-3xl font-black">{value}</p></Card>; }

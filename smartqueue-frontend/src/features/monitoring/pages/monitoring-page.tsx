import { Activity, BrainCircuit, Gauge, Server, ShieldAlert, UsersRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMonitoringDashboard, useExperimentRuns } from '@/features/monitoring/hooks/use-monitoring-dashboard';
import { useSearchParams } from 'react-router-dom';
import type { MetricWindowPoint } from '@/features/monitoring/types/dashboard.types';

const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });

export function MonitoringPage() {
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError } = useMonitoringDashboard(params.get('runId') ?? undefined);
  const runs = useExperimentRuns();
  const selector = <label className="block text-sm text-zinc-400">Corrida experimental
    <select className="mt-2 block w-full rounded-xl border border-white/15 bg-zinc-900 p-3 text-white" value={params.get('runId') ?? ''} onChange={event => setParams(event.target.value ? { runId: event.target.value } : {})}>
      <option value="">Última corrida</option>
      {runs.data?.map(item => <option key={item.id} value={item.id}>{item.controlMode} · {item.scenario} · {item.status} · {new Date(item.startedAt).toLocaleString('es-PE')}</option>)}
    </select>
  </label>;
  if (isLoading) return <EmptyState title="Cargando telemetría" message="Consultando ventanas persistidas en NestJS." />;
  if (isError) return <EmptyState title="No se pudo cargar el monitoreo" message="Verifica NestJS, la sesión de administrador y la conexión con PostgreSQL." />;
  if (!data?.run) return <div className="mx-auto max-w-3xl space-y-6 px-5 py-12">{selector}<EmptyState title="Sin datos de la corrida" message={data?.message ?? 'Inicia un experimento para producir métricas reales.'} /></div>;

  const { run, kpis, prediction, history, comparison } = data;
  const validPredictions = history.filter(point => point.prediction?.modelVersion && !point.prediction.fallbackUsed);
  const fallbackCount = history.filter(point => point.prediction?.fallbackUsed).length;
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 lg:px-8">
      {selector}
      <Card className="border-sky-300/20 p-5 text-sm text-zinc-300">
        <p className="font-semibold text-white">{run.status === 'RUNNING' ? 'Experimento en ejecución' : `Registro histórico · ${run.status}`}</p>
        <p className="mt-2">{run.controlMode === 'PREDICTIVE' ? `${validPredictions.length} inferencias ML registradas · ${fallbackCount} ventanas en respaldo` : 'Este controlador no usa inferencia ML.'}</p>
        <p className="mt-2">Última ventana: {prediction?.fallbackUsed ? `respaldo ${prediction.fallbackReason}` : prediction?.modelVersion ? `modelo ${prediction.modelVersion}` : 'sin decisión registrada'}.</p>
        <p className="mt-2 text-zinc-500">Una predicción registrada prueba la conexión, no la precisión del modelo. El modelo bootstrap utiliza datos sintéticos.</p>
      </Card>
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
              <Row label="Modo aplicado" value={prediction?.appliedMode ?? 'Pendiente'} />
              <Row label="Ventana" value={prediction?.windowEnd ? new Date(prediction.windowEnd).toLocaleTimeString('es-PE') : 'Pendiente'} />
              <Row label="Edad" value={prediction?.predictionAgeMs == null ? 'No disponible' : `${number.format(prediction.predictionAgeMs)} ms`} />
              <Row label="Respuesta ML" value={prediction?.responseMs == null ? 'No disponible' : `${number.format(prediction.responseMs)} ms`} />
              <Row label="Fallback" value={prediction?.fallbackUsed ? prediction.fallbackReason ?? 'Activo' : 'No'} />
            </dl>
          </Card>
        </section>
        <section className="grid gap-6 lg:grid-cols-3"><Decision title="Límite anterior" value={prediction ? String(prediction.previousLimit) : 'N/D'} /><Decision title="Límite aplicado" value={String(kpis.currentLimit)} active /><Decision title="Throughput" value={`${number.format(kpis.throughput)} /s`} /></section>
      </>}
      <Card className="overflow-hidden">
        <div className="border-b border-white/8 p-6"><h2 className="font-bold">Decisiones por ventana</h2><p className="mt-1 text-sm text-zinc-500">Observaciones persistidas cada 10 segundos; una ventana no evaluable activa el respaldo.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-500"><tr>{['Ventana', 'Datos', 'Riesgo', 'Modelo', 'Modo aplicado', 'Límite', 'Respaldo'].map(heading => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-white/6">{history.map(point => <tr key={point.id}><td className="px-4 py-3">{new Date(point.windowEnd).toLocaleTimeString('es-PE')}</td><td className="px-4 py-3">{point.evaluable ? 'Evaluable' : 'Insuficientes'}</td><td className="px-4 py-3">{point.prediction?.riskScore == null ? 'N/D' : percent.format(point.prediction.riskScore)}</td><td className="px-4 py-3">{point.prediction?.modelVersion ?? '—'}</td><td className="px-4 py-3">{point.prediction?.appliedMode ?? 'Pendiente'}</td><td className="px-4 py-3">{point.prediction?.appliedLimit ?? '—'}</td><td className="px-4 py-3">{point.prediction?.fallbackUsed ? point.prediction.fallbackReason ?? 'Sí' : 'No'}</td></tr>)}</tbody></table></div>
      </Card>
      <ComparisonTable comparison={comparison} />
    </div>
  );
}

function HistoryChart({ history }: { history: MetricWindowPoint[] }) {
  const max = Math.max(...history.map((point) => point.arrivalRate), 1);
  return <Card className="p-7"><div className="flex items-center justify-between"><div><h2 className="font-bold">Demanda por ventana</h2><p className="mt-1 text-sm text-zinc-500">Arrival rate persistido cada 10 segundos</p></div><span className="text-xs text-zinc-500">{history.length} ventanas</span></div>{history.length === 0 ? <p className="mt-12 text-sm text-zinc-500">Todavía no existen ventanas para graficar.</p> : <div className="mt-8 flex h-56 items-end gap-1">{history.map((point) => <div key={point.id} title={`${point.windowEnd}: ${point.arrivalRate}/s`} className="h-full flex-1 flex items-end"><div className="w-full min-w-1 rounded-t bg-gradient-to-t from-sky-800 to-cyan-300" style={{ height: `${Math.max(3, (point.arrivalRate / max) * 100)}%` }} /></div>)}</div>}</Card>;
}

function ComparisonTable({ comparison }: { comparison: Array<{ controlMode: string; runs: number; latencyP95Ms: number | null; errorRate: number | null; completed: number }> }) {
  return <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/8 p-6"><div><h2 className="font-bold">Comparación A/B/C exploratoria</h2><p className="mt-1 text-sm text-zinc-500">Corridas completadas con la misma traza, escenario, semilla y duración. No implica significación estadística.</p></div><Server className="size-5 text-zinc-500" /></div>{comparison.length === 0 ? <p className="p-6 text-sm text-zinc-500">Aún no hay corridas comparables. Completa FIXED, REACTIVE y PREDICTIVE con las mismas semillas.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-600"><tr>{['Modo', 'Corridas', 'Latencia p95', 'Errores', 'Completadas'].map((heading) => <th key={heading} className="px-6 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-white/6">{comparison.map((item) => <tr key={item.controlMode}><td className="px-6 py-4 font-bold text-white">{item.controlMode}</td><td className="px-6 py-4 text-zinc-400">{item.runs}</td><td className="px-6 py-4 text-zinc-400">{item.latencyP95Ms == null ? 'N/D' : `${number.format(item.latencyP95Ms)} ms`}</td><td className="px-6 py-4 text-zinc-400">{item.errorRate == null ? 'N/D' : percent.format(item.errorRate)}</td><td className="px-6 py-4 text-zinc-400">{item.completed}</td></tr>)}</tbody></table></div>}</Card>;
}

function EmptyState({ title, message }: { title: string; message: string }) { return <div className="mx-auto max-w-3xl px-5 py-20"><Card className="p-10 text-center"><h1 className="text-2xl font-black">{title}</h1><p className="mt-3 text-zinc-500">{message}</p></Card></div>; }
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><span className="text-sky-300 [&>svg]:size-5">{icon}</span></div><p className="mt-4 text-xs text-zinc-600">Dato persistido</p></Card>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-zinc-500">{label}</dt><dd className="truncate font-semibold" title={value}>{value}</dd></div>; }
function Decision({ title, value, active = false }: { title: string; value: string; active?: boolean }) { return <Card className={`p-6 ${active ? 'border-sky-500/30 bg-sky-500/[.06]' : ''}`}><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-600">{title}</p><p className="mt-3 text-3xl font-black">{value}</p></Card>; }

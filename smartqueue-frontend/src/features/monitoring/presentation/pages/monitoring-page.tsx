import { Activity, BrainCircuit, Gauge, Server, ShieldAlert, UsersRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const bars = [28, 34, 42, 38, 52, 71, 63, 78, 56, 48, 39, 46];

export function MonitoringPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-red-400">Panel experimental</p><h1 className="mt-2 text-4xl font-black tracking-tight">Control de saturación</h1><p className="mt-2 text-zinc-500">Ejecución RUN-2026-10-11-07 · escenario pico sostenido</p></div><Badge className="border-violet-500/20 bg-violet-500/10 px-3 py-2 text-violet-300"><BrainCircuit className="mr-2 size-4" /> Predictivo</Badge></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi icon={<UsersRound />} label="Cola actual" value="142" delta="+18 última ventana" /><Kpi icon={<Gauge />} label="Latencia p95" value="842 ms" delta="bajo L = 1 000 ms" /><Kpi icon={<ShieldAlert />} label="Tasa de error" value="3.8%" delta="bajo E = 5%" /><Kpi icon={<Activity />} label="Compras/min" value="9.4" delta="+6.2% vs. fija" /></section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <Card className="p-7"><div className="flex items-center justify-between"><div><h2 className="font-bold">Demanda por ventana</h2><p className="mt-1 text-sm text-zinc-500">Solicitudes nuevas cada 10 segundos</p></div><span className="text-xs text-zinc-500">Últimos 2 min</span></div><div className="mt-8 flex h-56 items-end gap-2">{bars.map((height, i) => <div key={i} className="group flex h-full flex-1 items-end"><div className="w-full rounded-t-md bg-gradient-to-t from-red-700 to-red-400/80 transition group-hover:to-amber-300" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-zinc-600"><span>-120 s</span><span>ahora</span></div></Card>
        <Card className="p-7"><div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">Riesgo a 30 segundos</p><p className="mt-2 text-5xl font-black">72<span className="text-2xl text-zinc-500">%</span></p></div><span className="grid size-11 place-items-center rounded-xl bg-amber-500/12 text-amber-300"><BrainCircuit /></span></div><div className="mt-8"><Progress value={72} /></div><dl className="mt-7 space-y-4 text-sm"><Row label="Clase" value="SATURATION" /><Row label="Modelo" value="logistic-20261011" /><Row label="Horizonte" value="30 s" /><Row label="Respuesta" value="43 ms" /></dl></Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-3"><Decision title="Límite anterior" value="24" note="compradores simultáneos" /><Decision title="Decisión aplicada" value="22" note="reducción gradual de 2" active /><Decision title="Fallback" value="Listo" note="control reactivo conservador" /></section>
      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/8 p-6"><div><h2 className="font-bold">Comparación de modos</h2><p className="mt-1 text-sm text-zinc-500">Misma traza, stock y recursos</p></div><Server className="size-5 text-zinc-500" /></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-zinc-600"><tr>{['Modo', 'Latencia p95', 'Errores', 'Completadas', 'Espera media'].map((h) => <th key={h} className="px-6 py-4 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/6"><TableRow values={['Cola fija', '1 246 ms', '7.1%', '88', '3.2 min']} /><TableRow values={['Reactivo', '931 ms', '4.6%', '91', '3.8 min']} /><TableRow values={['Predictivo', '842 ms', '3.8%', '94', '4.0 min']} active /></tbody></table></div></Card>
    </div>
  );
}

function Kpi({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) { return <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><span className="text-red-400 [&>svg]:size-5">{icon}</span></div><p className="mt-4 text-xs text-zinc-600">{delta}</p></Card>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between"><dt className="text-zinc-500">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
function Decision({ title, value, note, active = false }: { title: string; value: string; note: string; active?: boolean }) { return <Card className={`p-6 ${active ? 'border-red-500/30 bg-red-500/[.06]' : ''}`}><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-600">{title}</p><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-zinc-500">{note}</p></Card>; }
function TableRow({ values, active = false }: { values: string[]; active?: boolean }) { return <tr className={active ? 'bg-red-500/[.05]' : ''}>{values.map((value, index) => <td key={value} className={`px-6 py-4 ${index === 0 ? 'font-bold text-white' : 'text-zinc-400'}`}>{value}{active && index === 0 ? <Badge className="ml-3 border-red-500/20 bg-red-500/10 text-red-300">actual</Badge> : null}</td>)}</tr>; }


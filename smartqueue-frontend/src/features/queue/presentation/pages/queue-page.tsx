import { ArrowLeft, CheckCircle2, Info, LoaderCircle, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QueueStatus } from '@/features/queue/domain/enums/queue-status.enum';
import { useQueue } from '@/features/queue/application/use-queue';

export function QueuePage() {
  const navigate = useNavigate();
  const { status, admit } = useQueue();
  const snapshot = status.data;
  const admitted = snapshot?.entry.status === QueueStatus.ADMITTED || snapshot?.entry.status === QueueStatus.RESERVED;
  const peopleAhead = snapshot?.peopleAhead ?? 17;
  const estimated = snapshot?.estimatedWaitMinutes;
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ArrowLeft className="size-4" /> Volver al evento</button>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="border-b border-white/8 p-7 sm:p-9"><Badge className={admitted ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}>{admitted ? <CheckCircle2 className="mr-2 size-3.5" /> : <span className="mr-2 size-1.5 animate-pulse rounded-full bg-amber-300" />}{admitted ? 'Acceso concedido' : 'Esperando tu turno'}</Badge><h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{admitted ? 'Es momento de comprar' : 'Ya estás en la fila virtual'}</h1><p className="mt-3 text-zinc-500">Puedes mantener esta pestaña abierta. Tu lugar queda asociado a este dispositivo.</p></div>
          <div className="p-7 sm:p-9">
            <div className="grid gap-4 sm:grid-cols-3"><Metric label="Tu turno" value={`#${String(snapshot?.entry.turnNumber ?? 42).padStart(3, '0')}`} /><Metric label="Personas delante" value={String(peopleAhead)} /><Metric label="Espera estimada" value={estimated === null || estimated === undefined ? 'Calculando' : `~ ${estimated} min`} /></div>
            <div className="mt-9"><div className="mb-3 flex justify-between text-sm"><span className="text-zinc-400">Progreso en la cola</span><b>71%</b></div><Progress value={71} /></div>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-sm leading-6 text-sky-100/75"><Info className="mt-1 size-4 shrink-0 text-sky-300" /> La predicción regula cuántas personas ingresan al proceso de compra, pero nunca cambia el orden de llegada.</div>
            <Button className="mt-8 w-full sm:w-auto" disabled={admit.isPending || status.isLoading} onClick={() => admitted ? navigate('/purchase') : admit.mutate()}>{admit.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{admitted ? 'Continuar a compra' : 'Simular admisión'}</Button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Evento</p><h2 className="mt-3 text-xl font-bold">Doomsday: estreno de medianoche</h2><p className="mt-2 text-sm text-zinc-500">Jueves 17 · 11:45 p. m.</p></Card>
          <Card className="p-6"><h3 className="flex items-center gap-2 font-bold"><UsersRound className="size-4 text-red-400" /> Estado del acceso</h3><dl className="mt-5 space-y-4 text-sm"><Row label="Compradores activos" value="18 / 24" /><Row label="Ritmo de admisión" value="4.2 / min" /><Row label="Próxima revisión" value="8 s" /></dl></Card>
          <Button variant="ghost" className="w-full text-zinc-500">Abandonar la cola</Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/[.045] p-5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between"><dt className="text-zinc-500">{label}</dt><dd className="font-semibold text-zinc-200">{value}</dd></div>; }


import { AlertCircle, Check, Clock3, LoaderCircle, ShieldCheck, Ticket } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePurchase } from '@/features/purchase/hooks/use-purchase';
import { SeatPicker } from '@/features/purchase/components/seat-picker';

export function PurchasePage() {
  const [selectedSeats, setSelectedSeats] = useState(['C5', 'C6']);
  const purchase = usePurchase();
  const quantity = selectedSeats.length;
  if (purchase.data) return <Success quantity={quantity} confirmationCode={purchase.data.confirmationCode} />;
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(125,190,255,.1),transparent_28%),#08090c] px-5 pb-20 pt-32 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><Badge className="border-emerald-200/15 bg-emerald-200/[.07] text-emerald-100">Preventa · Infinity Vision</Badge><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Elige dónde vivir la película</h1><p className="mt-3 text-zinc-500">Avengers: Doomsday · Sala Infinity Vision 01 · 21:30</p></div><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm font-semibold text-zinc-300"><Clock3 className="size-4 text-sky-200" /> 04:38 restantes</div></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="border-white/[.08] bg-[#0d1015]/90 p-5 sm:p-9"><SeatPicker selectedSeats={selectedSeats} onChange={setSelectedSeats} /></Card>
          <div className="space-y-6">
            <Card className="border-white/[.08] bg-[#0d1015]/90 p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-600">Tu función</p><h2 className="mt-4 text-xl font-semibold">Avengers: Doomsday</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Cinetrux Primavera · Infinity Vision<br />Preventa · 17 de diciembre · 21:30</p><div className="my-6 h-px bg-white/[.07]" /><div className="space-y-4 text-sm"><Summary label="Butacas" value={selectedSeats.length ? selectedSeats.join(', ') : 'Selecciona una'} /><Summary label={`${quantity} entrada${quantity === 1 ? '' : 's'}`} value={`S/ ${(quantity * 24.9).toFixed(2)}`} /><Summary label="Servicio" value="S/ 0.00" /><Summary label="Total simulado" value={`S/ ${(quantity * 24.9).toFixed(2)}`} strong /></div>{purchase.error && <p className="mt-5 flex gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300"><AlertCircle className="size-4 shrink-0" />{purchase.error.message}</p>}<Button className="mt-7 w-full" size="lg" disabled={purchase.isPending || quantity === 0} onClick={() => purchase.mutate(quantity)}>{purchase.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Ticket className="size-4" />} Continuar compra</Button></Card>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-sm leading-6 text-zinc-500"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-sky-200/80" /> No se solicitarán datos de tarjeta ni se realizará ningún cobro real.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between gap-4 ${strong ? 'pt-2 text-base font-bold text-white' : 'text-zinc-500'}`}><span>{label}</span><span className="text-right">{value}</span></div>; }
function Success({ quantity, confirmationCode }: { quantity: number; confirmationCode: string }) { return <div className="min-h-screen bg-[#08090c] px-5 pb-20 pt-32 text-white"><Card className="mx-auto my-16 max-w-xl border-sky-200/10 bg-[#0d1015] p-10 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-sky-200/10 text-sky-200"><Check className="size-8" /></span><h1 className="mt-6 text-3xl font-semibold">Simulación confirmada</h1><p className="mt-3 text-zinc-500">Se registró una compra ficticia de {quantity} entrada{quantity > 1 ? 's' : ''} y el cupo de admisión quedó libre.</p><div className="mx-auto mt-7 w-fit rounded-xl border border-dashed border-white/15 px-5 py-3 font-mono text-sm">{confirmationCode}</div></Card></div>; }

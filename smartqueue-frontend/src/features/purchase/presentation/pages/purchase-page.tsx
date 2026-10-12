import { AlertCircle, Check, Clock3, LoaderCircle, Minus, Plus, ShieldCheck, Ticket } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePurchase } from '@/features/purchase/application/use-purchase';

export function PurchasePage() {
  const [quantity, setQuantity] = useState(2);
  const purchase = usePurchase();
  if (purchase.data) return <Success quantity={quantity} confirmationCode={purchase.data.confirmationCode} />;
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Acceso concedido</Badge><h1 className="mt-4 text-4xl font-black tracking-tight">Completa tu compra simulada</h1></div><div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300"><Clock3 className="size-4" /> 04:38 restantes</div></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="p-7 sm:p-9"><h2 className="text-xl font-bold">Selecciona tus entradas</h2><p className="mt-2 text-sm text-zinc-500">Tipo único para mantener el experimento controlado.</p><div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] p-5"><div><p className="font-bold">Entrada general</p><p className="mt-1 text-sm text-zinc-500">Sala 7 · Asientos no numerados</p><p className="mt-3 text-lg font-black">S/ 24.90</p></div><div className="flex items-center gap-4"><Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="size-4" /></Button><b className="w-5 text-center text-xl">{quantity}</b><Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(10, quantity + 1))}><Plus className="size-4" /></Button></div></div><div className="mt-6 flex items-center gap-3 rounded-xl bg-white/[.035] p-4 text-sm text-zinc-400"><ShieldCheck className="size-5 text-emerald-400" /> No se solicitarán datos de tarjeta ni se realizará ningún cobro.</div></Card>
        <Card className="p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Resumen</p><h2 className="mt-4 text-xl font-bold">Doomsday: estreno de medianoche</h2><div className="my-6 h-px bg-white/8" /><div className="space-y-4 text-sm"><Summary label={`${quantity} entrada${quantity > 1 ? 's' : ''}`} value={`S/ ${(quantity * 24.9).toFixed(2)}`} /><Summary label="Servicio" value="S/ 0.00" /><Summary label="Total simulado" value={`S/ ${(quantity * 24.9).toFixed(2)}`} strong /></div>{purchase.error && <p className="mt-5 flex gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300"><AlertCircle className="size-4 shrink-0" />{purchase.error.message}</p>}<Button className="mt-7 w-full" size="lg" disabled={purchase.isPending} onClick={() => purchase.mutate(quantity)}>{purchase.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Ticket className="size-4" />} Confirmar simulación</Button></Card>
      </div>
    </div>
  );
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between ${strong ? 'pt-2 text-base font-black text-white' : 'text-zinc-400'}`}><span>{label}</span><span>{value}</span></div>; }
function Success({ quantity, confirmationCode }: { quantity: number; confirmationCode: string }) { return <div className="px-5 py-10"><Card className="mx-auto my-16 max-w-xl p-10 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><Check className="size-8" /></span><h1 className="mt-6 text-3xl font-black">Simulación confirmada</h1><p className="mt-3 text-zinc-500">Se registró una compra ficticia de {quantity} entrada{quantity > 1 ? 's' : ''} y el cupo de admisión quedó libre.</p><div className="mx-auto mt-7 w-fit rounded-xl border border-dashed border-white/15 px-5 py-3 font-mono text-sm">{confirmationCode}</div></Card></div>; }


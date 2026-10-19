import { ArrowLeft, ArrowRight, Info, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TicketCheckout } from '@/features/purchase/components/ticket-checkout';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookingSteps } from '@/features/purchase/components/booking-steps';
import { BookingSummary } from '@/features/purchase/components/booking-summary';
import { SeatPicker } from '@/features/purchase/components/seat-picker';
import { useSeatSelection } from '@/features/purchase/hooks/use-seat-selection';

export function PurchasePage() {
  const [params] = useSearchParams();
  const id = params.get('showtimeId');
  if (!id) return <div className="min-h-[70vh] px-5 pb-20 pt-36 text-white"><Card className="mx-auto max-w-xl p-10 text-center"><h1 className="text-2xl font-semibold">Primero, elige tu función</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Cada película y horario tiene su propia sala. Encuentra tu función para ver las butacas disponibles.</p><Link to="/#cinema-finder" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950">Ver funciones <ArrowRight className="size-4" /></Link></Card></div>;
  return <SeatSelectionPage key={id} showtimeId={id} />;
}

function SeatSelectionPage({ showtimeId }: { showtimeId: string }) {
  const { map: query, quote, selectedIds, toggle, selectionChanged, reviewing, edit } = useSeatSelection(showtimeId);
  const [ticketTotal, setTicketTotal] = useState<number | null>(null);
  const [payment, setPayment] = useState(false);
  useEffect(() => { if (!reviewing) { setTicketTotal(null); setPayment(false); } }, [reviewing]);
  const map = query.data;
  const selected = map?.seats.filter((seat) => selectedIds.includes(seat.id)) ?? [];
  return <div className="bg-[radial-gradient(ellipse_at_30%_10%,rgba(125,190,255,.05),transparent_50%)] px-4 pb-14 pt-8 text-white sm:px-7 lg:pt-10">
    <div className="mx-auto max-w-[1600px]">
      <div className="relative mb-9 border-b border-white/[.07] pb-7"><Link to="/#cinema-finder" className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white lg:absolute lg:top-3 lg:mb-0"><ArrowLeft className="size-4" />Cambiar función</Link><BookingSteps current={reviewing ? payment ? 2 : 1 : 0} /></div>
      {query.isPending ? <div role="status" className="grid min-h-96 place-items-center text-sm text-zinc-400"><span className="flex items-center gap-3"><LoaderCircle className="size-5 animate-spin" />Preparando tu sala…</span></div> : query.isError || !map ? <Card className="mx-auto max-w-lg p-9 text-center"><h1 className="text-xl font-semibold">No pudimos abrir esta sala</h1><p className="my-4 text-sm text-zinc-400">La función puede no estar disponible. Intenta de nuevo o elige otro horario.</p><Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="size-4" />Reintentar</Button></Card> : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-12">
        <section className="min-w-0">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.3em] text-sky-200/60">{map.auditoriumName} · Cinetrux</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{reviewing ? 'Tu próxima gran historia.' : 'Elige tu lugar favorito.'}</h1><p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">{reviewing ? 'Revisa los detalles de tus entradas antes del siguiente paso.' : `Una gran película merece el mejor lugar. Selecciona hasta ${map.maxSelection} butacas.`}</p></div><span className="mt-1 rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-zinc-400">{map.bookable ? 'Selección de butacas' : 'Venta no disponible'}</span></div>
          {!map.bookable && <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 border-l-2 border-sky-200/30 pl-4"><div><p className="text-sm font-medium text-zinc-300">Descubre tu sala</p><p className="mt-1 text-xs text-zinc-500">Este horario ya no está a la venta. Puedes explorar las butacas.</p></div><Link to="/#cinema-finder" className="inline-flex items-center gap-2 text-xs font-medium text-sky-200 transition hover:text-white">Elegir otro horario <ArrowRight className="size-3.5" /></Link></div>}
          {selectionChanged && <p role="alert" className="mb-4 text-sm text-amber-100">Cambió la disponibilidad de una butaca. Revisa tu selección.</p>}
          {query.isRefetchError && <p role="alert" className="mb-4 text-sm text-amber-100">No se pudo actualizar la disponibilidad. Se comprobará de nuevo al continuar.</p>}
          {reviewing ? <TicketCheckout showtimeId={showtimeId} seatIds={selectedIds} onEdit={edit} onQuote={setTicketTotal} onPayment={setPayment} /> : <Card className="overflow-hidden rounded-2xl border-white/[.06] bg-[#0d1015]/70 px-3 py-8 shadow-none sm:px-7 sm:py-10">{map.seats.length ? <SeatPicker seats={map.seats} selectedIds={selectedIds} onToggle={toggle} disabled={!map.bookable || quote.isPending} limit={map.maxSelection} /> : <p className="py-16 text-center text-sm text-zinc-400">Esta sala todavía no tiene butacas configuradas.</p>}</Card>}
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-500"><Info className="mt-0.5 size-4 shrink-0" />Las butacas accesibles están identificadas en el mapa. La selección no bloquea los asientos; su disponibilidad puede cambiar.</p>
        </section>
        <aside className="min-w-0 self-start"><BookingSummary map={map} seats={selected} totalCents={reviewing ? ticketTotal : null}>
          {quote.isError && <p role="alert" className="mb-4 text-sm text-amber-100">No pudimos validar las butacas. Revisa la disponibilidad e inténtalo de nuevo.</p>}
          {reviewing ? <div className="rounded-xl border border-sky-200/15 bg-sky-200/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-sky-100"><ShieldCheck className="size-4" />Resumen listo</p><p className="mt-2 text-xs leading-5 text-zinc-400">El pago y la reserva de estas butacas aún no están habilitados. No se ha realizado ningún cobro.</p></div> : <Button className="w-full rounded-xl py-3.5" disabled={!map.bookable || !selectedIds.length || quote.isPending} onClick={() => quote.mutate(selectedIds)}>{quote.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{quote.isPending ? 'Verificando butacas…' : 'Continuar'}{!quote.isPending && <ArrowRight className="size-4" />}</Button>}
        </BookingSummary><p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500"><ShieldCheck className="size-3.5" />Disponibilidad por función · Actualización automática</p></aside>
      </div>}
    </div>
  </div>;
}

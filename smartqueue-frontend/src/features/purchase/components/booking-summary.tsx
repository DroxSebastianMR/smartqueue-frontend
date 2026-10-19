import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { CinemaSeat, SeatMap } from '@/features/purchase/types/seat-map.types';
import type { ReactNode } from 'react';

export const formatMoney = (cents: number, currency: string) => new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(cents / 100);
export function BookingSummary({ map, seats, children, totalCents }: { map: SeatMap; seats: CinemaSeat[]; children: ReactNode; totalCents?: number | null }) {
  const date = new Intl.DateTimeFormat('es-PE', { timeZone: map.timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(map.startsAt));
  const formats: Record<string, string> = { TWO_D: '2D', THREE_D: '3D', INFINITY_VISION: 'Infinity Vision' };
  return <Card className="overflow-hidden rounded-2xl border-white/[.08] bg-[#101318] shadow-none">
    <div className="p-6 sm:p-7"><p className="mb-6 text-[10px] font-semibold uppercase tracking-[.25em] text-zinc-500">Tu experiencia</p>
      <div className="flex items-center gap-4">
        {map.posterUrl ? <img src={map.posterUrl} alt="" className="h-28 w-[74px] shrink-0 rounded-lg object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
        <div><h2 className="text-lg font-semibold leading-snug tracking-tight text-white">{map.movieTitle}</h2><p className="mt-2 text-xs text-zinc-400">{formats[map.format] ?? map.format} · {map.audioLanguage.startsWith('es') ? 'Español' : map.audioLanguage}</p></div>
      </div>
      <div className="my-6 h-px bg-white/[.07]" />
      <div className="space-y-4 text-sm"><div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-sky-200/60" /><div className="text-zinc-200">{map.cinemaName}<p className="mt-1 text-xs text-zinc-500">{map.auditoriumName}</p></div></div><div className="flex gap-3"><CalendarDays className="size-4 shrink-0 text-sky-200/60" /><p className="text-zinc-300">{date}</p></div></div>
      <div className="my-6 h-px bg-white/[.07]" />
      <div className="flex justify-between text-xs text-zinc-400"><span className="flex items-center gap-2"><Ticket className="size-4" />Butacas</span><span>{seats.length} / {map.maxSelection}</span></div>
      <div className="mt-3 grid min-h-16 grid-cols-3 content-start gap-2" aria-live="polite">{seats.length ? seats.map((seat) => <span key={seat.id} className="rounded-md border border-sky-200/15 bg-sky-200/[.06] px-2 py-1.5 text-center text-xs font-semibold text-sky-100">{seat.row}{seat.number}</span>) : <p className="col-span-3 text-xs text-zinc-600">Tu lugar en la historia empieza aquí.</p>}</div>
      <div className="mt-6 flex justify-between text-xs text-zinc-400"><span>{totalCents == null ? 'Tarifa general' : 'Entradas cotizadas'} × {seats.length}</span><span>{totalCents == null ? `${formatMoney(map.basePriceCents, map.currency)} c/u` : 'Precio validado'}</span></div>
    </div>
    <div className="border-t border-white/[.07] bg-white/[.02] p-6 sm:p-7"><div className="mb-5 flex items-end justify-between"><span className="text-sm text-zinc-400">{totalCents == null ? 'Total referencial' : 'Total cotizado'}</span><strong className="text-2xl font-semibold tracking-tight text-white">{formatMoney(totalCents ?? seats.length * map.basePriceCents, map.currency)}</strong></div>{children}</div>
  </Card>;
}

import { Accessibility, Armchair, Check, Crown, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SeatAvailability, SeatType, type CinemaSeat } from '@/features/purchase/types/seat-map.types';

export function SeatPicker({ seats, selectedIds, onToggle, disabled, limit }: {
  seats: CinemaSeat[]; selectedIds: string[]; onToggle: (id: string) => void; disabled: boolean; limit: number;
}) {
  const rows = [...new Set(seats.map((seat) => seat.row))];
  // Seat numbers define physical columns. Missing numbers remain empty, never become fake seats.
  const numbers = seats.map((seat) => seat.number);
  const first = Math.min(...numbers);
  const columns = Array.from({ length: Math.max(...numbers) - first + 1 }, (_, index) => first + index);
  const seatIndex = new Map(seats.map((seat) => [`${seat.row}:${seat.number}`, seat]));
  return <div>
    <div className="mx-auto mb-8 max-w-xl px-6 pt-1">
      <svg viewBox="0 0 480 45" aria-hidden className="w-full overflow-visible"><defs><linearGradient id="screen-light"><stop stopColor="#7dd3fc" stopOpacity="0" /><stop offset=".5" stopColor="#e0f2fe" /><stop offset="1" stopColor="#7dd3fc" stopOpacity="0" /></linearGradient></defs><path d="M8 30 Q240 -12 472 30" fill="none" stroke="url(#screen-light)" strokeWidth="3" /><path d="M8 30 Q240 -12 472 30 L445 44 Q240 12 35 44Z" fill="#bae6fd" fillOpacity=".035" /></svg>
      <p className="mt-3 text-center text-[9px] font-medium uppercase tracking-[.5em] text-sky-100/40">Pantalla · Frente de la sala</p>
    </div>
    <div className="overflow-x-auto px-1 pb-5" tabIndex={0} role="region" aria-label="Mapa de butacas; desplaza horizontalmente en pantallas pequeñas">
      <div className="mx-auto w-max space-y-2">
        {rows.map((row) => <div key={row} className="flex items-center gap-3">
          <span className="w-3 text-center text-[11px] text-zinc-500">{row}</span>
          <div className="flex gap-1.5">
            {columns.map((number) => {
              const seat = seatIndex.get(`${row}:${number}`);
              if (!seat) return <span key={number} aria-hidden className="size-10 shrink-0 sm:size-8" />;
              const selected = selectedIds.includes(seat.id);
              const unavailable = seat.availability !== SeatAvailability.AVAILABLE;
              const accessible = seat.type === SeatType.ACCESSIBLE;
              const premium = seat.type === SeatType.PREMIUM;
              const companion = seat.type === SeatType.COMPANION;
              return <Button key={seat.id} variant="ghost" size="icon" disabled={disabled || unavailable || (!selected && selectedIds.length >= limit)}
                onClick={() => onToggle(seat.id)} aria-pressed={selected}
                aria-label={`Butaca ${row}${number}${accessible ? ', accesible' : ''}, ${unavailable ? 'no disponible' : selected ? 'seleccionada' : 'disponible'}`}
                title={`${row}${number} · ${accessible ? 'Espacio accesible' : premium ? 'Premium' : companion ? 'Acompañante' : 'Estándar'}`}
                className={cn('relative size-10 shrink-0 flex-col gap-0 rounded-t-lg rounded-b border p-0 transition-colors duration-200 disabled:opacity-80 sm:size-8 [&>svg]:size-4 sm:[&>svg]:size-3.5',
                  unavailable ? 'border-white/[.04] bg-white/[.025] text-zinc-700 disabled:opacity-70' : selected ? 'border-sky-100 bg-sky-200 text-slate-950 shadow-[0_0_18px_#bae6fd25] hover:bg-sky-100 hover:text-slate-950' : 'border-white/15 bg-white/[.06] text-zinc-400 hover:border-sky-200/50 hover:bg-sky-200/10',
                  accessible && !selected && !unavailable && 'border-sky-200/30 text-sky-200',
                  premium && !selected && !unavailable && 'border-violet-200/25 bg-violet-200/[.06] text-violet-200',
                  companion && !selected && !unavailable && 'border-sky-200/20 text-sky-100')}>
                {unavailable ? <X className="size-5" /> : selected ? <Check className="size-5" /> : accessible ? <Accessibility className="size-5" /> : premium ? <Crown className="size-5" /> : companion ? <Users className="size-5" /> : <Armchair className="size-5" />}
                <span className="text-[9px] leading-3 sm:text-[8px]">{row}{number}</span>
              </Button>;
            })}
          </div><span className="w-3 text-center text-[11px] text-zinc-500">{row}</span>
        </div>)}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-3 border-t border-white/[.06] pt-5 text-[11px] text-zinc-400">
      <span className="flex items-center gap-2"><Armchair className="size-4" />Disponible</span>
      <span className="flex items-center gap-2"><Check className="size-4 rounded bg-sky-200 p-0.5 text-slate-950" />Tu selección</span>
      <span className="flex items-center gap-2"><X className="size-4 text-zinc-600" />No disponible</span>
      <span className="flex items-center gap-2"><Accessibility className="size-4 text-sky-200" />Accesible</span>
      {seats.some((seat) => seat.type === SeatType.COMPANION) && <span className="flex items-center gap-2"><Users className="size-4 text-sky-100" />Acompañante</span>}
      {seats.some((seat) => seat.type === SeatType.PREMIUM) && <span className="flex items-center gap-2"><Crown className="size-4 text-violet-200" />Premium</span>}
    </div>
  </div>;
}

import { Armchair } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLUMNS = Array.from({ length: 10 }, (_, index) => index + 1);
const UNAVAILABLE = new Set(['A2', 'A3', 'B7', 'B8', 'C2', 'D5', 'D6', 'E1', 'E9', 'F4']);

export function SeatPicker({ selectedSeats, onChange }: { selectedSeats: string[]; onChange: (seats: string[]) => void }) {
  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) onChange(selectedSeats.filter((item) => item !== seat));
    else if (selectedSeats.length < 6) onChange([...selectedSeats, seat]);
  };

  return (
    <div>
      <div className="mx-auto mb-10 max-w-xl">
        <div className="h-2 rounded-[50%] bg-gradient-to-r from-transparent via-sky-100 to-transparent shadow-[0_8px_28px_rgba(186,230,253,.45)]" />
        <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[.35em] text-zinc-600">Pantalla</p>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="mx-auto grid min-w-[520px] max-w-2xl gap-2.5">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-center text-xs font-semibold text-zinc-600">{row}</span>
              <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
                {COLUMNS.map((column) => {
                  const seat = `${row}${column}`;
                  const unavailable = UNAVAILABLE.has(seat);
                  const selected = selectedSeats.includes(seat);
                  return (
                    <Button
                      key={seat}
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={unavailable}
                      aria-label={`Butaca ${seat}${unavailable ? ', no disponible' : selected ? ', seleccionada' : ''}`}
                      aria-pressed={selected}
                      onClick={() => toggleSeat(seat)}
                      className={cn(
                        'h-9 w-full rounded-lg border p-0',
                        unavailable && 'border-transparent bg-white/[.025] text-zinc-800',
                        !unavailable && !selected && 'border-white/10 bg-white/[.045] text-zinc-500 hover:border-sky-200/35 hover:bg-sky-200/10 hover:text-sky-100',
                        selected && 'border-sky-100 bg-gradient-to-b from-sky-100 to-sky-300 text-zinc-950 shadow-[0_0_22px_rgba(186,230,253,.28)] hover:bg-sky-100',
                      )}
                    >
                      <Armchair className="size-4" />
                    </Button>
                  );
                })}
              </div>
              <span className="text-center text-xs font-semibold text-zinc-600">{row}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-zinc-500">
        <Legend className="border-white/10 bg-white/[.045]" label="Disponible" />
        <Legend className="border-sky-100 bg-sky-200" label="Seleccionada" />
        <Legend className="border-transparent bg-white/[.025]" label="No disponible" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={cn('size-4 rounded border', className)} />{label}</span>;
}

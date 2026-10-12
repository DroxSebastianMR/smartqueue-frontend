import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="SmartQueue, ir al inicio">
      <span className="relative grid size-10 rotate-[-6deg] place-items-center rounded-[14px] bg-[#e40046] text-white shadow-[0_10px_24px_rgba(228,0,70,.3)]">
        <Ticket className="size-5 rotate-[6deg]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <b className="block text-xl font-black tracking-[-.04em] text-white">smartqueue</b>
          <small className="mt-1 block text-[8px] font-bold uppercase tracking-[.24em] text-sky-200/70">ML cinema lab</small>
        </span>
      )}
    </Link>
  );
}

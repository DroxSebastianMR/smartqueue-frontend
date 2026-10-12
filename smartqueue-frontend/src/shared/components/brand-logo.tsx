import { Link } from 'react-router-dom';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Cinetrux, ir al inicio">
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[0_0_28px_rgba(125,190,255,.12)] backdrop-blur-md">
        <span className="h-4 w-4 rotate-45 rounded-[4px] border border-white/80 bg-gradient-to-br from-white via-sky-200 to-zinc-500 shadow-[0_0_14px_rgba(186,230,253,.6)]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <b className="block text-xl font-semibold tracking-[.08em] text-white">CINETRUX</b>
          <small className="mt-1 block text-[7px] font-medium uppercase tracking-[.38em] text-zinc-400">Cinema intelligence</small>
        </span>
      )}
    </Link>
  );
}

import { Clock3, Info, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MovieCardView } from '@/features/home/types/home.types';
import { PATHS } from '@/app/router/constants/paths';

export function MovieCard({ movie, compact = false }: { movie: MovieCardView; compact?: boolean }) {
  const navigate = useNavigate();
  const openDetail = () => navigate(PATHS.MOVIE(movie.id));
  return (
    <article className="group h-full min-w-0 cursor-pointer" onClick={openDetail} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openDetail(); }} role="link" tabIndex={0} aria-label={`Ver información de ${movie.title}`}>
      <Card className="flex h-full flex-col overflow-hidden rounded-[22px] border-white/[.09] bg-[#111318] shadow-[0_22px_50px_rgba(0,0,0,.28)] transition duration-500 group-hover:-translate-y-1 group-hover:border-sky-200/25 group-hover:shadow-[0_26px_70px_rgba(63,119,150,.12)]">
        <div className={`relative aspect-[2/3] overflow-hidden ${compact ? 'min-h-[360px]' : ''}`}>
          <img src={movie.poster} alt={`Arte promocional de ${movie.title}`} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.035]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/15" />
          {movie.releaseTag && <Badge className="absolute left-3 top-3 border-white/15 bg-black/60 text-white backdrop-blur-md">{movie.releaseTag}</Badge>}
          <div className="absolute inset-x-4 bottom-4 flex translate-y-3 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Button variant="outline" size="icon" className="shrink-0 rounded-full bg-black/55 backdrop-blur" onClick={(event) => { event.stopPropagation(); openDetail(); }} aria-label={`Ver detalles de ${movie.title}`}><Info className="size-4" /></Button>
            <Button className="w-full rounded-full px-3 py-2" onClick={(event) => { event.stopPropagation(); openDetail(); }}><Ticket className="size-3.5" />{movie.bookable ? 'Ver funciones' : 'Ver información'}</Button>
          </div>
        </div>

        <div className="relative flex min-h-[156px] flex-1 flex-col overflow-hidden border-t border-white/[.06] bg-[linear-gradient(145deg,#171a20,#0e1014)] p-5">
          <div className="pointer-events-none absolute -right-10 -top-14 size-28 rounded-full bg-sky-300/[.07] blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-zinc-100">{movie.title}</h3>
            <span className="shrink-0 rounded-lg border border-white/10 bg-white/[.08] px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200">{movie.rating}</span>
          </div>
          <p className="relative mt-2 truncate text-sm text-zinc-500">{movie.genre}</p>
          <div className="relative mt-auto flex items-center gap-3 pt-5 text-xs font-medium text-zinc-500"><span className="rounded-md border border-sky-200/10 bg-sky-200/[.05] px-2 py-1 text-sky-100/70">{movie.format ?? '2D'}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {movie.duration}</span></div>
        </div>
      </Card>
    </article>
  );
}

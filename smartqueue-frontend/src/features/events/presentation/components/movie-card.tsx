import { Clock3, Info, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Movie } from '@/features/events/models/movie.model';

export function MovieCard({ movie, compact = false }: { movie: Movie; compact?: boolean }) {
  const navigate = useNavigate();
  return (
    <article className="group min-w-0">
      <Card className={`relative overflow-hidden border-white/[.08] bg-zinc-900 ${compact ? 'aspect-[5/7]' : 'aspect-[2/3]'} shadow-[0_22px_50px_rgba(0,0,0,.28)] transition duration-500 group-hover:-translate-y-1 group-hover:border-sky-200/25`}>
        <img src={movie.poster} alt={`Arte promocional de ${movie.title}`} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className={`absolute inset-0 bg-gradient-to-t ${movie.palette} opacity-45 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10" />
        {movie.releaseTag && <Badge className="absolute left-3 top-3 border-white/15 bg-black/55 text-white backdrop-blur-md">{movie.releaseTag}</Badge>}
        <span className="absolute right-3 top-3 rounded-lg bg-black/55 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-100 backdrop-blur-md">{movie.rating}</span>
        <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex gap-2"><Button className="flex-1 rounded-full px-3 py-2" onClick={() => navigate('/purchase')}><Ticket className="size-3.5" /> Comprar</Button><Button variant="outline" size="icon" className="rounded-full bg-black/40" aria-label={`Ver detalles de ${movie.title}`}><Info className="size-4" /></Button></div>
        </div>
      </Card>
      <h3 className="mt-4 truncate text-lg font-semibold text-zinc-100">{movie.title}</h3>
      <p className="mt-1 truncate text-sm text-zinc-500">{movie.genre}</p>
      <div className="mt-2 flex gap-3 text-xs font-medium text-zinc-600"><span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {movie.duration}</span></div>
    </article>
  );
}

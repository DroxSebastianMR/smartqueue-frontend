import { Clock3, Info, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Movie } from '@/features/events/models/movie.model';

export function MovieCard({ movie }: { movie: Movie }) {
  const navigate = useNavigate();
  return (
    <article className="group min-w-0">
      <div className={`relative aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-br ${movie.palette} shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl`}>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_25%,rgba(255,255,255,.15)_50%,transparent_75%)] opacity-0 transition group-hover:opacity-100" />
        {movie.releaseTag && <Badge className="absolute left-3 top-3 border-white/15 bg-[#e40046] text-white">{movie.releaseTag}</Badge>}
        <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-center text-white"><Ticket className="mx-auto mb-4 size-8 opacity-70" /><h3 className="text-3xl font-black uppercase leading-[.9] tracking-[-.05em]">{movie.title}</h3></div>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Button className="flex-1 rounded-full bg-[#e40046] px-3 py-2" onClick={() => navigate('/queue')}><Ticket className="size-3.5" /> Comprar</Button><Button variant="outline" size="icon" className="rounded-full bg-white/10" aria-label="Ver detalles"><Info className="size-4" /></Button></div>
      </div>
      <h3 className="mt-4 truncate text-lg font-extrabold text-[#092d50]">{movie.title}</h3><p className="mt-1 truncate text-sm text-slate-500">{movie.genre}</p><div className="mt-2 flex gap-3 text-xs font-semibold text-slate-400"><span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {movie.duration}</span><span>{movie.rating}</span></div>
    </article>
  );
}

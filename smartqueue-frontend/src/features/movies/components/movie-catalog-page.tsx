import { CalendarDays, ChevronLeft, ChevronRight, Check, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MovieCard } from '@/features/home/components/movie-card';
import type { MovieCardView, PaginatedMovieCards } from '@/features/home/types/home.types';

type MovieCatalogPageProps = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  countLabel: string;
  pendingLabel: string;
  emptyLabel: string;
  pageSize: number;
  getPage: (page: number, limit: number) => { data?: PaginatedMovieCards; isPending: boolean; isError: boolean };
};

export function MovieCatalogPage({
  eyebrow,
  title,
  titleAccent,
  description,
  countLabel,
  pendingLabel,
  emptyLabel,
  pageSize,
  getPage,
}: MovieCatalogPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const { data, isPending, isError } = getPage(page, pageSize);
  const movies = data?.items ?? [];
  const availableGenres = useMemo(
    () => [...new Set(movies.flatMap((movie) => movie.genre.split(' · ')).filter(Boolean))].sort(),
    [movies],
  );
  const filtered = useMemo(() => filterMovies(movies, search, genres), [genres, movies, search]);
  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / pageSize));

  useEffect(() => { setPage(1); }, [genres, search]);

  const toggle = (genre: string) => setGenres((current) => current.includes(genre)
    ? current.filter((item) => item !== genre)
    : [...current, genre]);
  const move = (nextPage: number) => setPage(Math.min(Math.max(1, nextPage), totalPages));

  return (
    <div className="min-h-screen bg-[#080a0e] pt-28 text-white">
      <section className="relative overflow-hidden border-b border-white/[.08] px-5 py-16 sm:px-8 lg:px-10">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-sky-300/[.08] blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-indigo-400/[.07] blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.28em] text-sky-200"><Sparkles className="size-4" /> {eyebrow}</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em] sm:text-7xl">{title}<br /><span className="text-sky-200">{titleAccent}</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">{description}</p>
          <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-zinc-300"><CalendarDays className="size-4 text-sky-200" />{data?.meta.total ?? 0} {countLabel}</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[.25em] text-sky-200">Explora la cartelera</p><h2 className="mt-3 text-3xl font-semibold">Encuentra tu próxima función</h2></div>
          <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sky-200" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en esta página" className="h-11 w-full rounded-xl border border-white/10 bg-white/[.035] pl-11 pr-4 text-sm outline-none focus:border-sky-200/50" /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setGenres([])} className={`rounded-full border px-3 py-1.5 text-sm ${!genres.length ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300'}`}>Todas</button>{availableGenres.map((genre) => <button key={genre} type="button" onClick={() => toggle(genre)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${genres.includes(genre) ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300'}`}>{genres.includes(genre) && <Check className="size-3" />}{genre}</button>)}</div>
        {isPending && <p role="status" className="mt-10 text-sm text-zinc-400">{pendingLabel}</p>}
        {isError && <p role="alert" className="mt-10 text-sm text-zinc-400">No pudimos cargar esta cartelera.</p>}
        {!isPending && !isError && filtered.length === 0 && <p className="mt-10 text-sm text-zinc-400">{emptyLabel}</p>}
        {!isPending && !isError && filtered.length > 0 && <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{filtered.map((movie) => <MovieCard key={movie.id} movie={movie} dense />)}</div>}
        {!isPending && totalPages > 1 && <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginación de cartelera"><Button variant="outline" size="icon" className="rounded-full" disabled={page === 1} onClick={() => move(page - 1)} aria-label="Página anterior"><ChevronLeft className="size-4" /></Button><span className="min-w-24 text-center text-sm text-zinc-400">Página {page} de {totalPages}</span><Button variant="outline" size="icon" className="rounded-full" disabled={page === totalPages} onClick={() => move(page + 1)} aria-label="Página siguiente"><ChevronRight className="size-4" /></Button></nav>}
      </section>
    </div>
  );
}

function filterMovies(movies: MovieCardView[], search: string, genres: string[]) {
  const term = search.trim().toLocaleLowerCase('es-PE');
  return movies.filter((movie) => (!term || movie.title.toLocaleLowerCase('es-PE').includes(term))
    && (!genres.length || genres.some((genre) => movie.genre.split(' · ').includes(genre))));
}

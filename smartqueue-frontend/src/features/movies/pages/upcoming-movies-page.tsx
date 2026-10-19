import { CalendarDays, Check, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MovieCard } from '@/features/home/components/movie-card';
import { useUpcomingMovies } from '@/features/home/hooks/use-home-content';

export function UpcomingMoviesPage() {
  const { data: movies = [], isPending, isError } = useUpcomingMovies();
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = useMemo(() => [...new Set(movies.flatMap((movie) => movie.genre.split(' · ')).filter(Boolean))].sort(), [movies]);
  const filteredMovies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-PE');
    return movies.filter((movie) => {
      const movieGenres = movie.genre.split(' · ');
      const matchesSearch = !term || movie.title.toLocaleLowerCase('es-PE').includes(term);
      const matchesGenres = selectedGenres.length === 0 || selectedGenres.some((item) => movieGenres.includes(item));
      return matchesSearch && matchesGenres;
    });
  }, [movies, search, selectedGenres]);
  const toggleGenre = (value: string) => setSelectedGenres((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const featured = movies[0];

  return (
    <div className="min-h-screen overflow-hidden bg-[#080a0e] text-white [font-family:'Barlow_Condensed',Inter,sans-serif]">
      <section className="relative min-h-[470px] border-b border-white/[.07] px-5 pb-16 pt-36 sm:px-8 lg:px-14">
        {featured && <img src={featured.poster} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-[center_28%] opacity-20 blur-[2px]" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#080a0e_5%,rgba(8,10,14,.93)_43%,rgba(8,10,14,.58)_70%,#080a0e_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(93,205,244,.14),transparent_31%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.28em] text-sky-300"><Sparkles className="size-4" /> Muy pronto en Cinetrux</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold uppercase leading-[.95] tracking-[-.025em] sm:text-6xl lg:text-7xl">Próximos<br /><span className="text-sky-300">estrenos</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-7 text-zinc-300">Descubre las historias que llegarán próximamente a nuestras pantallas y consulta toda la información de cada película.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2"><CalendarDays className="size-4 text-sky-300" /> {movies.length} estrenos anunciados</span>
            <span className="rounded-full border border-white/10 bg-white/[.05] px-4 py-2">Cartelera en constante actualización</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-8">
        <div className="flex flex-col gap-7 border-b border-white/10 pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-sky-300">Agenda tu próxima visita</p>
            <h2 className="mt-3 text-4xl font-bold uppercase tracking-[-.02em] sm:text-5xl">Películas por llegar</h2>
          </div>
          <div className="w-full lg:max-w-[360px]">
            <label className="relative block">
              <span className="sr-only">Buscar película</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sky-300" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar película" className="h-12 w-full rounded-xl border border-white/10 bg-[#11141a] pl-11 pr-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300/50" />
            </label>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[.09] bg-[linear-gradient(135deg,#11151b,#0c0f14)] p-4 shadow-[0_18px_50px_rgba(0,0,0,.18)] sm:p-5">
          <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-sky-300/[.06] blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <p className="flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-[.09em] text-zinc-100"><span className="flex size-8 items-center justify-center rounded-lg border border-sky-300/15 bg-sky-300/[.08]"><SlidersHorizontal className="size-4 text-sky-300" /></span> Filtrar por categoría</p>
              <p className="mt-1.5 text-[13px] text-zinc-500">Combina una o varias categorías para encontrar tu próxima película.</p>
            </div>
            <span className="relative rounded-full border border-white/[.08] bg-black/20 px-3 py-1.5 text-xs font-medium text-zinc-400">{filteredMovies.length} {filteredMovies.length === 1 ? 'película' : 'películas'}</span>
          </div>
          <div className="relative flex flex-wrap gap-2" role="group" aria-label="Seleccionar una o varias categorías">
            <button type="button" onClick={() => setSelectedGenres([])} aria-pressed={selectedGenres.length === 0} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${selectedGenres.length === 0 ? 'border-sky-300/40 bg-sky-300 text-slate-950 shadow-[0_6px_18px_rgba(125,211,252,.12)]' : 'border-white/10 bg-white/[.035] text-zinc-400 hover:border-sky-300/25 hover:text-white'}`}>Todas</button>
            {genres.map((item) => {
              const selected = selectedGenres.includes(item);
              return <button key={item} type="button" onClick={() => toggleGenre(item)} aria-pressed={selected} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${selected ? 'border-sky-300/40 bg-sky-300 text-slate-950 shadow-[0_6px_18px_rgba(125,211,252,.12)]' : 'border-white/10 bg-white/[.035] text-zinc-300 hover:border-sky-300/25 hover:bg-white/[.06] hover:text-white'}`}>{selected && <Check className="size-3.5" />}{item}</button>;
            })}
          </div>
        </div>

        {isPending && <UpcomingSkeleton />}
        {isError && <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.03] p-8 text-zinc-400">No pudimos cargar los próximos estrenos. Inténtalo nuevamente más tarde.</div>}
        {!isPending && !isError && filteredMovies.length === 0 && <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.03] p-8 text-zinc-400">No encontramos películas con esos filtros.</div>}
        {!isPending && !isError && filteredMovies.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function UpcomingSkeleton() {
  return <div className="mt-10 grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[2/3] rounded-[22px] bg-white/[.06]" />)}</div>;
}

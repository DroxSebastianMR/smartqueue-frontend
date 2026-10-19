import { CalendarDays, Clapperboard, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useHomeCinemas, useHomeShowtimes, useNowPlayingMovies, useUpcomingMovies } from '@/features/home/hooks/use-home-content';
import { useHomeSelectionStore } from '@/features/home/store/home-selection.store';

const dates = Array.from({ length: 5 }, (_, index) => {
  const day = new Date(Date.now() + index * 86_400_000);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(day);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return {
    value: `${part('year')}-${part('month')}-${part('day')}`,
    label: index === 0 ? 'Hoy' : new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric', month: 'short' }).format(day),
  };
});

export function CinemaFinder() {
  const movieSlug = useHomeSelectionStore((state) => state.movieSlug);
  const city = useHomeSelectionStore((state) => state.city);
  const cinemaSlug = useHomeSelectionStore((state) => state.cinemaSlug);
  const date = useHomeSelectionStore((state) => state.date);
  const appliedFilters = useHomeSelectionStore((state) => state.appliedFilters);
  const setMovieSlug = useHomeSelectionStore((state) => state.setMovieSlug);
  const setCity = useHomeSelectionStore((state) => state.setCity);
  const setCinemaSlug = useHomeSelectionStore((state) => state.setCinemaSlug);
  const setDate = useHomeSelectionStore((state) => state.setDate);
  const applyFilters = useHomeSelectionStore((state) => state.applyFilters);

  const nowPlaying = useNowPlayingMovies();
  const upcoming = useUpcomingMovies();
  const cinemasQuery = useHomeCinemas();
  const cinemas = cinemasQuery.data ?? [];
  const availableCinemas = city ? cinemas.filter((cinema) => cinema.city === city) : cinemas;
  const cities = [...new Set(cinemas.map((cinema) => cinema.city))].sort();
  const movies = [...new Map([...(nowPlaying.data ?? []), ...(upcoming.data ?? []).filter((movie) => movie.bookable)].map((movie) => [movie.id, movie])).values()];
  const results = useHomeShowtimes(appliedFilters);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters();
  }

  return (
    <section id="cinema-finder" className="relative z-20 mx-auto max-w-7xl px-5 pt-7 lg:px-8 lg:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">Cartelera nacional</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl">Películas en cartelera</h2>
          <p className="mt-3 text-sm text-zinc-400">Selecciona tu cine y encuentra la función ideal.</p>
        </div>
      </div>
      <Card className="mt-8 border-white/[.08] bg-white/[.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,.32)] sm:p-5">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_auto] xl:items-end">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-zinc-500"><Clapperboard className="size-3.5 text-sky-200/70" />Película</span>
            <Select value={movieSlug} onChange={(event) => setMovieSlug(event.target.value)}><option value="">Todas las películas</option>{movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}</Select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-zinc-500"><MapPin className="size-3.5 text-sky-200/70" />Ciudad</span>
            <Select value={city} onChange={(event) => setCity(event.target.value)}><option value="">Todas las ciudades</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-zinc-500"><SlidersHorizontal className="size-3.5 text-sky-200/70" />Cine</span>
            <Select value={cinemaSlug} onChange={(event) => setCinemaSlug(event.target.value)}><option value="">Todos los cines</option>{availableCinemas.map((cinema) => <option key={cinema.slug} value={cinema.slug}>{cinema.name}</option>)}</Select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-zinc-500"><CalendarDays className="size-3.5 text-sky-200/70" />Fecha</span>
            <Select value={date} onChange={(event) => setDate(event.target.value)}><option value="">Cualquier fecha</option>{dates.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
          </label>
          <Button type="submit" className="h-12 rounded-xl px-7" disabled={cinemasQuery.isPending || nowPlaying.isPending}><Search className="size-4" />Buscar</Button>
        </form>
        {(cinemasQuery.isError || nowPlaying.isError || upcoming.isError) && <p role="alert" className="mt-3 text-sm text-amber-200">No pudimos cargar todas las opciones del buscador.</p>}
        {appliedFilters && (
          <div className="mt-5 border-t border-white/10 pt-5" aria-live="polite">
            {results.isPending && <p className="text-sm text-zinc-400">Buscando funciones…</p>}
            {results.isError && <p role="alert" className="text-sm text-amber-200">No pudimos consultar las funciones.</p>}
            {results.data?.length === 0 && <p className="text-sm text-zinc-400">No hay funciones para esta selección.</p>}
            {results.data && results.data.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {results.data.map((showtime) => {
                  const cinema = cinemas.find((item) => item.slug === showtime.cinemaSlug);
                  const movie = movies.find((item) => item.id === showtime.movieSlug);
                  const localTime = new Intl.DateTimeFormat('es-PE', { timeZone: cinema?.timeZone ?? 'America/Lima', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(showtime.startsAt));
                  return <Link to={`/purchase?showtimeId=${encodeURIComponent(showtime.id)}`} key={showtime.id} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-zinc-200 transition hover:border-sky-200/40 hover:bg-sky-200/10 focus-visible:outline focus-visible:outline-sky-200"><span className="font-semibold">{movie?.title ?? showtime.movieSlug}</span><span className="mx-2 text-zinc-500">·</span>{cinema?.name ?? showtime.cinemaSlug}<span className="mx-2 text-zinc-500">·</span>{localTime}<span className="ml-3 text-xs text-sky-200">Elegir butacas →</span></Link>;
                })}
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}

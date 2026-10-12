import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HOME_MOVIES } from '@/features/events/data/home.data';
import { MovieCard } from '@/features/events/presentation/components/movie-card';

export function MoviesSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-extrabold uppercase tracking-[.2em] text-[#e40046]">Cartelera simulada</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#092d50] sm:text-4xl">Películas</h2></div><div className="flex rounded-full bg-slate-100 p-1 text-sm font-bold"><button className="rounded-full bg-[#092d50] px-5 py-2.5 text-white">En cartelera</button><button className="px-5 py-2.5 text-slate-500">Preventa</button><button className="hidden px-5 py-2.5 text-slate-500 sm:block">Próximamente</button></div></div>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">{HOME_MOVIES.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
      <div className="mt-9 text-center"><Button variant="outline" className="rounded-full border-slate-200 bg-white text-[#092d50] hover:bg-slate-50">Ver más películas <ArrowRight className="size-4" /></Button></div>
    </section>
  );
}

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HOME_MOVIES } from '@/features/events/data/home.data';
import { MovieCard } from '@/features/events/presentation/components/movie-card';

export function MoviesSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">{HOME_MOVIES.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
      <div className="mt-10 text-center"><Button variant="outline" className="rounded-full border-white/10 bg-white/[.035] text-zinc-200 hover:bg-white/[.08]">Ver cartelera completa <ArrowRight className="size-4" /></Button></div>
    </section>
  );
}

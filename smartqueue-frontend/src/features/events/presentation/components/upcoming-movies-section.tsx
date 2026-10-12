import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { UPCOMING_MOVIES } from '@/features/events/data/home.data';
import { MovieCard } from '@/features/events/presentation/components/movie-card';

export function UpcomingMoviesSection() {
  return (
    <section className="border-y border-white/[.06] bg-[#0b0d11] py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">Lo que viene</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl">Próximos estrenos</h2></div>
          <Button variant="ghost" className="text-zinc-400">Explorar próximos <ArrowRight className="size-4" /></Button>
        </div>
        <Carousel ariaLabel="Próximos estrenos" interval={5000} itemClassName="w-[78%] sm:w-[43%] lg:w-[29%] xl:w-[23%]" className="mt-9">
          {UPCOMING_MOVIES.map((movie) => <MovieCard key={movie.id} movie={movie} compact />)}
        </Carousel>
      </div>
    </section>
  );
}

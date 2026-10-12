import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HOME_MOVIES } from '@/features/home/data/home.data';
import { MovieCard } from '@/features/home/components/movie-card';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/features/home/services/home.service';

export function MoviesSection() {
  const { data } = useQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: homeService.nowPlaying,
    retry: 1,
  });
  const movies = data ?? HOME_MOVIES;
  return (
    <section
      id="now-playing"
      className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8"
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button
          variant="outline"
          className="rounded-full border-white/10 bg-white/[.035] text-zinc-200 hover:bg-white/[.08]"
        >
          Ver cartelera completa <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

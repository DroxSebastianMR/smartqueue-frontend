import { Carousel } from '@/components/ui/carousel';
import { MovieCard } from '@/features/home/components/movie-card';
import { useNowPlayingMovies } from '@/features/home/hooks/use-home-content';

export function MoviesSection() {
  const { data: movies, isPending, isError } = useNowPlayingMovies();
  const carouselMovies = movies?.length
    ? Array.from({ length: Math.max(8, movies.length) }, (_, index) => movies[index % movies.length])
    : [];

  return (
    <section
      id="now-playing"
      className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8"
    >
      {isPending && <p role="status" className="text-sm text-zinc-400">Cargando cartelera…</p>}
      {isError && <p role="alert" className="text-sm text-zinc-400">No pudimos cargar la cartelera. Inténtalo de nuevo más tarde.</p>}
      {!isPending && !isError && movies.length === 0 && <p className="text-sm text-zinc-400">No hay películas en cartelera por ahora.</p>}
      {movies && movies.length > 0 && <Carousel ariaLabel="Películas en cartelera" interval={5000} itemClassName="w-[64%] sm:w-[36%] lg:w-[calc((100%-80px)/5)]" className="mt-2">
        {carouselMovies.map((movie, index) => <MovieCard key={`${movie.id}-${index}`} movie={movie} />)}
      </Carousel>}
    </section>
  );
}

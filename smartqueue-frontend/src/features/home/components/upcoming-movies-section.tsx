import { Carousel } from '@/components/ui/carousel';
import { MovieCard } from '@/features/home/components/movie-card';
import { useUpcomingMovies } from '@/features/home/hooks/use-home-content';

export function UpcomingMoviesSection() {
  const { data: movies, isPending, isError } = useUpcomingMovies();
  return (
    <section
      id="upcoming"
      className="border-y border-white/[.06] bg-[#0b0d11] py-20"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">
              Lo que viene
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl">
              Próximos estrenos
            </h2>
          </div>
        </div>
        {isPending && <p role="status" className="mt-8 text-sm text-zinc-400">Cargando próximos estrenos…</p>}
        {isError && <p role="alert" className="mt-8 text-sm text-zinc-400">No pudimos cargar los próximos estrenos.</p>}
        {!isPending && !isError && movies.length === 0 && <p className="mt-8 text-sm text-zinc-400">Aún no hay próximos estrenos.</p>}
        {movies && movies.length > 0 && (
        <Carousel
          ariaLabel="Próximos estrenos"
          interval={5000}
          itemClassName="w-[72%] sm:w-[42%] lg:w-[26%] xl:w-[20%]"
          className="mt-9"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} compact />
          ))}
        </Carousel>
        )}
      </div>
    </section>
  );
}

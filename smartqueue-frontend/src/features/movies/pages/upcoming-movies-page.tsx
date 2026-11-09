import { MovieCatalogPage } from '@/features/movies/components/movie-catalog-page';
import { useUpcomingMoviesPage } from '@/features/home/hooks/use-home-content';

export function UpcomingMoviesPage() {
  return <MovieCatalogPage eyebrow="Muy pronto en Cinetrux" title="Próximos" titleAccent="estrenos" description="Explora las historias que llegarán a nuestras pantallas y consulta la información de cada película." countLabel="estrenos anunciados" pendingLabel="Cargando próximos estrenos…" emptyLabel="No encontramos estrenos con estos filtros." pageSize={15} getPage={useUpcomingMoviesPage} />;
}

import { useNowPlayingMoviesPage } from '@/features/home/hooks/use-home-content';
import { MovieCatalogPage } from '@/features/movies/components/movie-catalog-page';

export function NowPlayingMoviesPage() {
  return <MovieCatalogPage eyebrow="Funciones disponibles" title="Cartelera" titleAccent="Cinetrux" description="Elige una película, revisa sus funciones disponibles y continúa hacia la selección de tus butacas." countLabel="películas en cartelera" pendingLabel="Cargando cartelera…" emptyLabel="No encontramos películas con estos filtros." pageSize={10} getPage={useNowPlayingMoviesPage} />;
}

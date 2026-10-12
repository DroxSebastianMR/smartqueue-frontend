import { CalendarDays, Play, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvengersDoomsdayLogo } from '@/features/home/components/avengers-doomsday-logo';
import { MovieFormat } from '@/features/home/enums/movie-format.enum';
import { MovieLanguage } from '@/features/home/enums/movie-language.enum';
import type { FeaturedMovie } from '@/features/home/models/featured-movie.model';

const LATIN_TRAILER_URL = 'https://www.youtube.com/watch?v=lAr_uspgHm8';

const FORMAT_LABELS: Record<MovieFormat, string> = {
  [MovieFormat.INFINITY_VISION]: 'Infinity Vision',
  [MovieFormat.THREE_D]: '3D',
  [MovieFormat.TWO_D]: '2D',
};

export function HeroContent({ backendConnected, featured }: { backendConnected: boolean; featured?: FeaturedMovie }) {
  const navigate = useNavigate();
  const releaseDate = featured?.releaseDate
    ? new Date(`${featured.releaseDate}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
    : '17 de diciembre';
  const formats = featured?.formats.map((format) => FORMAT_LABELS[format] ?? format) ?? ['Infinity Vision', '3D', '2D'];
  if (featured?.languages.includes(MovieLanguage.LATIN_SPANISH)) formats.push('Doblada');

  return (
    <div className="w-full max-w-[520px] text-white">
      <Badge className="border-emerald-100/15 bg-black/35 px-2.5 py-1 text-[9px] uppercase tracking-[.2em] text-zinc-100 backdrop-blur-md sm:text-[10px]">
        <Sparkles className="mr-1.5 size-3 text-emerald-200" /> {featured?.presale === false ? 'En cartelera' : 'Preventa abierta'}
      </Badge>

      <h1 id="featured-title" className="sr-only">{featured?.title ?? 'Avengers: Doomsday'}</h1>
      <div className="mt-3">{!featured || featured.movieId === 'avengers-doomsday' ? <AvengersDoomsdayLogo /> : <span className="text-4xl font-bold">{featured.title}</span>}</div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-zinc-200 sm:text-sm">
        <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-emerald-200" /> {releaseDate}</span>
        <span className="text-zinc-500">•</span><span>Solo en cines</span>
        <span className="rounded border border-white/25 px-1.5 py-0.5 text-xs">TBC</span>
      </div>

      <p className="mt-3 max-w-[480px] text-xs leading-5 text-zinc-200 sm:text-sm sm:leading-6">
        El destino de los héroes converge en el próximo gran evento de Marvel Studios. Asegura tu función anticipada en una experiencia diseñada para la pantalla grande.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-zinc-200 sm:gap-2 sm:text-[10px]">
        {formats.map((format) => <span key={format} className="rounded-full border border-white/10 bg-white/[.07] px-2.5 py-1 backdrop-blur-md sm:px-3 sm:py-1.5">{format}</span>)}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button className="h-11 rounded-full bg-zinc-100 px-5 text-sm text-zinc-950 shadow-[0_12px_34px_rgba(255,255,255,.16)] hover:bg-white sm:px-6" onClick={() => navigate('/purchase')}>
          <Ticket className="size-4" /> Comprar preventa
        </Button>
        <Button variant="outline" className="h-11 rounded-full border-white/20 bg-white/8 px-5 text-sm backdrop-blur-md hover:bg-white/14" onClick={() => window.open(LATIN_TRAILER_URL, '_blank', 'noopener,noreferrer')}>
          <Play className="size-4 fill-current" /> Ver avance
        </Button>
      </div>

      <p className="mt-4 hidden text-[10px] font-medium uppercase tracking-[.2em] text-zinc-500 sm:block">
        {backendConnected ? 'Disponibilidad conectada' : 'Contenido de demostración'}
      </p>
    </div>
  );
}

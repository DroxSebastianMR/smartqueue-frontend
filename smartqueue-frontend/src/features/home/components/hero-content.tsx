import { CalendarDays, Play, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovieProjectionFormat } from '@/features/home/enums/movie-projection-format.enum';
import type { FeaturedMovieView } from '@/features/home/types/home.types';
import { useHomeSelectionStore } from '@/features/home/store/home-selection.store';

const FORMAT_LABELS: Record<MovieProjectionFormat, string> = {
  [MovieProjectionFormat.INFINITY_VISION]: 'Infinity Vision',
  [MovieProjectionFormat.THREE_D]: '3D',
  [MovieProjectionFormat.TWO_D]: '2D',
};

interface HeroContentProps {
  featured?: FeaturedMovieView | null;
  loading: boolean;
  error: boolean;
}

export function HeroContent({ featured, loading, error }: HeroContentProps) {
  const navigate = useNavigate();
  const setMovieSlug = useHomeSelectionStore((state) => state.setMovieSlug);

  if (!featured) {
    return (
      <div className="max-w-md text-white" role={error ? 'alert' : 'status'}>
        <h1 id="featured-title" className="text-3xl font-semibold">
          {loading ? 'Cargando destacados…' : error ? 'No pudimos cargar el destacado' : 'Próximamente en Cinetrux'}
        </h1>
        {error && <p className="mt-3 text-zinc-400">Comprueba la conexión e inténtalo de nuevo.</p>}
      </div>
    );
  }

  const releaseDate = featured.releaseDate
    ? new Date(`${featured.releaseDate}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
    : null;
  const formats = featured.formats.map((format) => FORMAT_LABELS[format] ?? format);
  if (featured.hasLatinAudio) formats.push('Doblada');

  return (
    <div className="w-full max-w-[520px] text-white">
      <Badge className="border-emerald-100/15 bg-black/35 px-2.5 py-1 text-[9px] uppercase tracking-[.2em] text-zinc-100 backdrop-blur-md sm:text-[10px]">
        <Sparkles className="mr-1.5 size-3 text-emerald-200" />
        {featured.presale ? 'Preventa' : 'Destacado'}
      </Badge>
      <h1 id="featured-title" className="sr-only">{featured.title}</h1>
      <div className="mt-3">
        {featured.logoUrl ? (
          <img src={featured.logoUrl} alt={featured.title} className="h-auto w-full max-w-[78vw] object-contain object-left [filter:drop-shadow(0_12px_30px_rgba(0,0,0,.7))] sm:max-w-[360px] lg:max-w-[410px]" referrerPolicy="no-referrer" />
        ) : (
          <p className="text-4xl font-bold tracking-tight sm:text-5xl">{featured.title}</p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-zinc-200 sm:text-sm">
        {releaseDate && <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-emerald-200" />{releaseDate}</span>}
        {featured.ageRating && <span className="rounded border border-white/25 px-1.5 py-0.5 text-xs">{featured.ageRating}</span>}
      </div>
      {featured.synopsis && <p className="mt-3 max-w-[480px] text-xs leading-5 text-zinc-200 sm:text-sm sm:leading-6">{featured.synopsis}</p>}
      {formats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-zinc-200 sm:gap-2 sm:text-[10px]">
          {formats.map((format) => <span key={format} className="rounded-full border border-white/10 bg-white/[.07] px-2.5 py-1 backdrop-blur-md sm:px-3 sm:py-1.5">{format}</span>)}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button className="h-11 rounded-full bg-zinc-100 px-5 text-sm text-zinc-950 hover:bg-white sm:px-6" onClick={() => {
          if (featured.cta.href.startsWith('/#')) {
            setMovieSlug(featured.movieId);
            document.getElementById(featured.cta.href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
          } else navigate(featured.cta.href);
        }}>
          <Ticket className="size-4" />{featured.cta.label}
        </Button>
        {featured.media.type !== 'image' && (
          <Button variant="outline" className="h-11 rounded-full border-white/20 bg-white/8 px-5 text-sm backdrop-blur-md hover:bg-white/14" onClick={() => window.open(featured.media.src, '_blank', 'noopener,noreferrer')}>
            <Play className="size-4 fill-current" />Ver avance
          </Button>
        )}
      </div>
    </div>
  );
}

import { CalendarDays, Play, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvengersDoomsdayLogo } from '@/features/events/presentation/components/avengers-doomsday-logo';

const LATIN_TRAILER_URL = 'https://www.youtube.com/watch?v=lAr_uspgHm8';

export function HeroContent({ backendConnected }: { backendConnected: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[520px] text-white">
      <Badge className="border-emerald-100/15 bg-black/35 px-2.5 py-1 text-[9px] uppercase tracking-[.2em] text-zinc-100 backdrop-blur-md sm:text-[10px]">
        <Sparkles className="mr-1.5 size-3 text-emerald-200" /> Preventa abierta
      </Badge>

      <h1 id="featured-title" className="sr-only">Avengers: Doomsday</h1>
      <div className="mt-3"><AvengersDoomsdayLogo /></div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-zinc-200 sm:text-sm">
        <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-emerald-200" /> 17 de diciembre</span>
        <span className="text-zinc-500">•</span><span>Solo en cines</span>
        <span className="rounded border border-white/25 px-1.5 py-0.5 text-xs">TBC</span>
      </div>

      <p className="mt-3 max-w-[480px] text-xs leading-5 text-zinc-200 sm:text-sm sm:leading-6">
        El destino de los héroes converge en el próximo gran evento de Marvel Studios. Asegura tu función anticipada en una experiencia diseñada para la pantalla grande.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-zinc-200 sm:gap-2 sm:text-[10px]">
        {['Infinity Vision', '3D', '2D', 'Doblada'].map((format) => <span key={format} className="rounded-full border border-white/10 bg-white/[.07] px-2.5 py-1 backdrop-blur-md sm:px-3 sm:py-1.5">{format}</span>)}
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

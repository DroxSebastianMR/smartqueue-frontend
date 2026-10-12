import { CalendarDays, Play, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvengersDoomsdayLogo } from '@/features/events/presentation/components/avengers-doomsday-logo';

const LATIN_TRAILER_URL = 'https://www.youtube.com/watch?v=lAr_uspgHm8';

export function HeroContent({ backendConnected }: { backendConnected: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-[620px] text-white">
      <Badge className="border-emerald-100/15 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[.24em] text-zinc-100 backdrop-blur-md">
        <Sparkles className="mr-1.5 size-3 text-emerald-200" /> Preventa abierta
      </Badge>

      <h1 id="featured-title" className="sr-only">Avengers: Doomsday</h1>
      <div className="mt-4"><AvengersDoomsdayLogo /></div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-zinc-200">
        <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-emerald-200" /> 17 de diciembre</span>
        <span className="text-zinc-500">•</span><span>Solo en cines</span>
        <span className="rounded border border-white/25 px-1.5 py-0.5 text-xs">TBC</span>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-200 sm:text-base">
        El destino de los héroes converge en el próximo gran evento de Marvel Studios. Asegura tu función anticipada en una experiencia diseñada para la pantalla grande.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-zinc-200">
        {['Infinity Vision', '3D', '2D', 'Doblada'].map((format) => <span key={format} className="rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 backdrop-blur-md">{format}</span>)}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" className="rounded-full bg-zinc-100 px-7 text-zinc-950 shadow-[0_12px_34px_rgba(255,255,255,.16)] hover:bg-white" onClick={() => navigate('/purchase')}>
          <Ticket className="size-4" /> Comprar preventa
        </Button>
        <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/8 px-6 backdrop-blur-md hover:bg-white/14" onClick={() => window.open(LATIN_TRAILER_URL, '_blank', 'noopener,noreferrer')}>
          <Play className="size-4 fill-current" /> Ver avance
        </Button>
      </div>

      <p className="mt-5 text-[11px] font-medium uppercase tracking-[.2em] text-zinc-500">
        {backendConnected ? 'Disponibilidad conectada' : 'Contenido de demostración'}
      </p>
    </div>
  );
}

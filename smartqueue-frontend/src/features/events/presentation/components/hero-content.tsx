import { Info, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/features/events/domain/event';

export function HeroContent({ event, backendConnected }: { event?: Event; backendConnected: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl text-white">
      <Badge className="border-white/15 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[.24em] text-zinc-100 backdrop-blur-md">
        <Sparkles className="mr-1.5 size-3 text-sky-300" /> Cinetrux Premiere
      </Badge>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[.34em] text-zinc-300">Una experiencia original</p>
      <h1 id="featured-title" className="mt-3 font-serif text-6xl font-semibold leading-[.88] tracking-[-.055em] text-white sm:text-7xl lg:text-[7.5rem]">
        Horizonte
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-zinc-200">
        <span>2026</span><span className="text-zinc-500">•</span><span>2 h 12 min</span>
        <span className="rounded border border-white/25 px-1.5 py-0.5 text-xs">+13</span>
        <span className="text-zinc-400">Ciencia ficción · Drama</span>
      </div>

      <p className="mt-5 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
        {event?.description ?? 'Cuando el cielo deja de ser un límite, una tripulación descubre que el viaje más difícil es volver a casa.'}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" className="rounded-full bg-zinc-100 px-7 text-zinc-950 shadow-[0_12px_34px_rgba(255,255,255,.16)] hover:bg-white" onClick={() => navigate('/purchase')}>
          <Play className="size-4 fill-current" /> Comprar entradas
        </Button>
        <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/8 px-6 backdrop-blur-md hover:bg-white/14" onClick={() => navigate('/queue')}>
          <Info className="size-4" /> Más información
        </Button>
      </div>

      <p className="mt-5 text-[11px] font-medium uppercase tracking-[.2em] text-zinc-500">
        {backendConnected ? 'Disponibilidad conectada' : 'Contenido de demostración'}
      </p>
    </div>
  );
}

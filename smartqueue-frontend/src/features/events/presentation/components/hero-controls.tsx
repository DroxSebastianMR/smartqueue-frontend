import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function HeroControls({ muted, onToggleSound, showSoundControl = true }: { muted: boolean; onToggleSound: () => void; showSoundControl?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-7 z-20 mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-14">
      <div className="pointer-events-auto flex items-center gap-2" aria-label="Posición del contenido destacado">
        <span className="h-1.5 w-8 rounded-full bg-white" />
        <span className="size-1.5 rounded-full bg-white/35" />
        <span className="size-1.5 rounded-full bg-white/35" />
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {showSoundControl && <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-black/55" aria-label={muted ? 'Activar sonido a volumen moderado' : 'Silenciar video'} title={muted ? 'Activar sonido' : 'Silenciar'} onClick={onToggleSound}>{muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</Button>}
        <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md" aria-label="Contenido anterior" disabled><ChevronLeft className="size-5" /></Button>
        <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md" aria-label="Contenido siguiente" disabled><ChevronRight className="size-5" /></Button>
      </div>
    </div>
  );
}

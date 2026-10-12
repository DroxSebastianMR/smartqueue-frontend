import { Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HeroControlsProps {
  muted: boolean;
  onToggleSound: () => void;
  showSoundControl: boolean;
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function HeroControls({ muted, onToggleSound, showSoundControl, count, activeIndex, onSelect }: HeroControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 mx-auto flex max-w-[1600px] items-center justify-center px-5 sm:px-8 lg:px-14">
      {count > 0 && <div className="pointer-events-auto flex items-center gap-2" role="tablist" aria-label="Banners destacados">
        {Array.from({ length: count }, (_, index) => <button key={index} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Ver banner ${index + 1} de ${count}`} onClick={() => onSelect(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-9 bg-white' : 'w-2 bg-white/35 hover:bg-white/70'}`} />)}
      </div>}
      <div className="pointer-events-auto absolute right-5 sm:right-8 lg:right-14">
        {showSoundControl && <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md hover:bg-black/55" aria-label={muted ? 'Activar sonido a volumen moderado' : 'Silenciar video'} title={muted ? 'Activar sonido' : 'Silenciar'} onClick={onToggleSound}>{muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</Button>}
      </div>
    </div>
  );
}

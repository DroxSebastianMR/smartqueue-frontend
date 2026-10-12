import { Children, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  interval?: number;
  itemClassName?: string;
  className?: string;
};

export function Carousel({ children, ariaLabel, interval = 5000, itemClassName, className }: CarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const item = viewport?.children[index] as HTMLElement | undefined;
    if (!viewport || !item) return;
    viewport.scrollTo({ left: item.offsetLeft - viewport.offsetLeft, behavior: 'smooth' });
  }, []);

  const move = useCallback((direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  }, [items.length]);

  useEffect(() => scrollToIndex(activeIndex), [activeIndex, scrollToIndex]);

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => move(1), interval);
    return () => window.clearInterval(timer);
  }, [interval, items.length, move, paused]);

  useEffect(() => {
    const handleResize = () => scrollToIndex(activeIndex);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, scrollToIndex]);

  return (
    <div
      className={cn('relative', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div ref={viewportRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 lg:gap-5" style={{ scrollbarWidth: 'none' }}>
        {items.map((item, index) => (
          <div key={index} className={cn('shrink-0 snap-start', itemClassName)}>
            {item}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500" aria-live="polite">
          <span className="text-zinc-200">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="h-px w-10 bg-white/15" />
          <span>{String(items.length).padStart(2, '0')}</span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[.18em] text-zinc-600 sm:inline">Avanza cada 5 segundos</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" className="rounded-full bg-white/[.035]" aria-label="Película anterior" onClick={() => move(-1)}><ChevronLeft className="size-5" /></Button>
          <Button type="button" variant="outline" size="icon" className="rounded-full bg-white/[.035]" aria-label="Película siguiente" onClick={() => move(1)}><ChevronRight className="size-5" /></Button>
        </div>
      </div>
    </div>
  );
}

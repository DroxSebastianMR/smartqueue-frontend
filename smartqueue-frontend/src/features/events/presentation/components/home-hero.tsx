import { useState } from 'react';

import { Card } from '@/components/ui/card';
import type { Event } from '@/features/events/domain/event';
import { HeroContent } from '@/features/events/presentation/components/hero-content';
import { HeroControls } from '@/features/events/presentation/components/hero-controls';
import { HeroMedia } from '@/features/events/presentation/components/hero-media';

const FEATURED_MEDIA = {
  type: 'video' as const,
  src: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4',
  poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2400&q=88',
};

export function HomeHero({ event, backendConnected }: { event?: Event; backendConnected: boolean }) {
  const [muted, setMuted] = useState(true);

  return (
    <section aria-labelledby="featured-title" className="relative bg-[#08090c]">
      <Card className="relative min-h-[680px] overflow-hidden rounded-none border-0 bg-[#08090c] shadow-none sm:min-h-[760px] lg:min-h-[min(900px,100svh)]">
        <HeroMedia media={FEATURED_MEDIA} muted={muted} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,.98)_0%,rgba(5,7,11,.78)_34%,rgba(5,7,11,.18)_70%,rgba(5,7,11,.35)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#08090c_0%,rgba(8,9,12,.78)_13%,transparent_48%,rgba(8,9,12,.18)_100%)]" />
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_72%_35%,rgba(126,191,255,.28),transparent_28%)]" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1600px] items-end px-5 pb-20 pt-32 sm:min-h-[760px] sm:px-8 sm:pb-24 lg:min-h-[min(900px,100svh)] lg:px-14 lg:pb-28">
          <HeroContent event={event} backendConnected={backendConnected} />
        </div>

        <HeroControls muted={muted} onToggleSound={() => setMuted((value) => !value)} />
      </Card>
    </section>
  );
}

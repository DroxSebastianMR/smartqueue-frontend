import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { HeroContent } from '@/features/events/presentation/components/hero-content';
import { HeroControls } from '@/features/events/presentation/components/hero-controls';
import { HeroMedia, type HeroMediaSource } from '@/features/events/presentation/components/hero-media';

const FEATURED_MEDIA: HeroMediaSource = {
  type: 'youtube',
  src: 'https://www.youtube.com/watch?v=lAr_uspgHm8',
  poster: 'https://i.ytimg.com/vi/lAr_uspgHm8/maxresdefault.jpg',
};

export function HomeHero({ backendConnected }: { backendConnected: boolean }) {
  const [muted, setMuted] = useState(true);

  return (
    <section aria-labelledby="featured-title" className="relative bg-[#08090c]">
      <Card className="relative min-h-[620px] overflow-hidden rounded-none border-0 bg-[#08090c] shadow-none sm:min-h-[650px] lg:min-h-[700px]">
        <HeroMedia media={FEATURED_MEDIA} muted={muted} />
        <div className="absolute inset-x-0 top-0 z-[1] h-24 bg-[linear-gradient(180deg,#05070b_0%,#05070b_68%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,.99)_0%,rgba(5,7,11,.84)_34%,rgba(5,7,11,.2)_72%,rgba(5,7,11,.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#08090c_0%,rgba(8,9,12,.82)_14%,transparent_52%,rgba(8,9,12,.2)_100%)]" />
        <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_73%_38%,rgba(89,151,104,.24),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1600px] items-end px-5 pb-16 pt-28 sm:min-h-[650px] sm:px-8 sm:pb-20 lg:min-h-[700px] lg:px-14 lg:pb-20">
          <HeroContent backendConnected={backendConnected} />
        </div>

        <HeroControls muted={muted} onToggleSound={() => setMuted((value) => !value)} showSoundControl={FEATURED_MEDIA.type === 'video'} />
      </Card>
    </section>
  );
}

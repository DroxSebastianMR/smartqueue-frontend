import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useFeaturedMovie } from '@/features/home/hooks/use-featured-movie';
import {
  AdvertisementsSection,
  CinemaFinder,
  HomeHero,
  MoviesSection,
  SnackPromoSection,
  UpcomingMoviesSection,
} from '@/features/home/components';

export function HomePage() {
  const { data: featured, isPending, isError } = useFeaturedMovie();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    return () => window.cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <div className="bg-[#08090c]">
      <HomeHero featured={featured ?? []} loading={isPending} error={isError} />
      <div className="relative bg-[#08090c] before:pointer-events-none before:absolute before:inset-x-0 before:-top-32 before:h-32 before:bg-gradient-to-b before:from-transparent before:to-[#08090c]">
        <CinemaFinder />
        <MoviesSection />
      </div>
      <UpcomingMoviesSection />
      <AdvertisementsSection />
      <SnackPromoSection />
    </div>
  );
}

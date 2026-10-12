import { useFeaturedMovie } from '@/features/home/hooks/use-featured-movie';
import {
  AdvertisementsSection,
  CinemaFinder,
  HomeHero,
  MoviesSection,
  ProjectNotice,
  QueueExperienceSection,
  SnackPromoSection,
  UpcomingMoviesSection,
} from '@/features/home/components';

export function HomePage() {
  const { data: featured, isSuccess } = useFeaturedMovie();
  return (
    <div className="bg-[#08090c]">
      <HomeHero featured={featured} backendConnected={isSuccess} />
      <div className="relative bg-[#08090c] before:pointer-events-none before:absolute before:inset-x-0 before:-top-32 before:h-32 before:bg-gradient-to-b before:from-transparent before:to-[#08090c]">
        <CinemaFinder />
        <MoviesSection />
      </div>
      <UpcomingMoviesSection />
      <AdvertisementsSection />
      <SnackPromoSection />
      <QueueExperienceSection />
      <ProjectNotice />
    </div>
  );
}

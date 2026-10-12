import { useQuery } from '@tanstack/react-query';

import { GetFeaturedEventUseCase } from '@/features/events/application/get-featured-event.use-case';
import {
  CinemaFinder,
  HomeHero,
  MoviesSection,
  ProjectNotice,
  QueueExperienceSection,
  SnackPromoSection,
  UpcomingMoviesSection,
} from '@/features/events/presentation/components';

const getFeaturedEvent = new GetFeaturedEventUseCase();

export function EventPage() {
  const { isSuccess } = useQuery({ queryKey: ['featured-event'], queryFn: () => getFeaturedEvent.execute(), retry: 1 });
  return (
    <div className="bg-[#08090c]">
      <HomeHero backendConnected={isSuccess} />
      <div className="relative bg-[#08090c] before:pointer-events-none before:absolute before:inset-x-0 before:-top-32 before:h-32 before:bg-gradient-to-b before:from-transparent before:to-[#08090c]">
        <CinemaFinder />
        <MoviesSection />
      </div>
      <UpcomingMoviesSection />
      <SnackPromoSection />
      <QueueExperienceSection />
      <ProjectNotice />
    </div>
  );
}

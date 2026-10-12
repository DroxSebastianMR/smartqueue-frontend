import {
  CinemaFinder,
  HomeHero,
  MoviesSection,
  ProjectNotice,
  QueueExperienceSection,
} from '@/features/events/presentation/components';

const getFeaturedEvent = new GetFeaturedEventUseCase();

export function EventPage() {
  const { data: event, isSuccess } = useQuery({ queryKey: ['featured-event'], queryFn: () => getFeaturedEvent.execute(), retry: 1 });
  return (
    <div>
      <HomeHero event={event} backendConnected={isSuccess} />
      <CinemaFinder />
      <MoviesSection />
      <QueueExperienceSection />
      <ProjectNotice />
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';

import { GetFeaturedEventUseCase } from '@/features/events/application/get-featured-event.use-case';

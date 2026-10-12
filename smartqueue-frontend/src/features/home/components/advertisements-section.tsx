import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { homeService } from '@/features/home/services/home.service';

export function AdvertisementsSection() {
  const { data: advertisements } = useQuery({
    queryKey: ['advertisements'],
    queryFn: homeService.advertisements,
    retry: 1,
  });
  if (!advertisements?.length) return null;

  return (
    <section
      aria-labelledby="announcements-heading"
      className="bg-[#08090c] px-5 py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">
          Cinetrux
        </p>
        <h2
          id="announcements-heading"
          className="mt-2 text-2xl font-semibold text-white sm:text-3xl"
        >
          Novedades y anuncios
        </h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {advertisements.map((ad) => (
            <Card
              key={ad.id}
              className="flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl border-white/10 bg-[linear-gradient(145deg,#171c24,#0d0f13)] p-5 text-zinc-100"
            >
              <div>
                <h3 className="text-lg font-semibold leading-snug">
                  {ad.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {ad.description}
                </p>
              </div>
              <Link
                to={ad.cta.href}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sky-100 hover:text-white"
              >
                {ad.cta.label}
                <ArrowUpRight className="size-4" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

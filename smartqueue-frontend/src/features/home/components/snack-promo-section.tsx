import { ArrowRight, Popcorn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHomePromotions } from '@/features/home/hooks/use-home-content';

export function SnackPromoSection() {
  const navigate = useNavigate();
  const { data: promotions } = useHomePromotions();
  const promotion = promotions?.[0];
  if (!promotion) return null;
  return (
    <section id="promotions" className="bg-[#08090c] py-16">
      <Card className="relative isolate min-h-[480px] overflow-hidden rounded-none border-x-0 border-white/10 bg-[#11151b] shadow-none sm:min-h-[430px]">
        {promotion.imageUrl && <>
          <img src={promotion.imageUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0e1117_0%,rgba(14,17,23,.96)_26%,rgba(14,17,23,.7)_50%,rgba(14,17,23,.04)_100%)]" />
          <div className="absolute inset-0 bg-[#0e1117]/35 sm:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/50 via-transparent to-[#08090c]/10" />
        </>}
        <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[1600px] flex-col justify-center px-5 py-16 sm:min-h-[430px] sm:px-8 lg:px-14">
          <Badge className="w-fit border-sky-200/15 bg-sky-200/[.07] text-sky-100">
            <Sparkles className="mr-1.5 size-3.5" /> Experiencia Cinetrux
          </Badge>
          <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-white sm:text-5xl">
            {promotion.title}
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-zinc-400">
            {promotion.description}
          </p>
          <Button
            className="mt-8 w-fit rounded-full"
            size="lg"
            onClick={() => navigate(promotion.cta.href)}
          >
            {promotion.cta.label}{' '}
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {promotion.imageUrl && <div className="absolute bottom-8 right-8 z-10 hidden size-16 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-xl sm:grid"><Popcorn className="size-7" /></div>}
      </Card>
    </section>
  );
}

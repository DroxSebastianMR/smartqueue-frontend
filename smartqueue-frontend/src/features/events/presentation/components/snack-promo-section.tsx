import { ArrowRight, Popcorn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SnackPromoSection() {
  const navigate = useNavigate();
  return (
    <section className="bg-[#08090c] px-5 py-20 lg:px-8">
      <Card className="relative mx-auto grid max-w-7xl overflow-hidden border-white/10 bg-[#11151b] lg:min-h-[430px] lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <Badge className="w-fit border-sky-200/15 bg-sky-200/[.07] text-sky-100"><Sparkles className="mr-1.5 size-3.5" /> Experiencia Cinetrux</Badge>
          <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-white sm:text-5xl">Disfruta el estreno con tu combo Canchas.</h2>
          <p className="mt-5 max-w-lg leading-7 text-zinc-400">Agrega canchita, bebidas y snacks a tu compra. Una experiencia más simple, desde tu butaca.</p>
          <Button className="mt-8 w-fit rounded-full" size="lg" onClick={() => navigate('/purchase')}>Ver combos <ArrowRight className="size-4" /></Button>
        </div>
        <div className="relative min-h-[330px] overflow-hidden lg:min-h-full">
          <img src="https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=1400&q=88" alt="Canchita para disfrutar una película" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#11151b] via-[#11151b]/25 to-transparent lg:block" />
          <div className="absolute bottom-6 right-6 grid size-16 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-xl"><Popcorn className="size-7" /></div>
        </div>
      </Card>
    </section>
  );
}

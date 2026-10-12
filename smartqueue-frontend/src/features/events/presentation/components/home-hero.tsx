import { ArrowRight, BrainCircuit, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/features/events/domain/event';

export function HomeHero({ event, backendConnected }: { event?: Event; backendConnected: boolean }) {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
      <div className="relative min-h-[470px] overflow-hidden rounded-[28px] bg-[#071a32] text-white shadow-[0_24px_70px_rgba(3,18,40,.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(228,0,70,.6),transparent_26%),radial-gradient(circle_at_88%_20%,rgba(56,189,248,.25),transparent_20%)]" />
        <div className="absolute right-[-90px] top-[-130px] size-[520px] rotate-12 rounded-[80px] border-[46px] border-white/5" />
        <div className="absolute right-[10%] top-1/2 hidden h-[340px] w-[245px] -translate-y-1/2 rotate-3 rounded-[30px] border border-white/20 bg-gradient-to-br from-[#351024] via-[#a20835] to-[#071a32] shadow-2xl lg:block">
          <div className="absolute inset-5 rounded-[22px] border border-white/10" />
          <Ticket className="absolute left-1/2 top-12 size-12 -translate-x-1/2 text-pink-200" />
          <p className="absolute inset-x-6 top-28 text-center text-3xl font-black uppercase leading-none tracking-[-.05em]">Dooms<br />day</p>
          <p className="absolute inset-x-5 bottom-14 text-center text-[10px] font-bold uppercase tracking-[.28em] text-pink-200">Preventa especial</p>
        </div>
        <div className="relative z-10 flex min-h-[470px] max-w-3xl flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="flex flex-wrap items-center gap-2"><Badge className="w-fit border-pink-300/20 bg-pink-300/10 text-pink-100"><BrainCircuit className="mr-1.5 size-3.5" /> Cola predictiva activa</Badge><Badge className={backendConnected ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}>{backendConnected ? 'API conectada' : 'Vista de respaldo'}</Badge></div>
          <h1 className="mt-6 text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-7xl">La película empieza aquí. <span className="text-[#ff2d6c]">La fila no.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">{event?.description ?? 'Reserva tu turno para la preventa ficticia y observa cómo SmartQueue protege el proceso de compra sin alterar el orden de llegada.'}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" className="rounded-full bg-[#e40046] hover:bg-[#c9003d]" onClick={() => navigate('/queue')}>Entrar a la cola <ArrowRight className="size-4" /></Button><Button size="lg" variant="outline" className="rounded-full" onClick={() => navigate('/monitoring')}><ShieldCheck className="size-4" /> Ver laboratorio</Button></div>
        </div>
      </div>
    </section>
  );
}

import { Building2, ChevronRight, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHomeCinemas } from '@/features/home/hooks/use-home-content';

export function CinemasPage() {
  const cinemasQuery = useHomeCinemas();
  const [city, setCity] = useState('');
  const cinemas = cinemasQuery.data ?? [];
  const cities = useMemo(() => [...new Set(cinemas.map((cinema) => cinema.city))].sort(), [cinemas]);
  const visibleCinemas = city ? cinemas.filter((cinema) => cinema.city === city) : cinemas;

  return (
    <main className="min-h-screen bg-[#080a0e] pt-28 text-white">
      <section className="relative overflow-hidden border-b border-white/[.08] px-5 py-16 sm:px-8 lg:px-10"><div className="absolute -left-28 top-0 size-[30rem] rounded-full bg-sky-300/[.08] blur-3xl" /><div className="relative mx-auto max-w-7xl"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.28em] text-sky-200"><Sparkles className="size-4" /> Encuentra tu Cinetrux</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.05em] sm:text-7xl">Nuestras<br /><span className="text-sky-200">sedes.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">Ubica la sede más conveniente, revisa sus salas y continúa a la cartelera para elegir tu función.</p></div></section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-8"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-sky-200">Sedes disponibles</p><h2 className="mt-3 text-3xl font-semibold">Elige dónde ver tu película</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setCity('')} className={`rounded-full border px-4 py-2 text-sm ${!city ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300'}`}>Todas</button>{cities.map((item) => <button key={item} type="button" onClick={() => setCity(item)} className={`rounded-full border px-4 py-2 text-sm ${city === item ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300'}`}>{item}</button>)}</div></div>
        {cinemasQuery.isPending && <p className="mt-10 text-sm text-zinc-400">Cargando sedes…</p>}
        {cinemasQuery.isError && <p role="alert" className="mt-10 text-sm text-amber-200">No pudimos cargar las sedes.</p>}
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleCinemas.map((cinema) => <Card key={cinema.id} className="group flex min-h-64 flex-col rounded-[22px] border-white/[.09] bg-[linear-gradient(145deg,#111821,#0e1015)] p-6 transition hover:-translate-y-1 hover:border-sky-200/30"><div className="flex size-11 items-center justify-center rounded-xl border border-sky-200/15 bg-sky-200/[.08] text-sky-100"><Building2 className="size-5" /></div><h3 className="mt-8 text-xl font-semibold text-white">{cinema.name.replace('Demo ', '')}</h3><p className="mt-2 flex items-start gap-2 text-sm leading-6 text-zinc-400"><MapPin className="mt-1 size-4 shrink-0 text-sky-200" />{cinema.district ?? cinema.city} · {cinema.address}</p><div className="mt-auto pt-7"><Link to="/cartelera"><Button variant="outline" className="w-full rounded-xl">Ver cartelera <ChevronRight className="size-4" /></Button></Link></div></Card>)}</div>
        {!cinemasQuery.isPending && !visibleCinemas.length && <p className="mt-10 text-sm text-zinc-400">No hay sedes para esta ciudad.</p>}
        <div className="mt-12 flex items-center gap-3 rounded-2xl border border-sky-200/15 bg-sky-200/[.05] p-5 text-sm text-zinc-300"><Navigation className="size-5 shrink-0 text-sky-200" />La ubicación exacta es referencial mientras el proyecto opera con datos de demostración.</div>
      </section>
    </main>
  );
}

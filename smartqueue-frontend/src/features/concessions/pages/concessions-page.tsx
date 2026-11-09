import { ArrowRight, Popcorn, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { CONCESSION_CATEGORY_LABELS, ConcessionCategory } from '@/features/concessions/enums/concession-category.enum';
import { ConcessionCard } from '@/features/concessions/components/concession-card';
import { useConcessionsCatalog } from '@/features/concessions/hooks/use-concessions';

const categories = Object.values(ConcessionCategory);

export function ConcessionsPage() {
  const [category, setCategory] = useState<ConcessionCategory | undefined>();
  const catalog = useConcessionsCatalog(category);
  const featured = useMemo(() => catalog.data?.find((product) => product.featured) ?? catalog.data?.[0], [catalog.data]);

  return (
    <main className="min-h-screen bg-[#080a0e] pt-28 text-white">
      <section className="relative overflow-hidden border-b border-white/[.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(125,190,255,.18),transparent_32%),radial-gradient(circle_at_25%_100%,rgba(137,92,246,.13),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_.95fr] lg:items-center lg:px-10 lg:py-20">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.28em] text-sky-200"><Sparkles className="size-4" /> Dulcería Cinetrux</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em] sm:text-7xl">Tu función,<br /><span className="text-sky-200">mejor acompañada.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">Encuentra combos y snacks para completar la experiencia. Podrás agregarlos durante el proceso de compra de tus entradas.</p>
            <Link to="/cartelera"><Button className="mt-8 rounded-full px-6"><Popcorn className="size-4" /> Ver cartelera <ArrowRight className="size-4" /></Button></Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/10 bg-[#121720] shadow-2xl shadow-black/30 sm:min-h-[340px]">
            {featured?.imageUrl && <img src={featured.imageUrl} alt="Producto destacado de dulcería" className="absolute inset-0 size-full object-cover" referrerPolicy="no-referrer" />}
            <div className="absolute inset-0 bg-gradient-to-r from-[#11151e] via-[#11151e]/45 to-transparent" />
            <div className="absolute inset-x-7 bottom-7 max-w-xs"><p className="text-xs font-semibold uppercase tracking-[.22em] text-sky-100">Destacado de hoy</p><h2 className="mt-3 text-3xl font-semibold">{featured?.name ?? 'Combos para compartir'}</h2><p className="mt-2 text-sm text-zinc-300">{featured?.description ?? 'El complemento ideal para tu película.'}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-sky-200">Menú de dulcería</p><h2 className="mt-3 text-3xl font-semibold">Elige algo para tu función</h2></div><p className="text-sm text-zinc-500">Los productos se añadirán al resumen de compra.</p></div>
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}><button type="button" onClick={() => setCategory(undefined)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${!category ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300 hover:bg-white/[.06]'}`}>Todo el menú</button>{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${category === item ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 text-zinc-300 hover:bg-white/[.06]'}`}>{CONCESSION_CATEGORY_LABELS[item]}</button>)}</div>
        {catalog.isPending && <p className="mt-10 text-sm text-zinc-400">Cargando menú de dulcería…</p>}
        {catalog.isError && <p role="alert" className="mt-10 text-sm text-amber-200">No pudimos cargar el catálogo de dulcería.</p>}
        {catalog.data && <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{catalog.data.map((product) => <ConcessionCard key={product.id} product={product} />)}</div>}
      </section>
    </main>
  );
}

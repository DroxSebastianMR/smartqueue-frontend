import { Plus, Popcorn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONCESSION_CATEGORY_LABELS } from '@/features/concessions/enums/concession-category.enum';
import type { ConcessionProduct } from '@/features/concessions/types/concession.types';

export function ConcessionCard({ product }: { product: ConcessionProduct }) {
  const price = new Intl.NumberFormat('es-PE', { style: 'currency', currency: product.currency }).format(product.priceCents / 100);
  return (
    <article className="group h-full">
      <Card className="flex h-full flex-col overflow-hidden rounded-[22px] border-white/[.1] bg-[#111318] transition duration-300 group-hover:-translate-y-1 group-hover:border-sky-200/30">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sky-200/10 to-indigo-400/10">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="size-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" referrerPolicy="no-referrer" /> : <Popcorn className="absolute inset-0 m-auto size-12 text-sky-100/70" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111318]/60 via-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{CONCESSION_CATEGORY_LABELS[product.category]}</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h2 className="text-lg font-semibold text-white">{product.name}</h2>
          <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-400">{product.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3"><span className="text-lg font-semibold text-sky-100">{price}</span><Button className="rounded-full px-3" aria-label={`Agregar ${product.name} a la compra`}><Plus className="size-4" /> Agregar</Button></div>
        </div>
      </Card>
    </article>
  );
}

import { Archive, Clapperboard, FilePenLine, Film } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { adminStyles } from '@/features/admin/constants/admin-styles';
import type { MovieCatalogSection, MoviePublicationStatus } from '@/features/admin/types/admin-movie.types';

type AdminCatalogMetricsProps = { total: number; statusCounts: Record<MoviePublicationStatus, number>; sectionCounts: Record<MovieCatalogSection, number> };

export function AdminCatalogMetrics({ total, statusCounts, sectionCounts }: AdminCatalogMetricsProps) {
  const cards = [
    { label: 'Total en catálogo', value: total, detail: 'Películas registradas', icon: Clapperboard, tone: 'text-sky-300 bg-sky-400/10' },
    { label: 'En cartelera / estreno', value: statusCounts.PUBLISHED, detail: `${sectionCounts.NOW_PLAYING} en cartelera · ${sectionCounts.UPCOMING} próximos`, icon: Film, tone: 'text-emerald-300 bg-emerald-400/10' },
    { label: 'Borradores', value: statusCounts.DRAFT, detail: 'Pendientes de revisión', icon: FilePenLine, tone: 'text-amber-200 bg-amber-400/10' },
    { label: 'Archivadas', value: statusCounts.ARCHIVED, detail: 'Retiradas del catálogo', icon: Archive, tone: 'text-rose-300 bg-rose-400/10' },
  ];
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => {
    const Icon = card.icon;
    return <Card key={card.label} className="border-slate-800 bg-[#131923] p-5 shadow-none"><div className="flex items-start justify-between"><p className={adminStyles.technicalLabel}>{card.label}</p><span className={`grid size-10 place-items-center rounded-xl ${card.tone}`}><Icon className="size-5" /></span></div><p className="mt-5 font-mono text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p><p className="mt-2 text-xs text-slate-500">{card.detail}</p></Card>;
  })}</section>;
}

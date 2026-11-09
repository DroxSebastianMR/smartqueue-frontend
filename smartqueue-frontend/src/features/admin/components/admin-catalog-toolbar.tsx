import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { adminStyles } from '@/features/admin/constants/admin-styles';
import type { AdminCatalogFilter, MovieCatalogSection, MoviePublicationStatus } from '@/features/admin/types/admin-movie.types';

const tabs: { key: AdminCatalogFilter; label: string; status?: MoviePublicationStatus }[] = [
  { key: 'ALL', label: 'Todas' }, { key: 'NOW_PLAYING', label: 'En cartelera' }, { key: 'UPCOMING', label: 'Próximamente' },
  { key: 'DRAFT', label: 'Borradores', status: 'DRAFT' }, { key: 'ARCHIVED', label: 'Archivadas', status: 'ARCHIVED' },
];

type AdminCatalogToolbarProps = {
  filter: AdminCatalogFilter;
  search: string;
  total: number;
  statusCounts: Record<MoviePublicationStatus, number>;
  sectionCounts: Record<MovieCatalogSection, number>;
  onFilterChange: (filter: AdminCatalogFilter) => void;
  onSearchChange: (value: string) => void;
  format: string;
  ageRating: string;
  onFormatChange: (value: string) => void;
  onAgeRatingChange: (value: string) => void;
};

export function AdminCatalogToolbar({ filter, search, total, statusCounts, sectionCounts, onFilterChange, onSearchChange, format, ageRating, onFormatChange, onAgeRatingChange }: AdminCatalogToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const countFor = (tab: (typeof tabs)[number]) => tab.key === 'ALL' ? total : tab.status ? statusCounts[tab.status] : tab.key === 'NOW_PLAYING' || tab.key === 'UPCOMING' ? sectionCounts[tab.key] : undefined;
  return <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0c1424] p-3"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4"><label className="relative block min-w-0 lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por título o slug" className={`${adminStyles.field} mt-0 pl-10`} /><kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 xl:block">⌘K</kbd></label><div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-xl bg-[#080c14] p-1">{tabs.map((tab) => <button type="button" key={tab.key} onClick={() => onFilterChange(tab.key)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${filter === tab.key ? 'bg-[#1d2736] text-sky-200 shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}>{tab.label}{countFor(tab) !== undefined && <span className={`ml-1.5 font-mono ${filter === tab.key ? 'text-sky-300' : 'text-slate-500'}`}>{countFor(tab)}</span>}</button>)}</div><Button type="button" variant="outline" className="h-10 shrink-0 px-3 text-xs" onClick={() => setAdvancedOpen((current) => !current)}><SlidersHorizontal className="size-4" />Filtros</Button></div>{advancedOpen && <div className="grid gap-3 border-t border-slate-800 pt-3 sm:grid-cols-2 lg:max-w-2xl"><label className="text-xs text-slate-400">Formato<Select value={format} onChange={(event) => onFormatChange(event.target.value)} className="mt-1 h-10"><option value="">Todos los formatos</option><option value="TWO_D">2D</option><option value="THREE_D">3D</option><option value="INFINITY_VISION">Infinity Vision</option></Select></label><label className="text-xs text-slate-400">Clasificación<Select value={ageRating} onChange={(event) => onAgeRatingChange(event.target.value)} className="mt-1 h-10"><option value="">Todas las clasificaciones</option><option value="PG">PG</option><option value="PG-13">PG-13</option><option value="Apta para todos">Apta para todos</option></Select></label></div>}</div>;
}

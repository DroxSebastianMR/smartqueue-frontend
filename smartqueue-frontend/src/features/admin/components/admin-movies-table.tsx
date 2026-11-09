import { Eye, EyeOff, MoreHorizontal, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from '@/features/admin/components/admin-status-badge';
import { adminStyles } from '@/features/admin/constants/admin-styles';
import type { AdminMovie } from '@/features/admin/types/admin-movie.types';

type AdminMoviesTableProps = {
  movies: AdminMovie[];
  busySlug?: string;
  onPublish: (slug: string) => void;
  onUnpublish: (slug: string) => void;
};

const sectionLabels: Record<string, string> = {
  NOW_PLAYING: 'Cartelera',
  UPCOMING: 'Próximamente',
};

function dateLabel(value: string | null) {
  if (!value) return 'Por definir';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export function AdminMoviesTable({ movies, busySlug, onPublish, onUnpublish }: AdminMoviesTableProps) {
  if (!movies.length) return <div className="p-12 text-center"><p className="text-sm font-medium text-slate-200">No hay películas que coincidan con esta vista.</p><p className="mt-1 text-sm text-slate-500">Cambia los filtros o registra un nuevo borrador.</p></div>;

  return <div className="overflow-x-auto"><table className="min-w-[1120px] w-full text-left"><thead className="sticky top-0 z-10 border-b border-slate-800 bg-[#101722]"><tr>{['Película y metadatos', 'Estado de exhibición', 'Versiones y formatos', 'Lanzamiento', 'Material técnico', ''].map((label) => <th key={label} className={`px-5 py-4 ${adminStyles.technicalLabel}`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-800/90">{movies.map((movie, index) => <tr key={movie.slug} className={`${index % 2 ? 'bg-[#0a101a]' : 'bg-[#0c1420]'} transition hover:bg-[#131e36]`}><td className="w-[31%] px-5 py-4"><div className="flex items-start gap-3"><img className="h-[62px] w-11 rounded-md border border-white/10 object-cover" src={movie.posterUrl} alt={`Póster de ${movie.title}`} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-100">{movie.title}</p>{movie.ageRating && <span className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">{movie.ageRating}</span>}</div><p className="mt-1 line-clamp-1 text-xs text-slate-400">{movie.genres.length ? movie.genres.join(' · ') : 'Sin géneros registrados'}{movie.durationMinutes ? ` · ${movie.durationMinutes} min` : ''}</p><p className="mt-1 font-mono text-[10px] text-sky-300/85">:slug: {movie.slug}</p></div></div></td><td className="w-[16%] px-5 py-4"><AdminStatusBadge status={movie.publicationStatus} /><p className="mt-2 text-xs text-slate-400">{movie.sections.length ? movie.sections.map((section) => sectionLabels[section] ?? section).join(' · ') : 'Sin ubicación pública'}</p></td><td className="w-[17%] px-5 py-4"><div className="flex flex-wrap gap-1.5">{movie.versions.length ? movie.versions.slice(0, 3).map((version) => <span key={version.id} className="rounded bg-[#182233] px-2 py-1 font-mono text-[10px] text-sky-200">{version.format.replaceAll('_', ' ')} · {version.audioLanguage}</span>) : <span className="text-xs text-slate-500">Sin versiones</span>}</div><p className="mt-2 text-xs text-slate-500">{movie.versions.length} formato{movie.versions.length === 1 ? '' : 's'} configurado{movie.versions.length === 1 ? '' : 's'}</p></td><td className="w-[14%] px-5 py-4"><p className="font-mono text-xs text-slate-200">{dateLabel(movie.releaseDate)}</p><p className={`mt-1 text-xs ${movie.presale ? 'text-sky-300' : 'text-slate-500'}`}>{movie.presale ? 'Preventa habilitada' : 'Venta regular'}</p></td><td className="w-[15%] px-5 py-4"><div className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#111a28] px-2 py-1 font-mono text-[10px] text-slate-300"><PlayCircle className="size-3 text-sky-300" /> Póster registrado</div><p className="mt-2 text-xs text-slate-500">Añade fondos, logo y tráiler desde la ficha.</p></td><td className="w-12 px-4 py-4"><div className="flex items-center gap-1">{movie.publicationStatus === 'PUBLISHED' ? <Button aria-label={`Retirar ${movie.title}`} variant="ghost" className="size-8 p-0 text-amber-200 hover:bg-amber-400/10" disabled={busySlug === movie.slug} onClick={() => onUnpublish(movie.slug)}><EyeOff className="size-4" /></Button> : <Button aria-label={`Publicar ${movie.title}`} variant="ghost" className="size-8 p-0 text-emerald-200 hover:bg-emerald-400/10" disabled={busySlug === movie.slug || movie.publicationStatus === 'ARCHIVED'} onClick={() => onPublish(movie.slug)}><Eye className="size-4" /></Button>}<Button aria-label={`Más acciones para ${movie.title}`} variant="ghost" className="size-8 p-0 text-slate-400"><MoreHorizontal className="size-4" /></Button></div></td></tr>)}</tbody></table></div>;
}

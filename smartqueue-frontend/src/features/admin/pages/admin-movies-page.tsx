import { Download, Plus, RadioTower } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  AdminCatalogMetrics,
  AdminCatalogToolbar,
  AdminMovieForm,
  AdminMoviesTable,
  AdminPageHeader,
} from '@/features/admin/components';
import { adminStyles } from '@/features/admin/constants/admin-styles';
import { useAdminMovies } from '@/features/admin/hooks/use-admin-movies';
import type {
  AdminCatalogFilter,
  AdminMoviesQuery,
  CreateAdminMovieInput,
  MovieCatalogSection,
  MoviePublicationStatus,
} from '@/features/admin/types/admin-movie.types';

function statusFrom(filter: AdminCatalogFilter): MoviePublicationStatus | undefined {
  return ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(filter) ? filter as MoviePublicationStatus : undefined;
}

function sectionFrom(filter: AdminCatalogFilter): MovieCatalogSection | undefined {
  return filter === 'NOW_PLAYING' || filter === 'UPCOMING' ? filter : undefined;
}

function filterFrom(value: string | null): AdminCatalogFilter {
  return value === 'NOW_PLAYING' || value === 'UPCOMING' || value === 'DRAFT' || value === 'ARCHIVED' || value === 'PUBLISHED' ? value : 'ALL';
}

export function AdminMoviesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [format, setFormat] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const filter = filterFrom(params.get('view'));
  const query = useMemo<AdminMoviesQuery>(() => ({ page, search, status: statusFrom(filter), section: sectionFrom(filter) }), [page, search, filter]);
  const { movies, statusCounts, sectionCounts, create, publish, unpublish } = useAdminMovies(query);
  const meta = movies.data?.meta;
  const visibleMovies = (movies.data?.data ?? []).filter((movie) => (!format || movie.versions.some((version) => version.format === format)) && (!ageRating || movie.ageRating === ageRating));
  const busySlug = publish.variables ?? unpublish.variables;
  const total = meta?.total ?? statusCounts.PUBLISHED + statusCounts.DRAFT + statusCounts.ARCHIVED;

  const changeFilter = (next: AdminCatalogFilter) => { setParams(next === 'ALL' ? {} : { view: next }); setPage(1); };
  const changeSearch = (next: string) => { setSearch(next); setPage(1); };
  const save = async (input: CreateAdminMovieInput) => { await create.mutateAsync(input); setCreating(false); setParams({}); setPage(1); };
  const exportCatalog = () => {
    const rows = visibleMovies.map((movie) => [movie.title, movie.slug, movie.publicationStatus, movie.sections.join(' | '), movie.releaseDate ?? '', movie.versions.map((version) => version.format).join(' | ')]);
    const csv = [['Título', 'Slug', 'Estado', 'Ubicación', 'Estreno', 'Formatos'], ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    anchor.download = 'catalogo-cinetrux.csv';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return <div className={adminStyles.page}>
    <AdminPageHeader eyebrow="Consola de distribución" title="Gestión de catálogo y películas" description="Control centralizado de publicaciones, metadatos, formatos de exhibición y material audiovisual." actions={<div className="flex flex-wrap items-center gap-2"><Button variant="outline" className="h-10 px-3 text-xs" onClick={exportCatalog}><Download className="size-4" />Exportar CSV</Button><button type="button" onClick={() => setCreating(true)} className={adminStyles.actionButton}><Plus className="size-4" />Nueva película</button></div>} />
    <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-sky-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-sky-300">Catálogo CineTrux</span><span className="inline-flex items-center gap-1.5 rounded bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-emerald-300"><RadioTower className="size-3" />API conectada · /admin/movies</span></div>
    <AdminCatalogMetrics total={total} statusCounts={statusCounts} sectionCounts={sectionCounts} />
    <AdminCatalogToolbar filter={filter} search={search} total={total} statusCounts={statusCounts} sectionCounts={sectionCounts} onFilterChange={changeFilter} onSearchChange={changeSearch} format={format} ageRating={ageRating} onFormatChange={setFormat} onAgeRatingChange={setAgeRating} />
    {create.isError && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-100">No se pudo crear el borrador. Revisa los campos o la conexión con el backend.</p>}
    <section className={adminStyles.panel}><div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-100">Catálogo de distribución</h2><p className="mt-1 text-xs text-slate-500">Los cambios de publicación se reflejan en la cartelera pública después de invalidar la caché.</p></div><p className="font-mono text-xs text-slate-500">{meta ? `Mostrando ${meta.count} de ${meta.total}` : 'Cargando catálogo…'}</p></div>{movies.isPending ? <div className="p-10 text-center text-sm text-slate-400">Cargando películas registradas…</div> : movies.isError ? <div className="p-10 text-center text-sm text-rose-200">No se pudo cargar el catálogo administrativo.</div> : <><AdminMoviesTable movies={visibleMovies} busySlug={busySlug} onPublish={(slug) => publish.mutate(slug)} onUnpublish={(slug) => unpublish.mutate(slug)} /><footer className="flex items-center justify-between border-t border-slate-800 px-5 py-3"><p className="font-mono text-[11px] text-slate-500">Página {meta?.page ?? 1} de {meta?.totalPages ?? 1}</p><div className="flex gap-2"><Button variant="ghost" className="h-8 px-3 text-xs" disabled={!meta || meta.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</Button><Button variant="outline" className="h-8 px-3 text-xs" disabled={!meta?.hasNextPage} onClick={() => setPage((current) => current + 1)}>Siguiente</Button></div></footer></>}</section>
    {creating && <AdminMovieForm saving={create.isPending} onClose={() => setCreating(false)} onSubmit={save} />}
  </div>;
}

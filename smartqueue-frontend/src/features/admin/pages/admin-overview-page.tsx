import { Clapperboard, Film, LayoutDashboard, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/constants/paths';
import { AdminPageHeader, AdminStatCard } from '@/features/admin/components';
import { adminStyles } from '@/features/admin/constants/admin-styles';
import { useAdminMovies } from '@/features/admin/hooks/use-admin-movies';

export function AdminOverviewPage() {
  const { movies } = useAdminMovies();
  const items = movies.data?.data ?? [];
  const published = items.filter(movie => movie.publicationStatus === 'PUBLISHED').length;
  const drafts = items.filter(movie => movie.publicationStatus === 'DRAFT').length;
  return <div className={adminStyles.page}><AdminPageHeader eyebrow="Administración" title="Panel de administración" description="Gestiona el contenido que ve el público y consulta la operación del cine desde un espacio interno protegido." /><section className="grid gap-4 md:grid-cols-3"><AdminStatCard label="Películas publicadas" value={movies.isPending ? '—' : String(published)} detail="Visibles para clientes en la web." icon={<Film />} /><AdminStatCard label="Borradores" value={movies.isPending ? '—' : String(drafts)} detail="Contenido pendiente de completar o publicar." icon={<Clapperboard />} /><AdminStatCard label="Operación y ML" value="Activo" detail="Monitor de capacidad disponible para administradores." icon={<Workflow />} /></section><section className="grid gap-4 lg:grid-cols-2"><Link to={PATHS.ADMIN_MOVIES} className="rounded-2xl border border-sky-300/20 bg-sky-300/[.05] p-6 transition hover:border-sky-300/45 hover:bg-sky-300/[.09]"><Clapperboard className="size-6 text-sky-200" /><h2 className="mt-5 text-xl font-semibold text-white">Gestionar películas</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Registra borradores, edita información, agrega URLs de póster o fondo y publica cuando el contenido esté listo.</p><span className="mt-5 inline-flex text-sm font-semibold text-sky-200">Ir al catálogo administrativo →</span></Link><Link to={PATHS.MONITORING} className="rounded-2xl border border-slate-700/70 bg-[#0a121f]/90 p-6 transition hover:border-sky-300/35"><LayoutDashboard className="size-6 text-violet-200" /><h2 className="mt-5 text-xl font-semibold text-white">Operación y capacidad</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Revisa demanda de compra, cola, decisiones de capacidad y resultados del laboratorio ML.</p><span className="mt-5 inline-flex text-sm font-semibold text-sky-200">Abrir monitor operativo →</span></Link></section></div>;
}

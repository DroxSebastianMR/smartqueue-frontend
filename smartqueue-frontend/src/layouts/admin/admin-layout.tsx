import { ArrowLeft, BrainCircuit, LayoutDashboard, ListChecks, ShieldCheck, SlidersHorizontal, TicketCheck } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { BrandLogo } from '@/shared/components/brand-logo';
import { PATHS } from '@/app/router/constants/paths';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100 [background-image:radial-gradient(circle_at_0%_0%,rgba(14,116,144,.20),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(30,58,138,.22),transparent_30%)]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/8 bg-[#081321]/90 p-5 lg:flex lg:flex-col">
          <BrandLogo />
          <div className="mt-9">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Centro de operaciones</p>
            <nav className="mt-3 space-y-1">
              <SideLink icon={<LayoutDashboard />} label="Resumen operativo" to={PATHS.MONITORING} end />
              <SideLink icon={<TicketCheck />} label="Operación de entradas" to={PATHS.MONITORING_ANALYTICS} />
              <SideLink icon={<BrainCircuit />} label="Saturación y capacidad" to={PATHS.MONITORING_SATURATION} />
              <SideLink icon={<ListChecks />} label="Decisiones registradas" to={PATHS.MONITORING_DECISIONS} />
            </nav>
          </div>
          <div className="mt-8">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Laboratorio ML</p>
            <nav className="mt-3 space-y-1">
              <SideLink icon={<SlidersHorizontal />} label="Experimentos ML" to={PATHS.MONITORING_EXPERIMENTS} />
            </nav>
          </div>
          <div className="mt-auto rounded-2xl border border-emerald-300/15 bg-emerald-300/[.06] p-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><ShieldCheck className="size-4" /> Laboratorio activo</span>
            <p className="mt-2 text-xs leading-5 text-slate-400">Entorno aislado para registrar pruebas y decisiones del controlador.</p>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-[#091525]/90 backdrop-blur-xl">
            <div className="flex h-[72px] items-center gap-4 px-5 lg:px-8">
              <div className="lg:hidden"><BrandLogo compact /></div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-white"><BrainCircuit className="size-4 text-sky-300" /> Monitor CineTrux</p>
                <p className="hidden text-xs text-slate-400 sm:block">Consola de saturación y capacidad operativa</p>
              </div>
              <span className="ml-auto hidden items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 md:flex"><ShieldCheck className="size-3.5" /> Laboratorio</span>
              <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-200/40 hover:bg-sky-200/10 hover:text-white"><ArrowLeft className="size-4" /> <span className="hidden sm:inline">Volver a Cinetrux</span></Link>
            </div>
          </header>
          <main><Outlet /></main>
          <footer className="border-t border-sky-300/10 bg-[#06101c]/80"><div className="flex flex-col gap-1 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>Monitor CineTrux · Monitoreo experimental</span><span>Datos de laboratorio · entorno académico</span></div></footer>
        </div>
      </div>
    </div>
  );
}

function SideLink({ icon, label, to, end = false }: { icon: React.ReactNode; label: string; to: string; end?: boolean }) {
  return <NavLink end={end} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-sky-400/10 font-semibold text-sky-100 shadow-[inset_2px_0_0_#38bdf8]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><span className="[&>svg]:size-4">{icon}</span>{label}</NavLink>;
}

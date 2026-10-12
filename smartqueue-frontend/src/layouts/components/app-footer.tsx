import { ArrowUpRight, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '@/shared/components/brand-logo';

const cinemaLinks = [
  { label: 'Cartelera', to: '/#now-playing' },
  { label: 'Próximos estrenos', to: '/#upcoming' },
  { label: 'Sedes y funciones', to: '/#cinema-finder' },
  { label: 'Promociones', to: '/#promotions' },
];

const accountLinks = [
  { label: 'Iniciar sesión', to: '/login' },
  { label: 'Crear cuenta · SocioTrux', to: '/register' },
  { label: 'Mi cola', to: '/queue' },
];

export function AppFooter() {
  return (
    <footer className="border-t border-white/[.08] bg-[#0d1015] text-zinc-400">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-14 pt-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:px-14">
        <div>
          <BrandLogo />
          <p className="mt-6 max-w-xs text-sm leading-7 text-zinc-400">El cine empieza aquí. Explora historias, descubre funciones y prepara tu próxima visita.</p>
          <p className="mt-5 text-xs leading-5 text-zinc-600">Proyecto académico en desarrollo. La cartelera y las compras aún no representan una operación comercial.</p>
        </div>
        <FooterGroup title="Explora" links={cinemaLinks} />
        <FooterGroup title="Tu cuenta" links={accountLinks} />
        <div>
          <h2 className="text-sm font-semibold text-white">Tu próxima función</h2>
          <p className="mt-5 text-sm leading-7 text-zinc-400">Encuentra un cine, filtra los horarios disponibles y elige cómo disfrutar la pantalla grande.</p>
          <Link to="/#cinema-finder" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[.06]"><MapPin className="size-4" /> Explorar sedes <ArrowUpRight className="size-3.5" /></Link>
        </div>
      </div>
      <div className="border-t border-white/[.08]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-zinc-600 sm:px-8 lg:px-14">
          <span>© {new Date().getFullYear()} Cinetrux</span>
          <span className="inline-flex items-center gap-2"><Ticket className="size-3.5" /> Una experiencia pensada para el cine</span>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-5 space-y-3.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm transition hover:text-white">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Github, Instagram, Youtube } from 'lucide-react';

import { BrandLogo } from '@/shared/components/brand-logo';

export function AppFooter() {
  return (
    <footer className="bg-[#061426] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)] lg:px-8">
        <div><BrandLogo /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">Prototipo académico de colas virtuales para una venta cinematográfica simulada. Sin pagos ni integración comercial real.</p></div>
        <FooterGroup title="Experiencia" links={['Películas', 'Mi cola', 'Compra simulada']} />
        <FooterGroup title="Proyecto" links={['Laboratorio ML', 'Arquitectura', 'Métricas']} />
        <div><p className="font-bold text-white">Síguenos</p><div className="mt-4 flex gap-2"><SocialIcon label="GitHub"><Github /></SocialIcon><SocialIcon label="Instagram"><Instagram /></SocialIcon><SocialIcon label="YouTube"><Youtube /></SocialIcon></div></div>
      </div>
      <div className="border-t border-white/8"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-slate-500 lg:px-8"><span>SmartQueue ML · 2026</span><span>Demostración universitaria · Datos sintéticos</span></div></div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[] }) { return <div><p className="font-bold text-white">{title}</p><ul className="mt-4 space-y-3 text-sm text-slate-400">{links.map((link) => <li key={link}><a href="#" className="hover:text-white">{link}</a></li>)}</ul></div>; }
function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) { return <button type="button" aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/8 transition hover:bg-[#e40046] [&>svg]:size-4">{children}</button>; }

import { CircleHelp, Menu, Search, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/shared/components/brand-logo';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Películas' },
  { to: '/queue', label: 'Mi cola' },
  { to: '/purchase', label: 'Compra' },
  { to: '/monitoring', label: 'Laboratorio ML' },
];

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-[#071a32] text-white shadow-lg shadow-slate-950/10">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-8 px-5 lg:px-8">
        <BrandLogo />
        <nav className="hidden h-full items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('relative flex h-full items-center text-sm font-semibold text-slate-300 transition hover:text-white', isActive && 'text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t-full after:bg-[#e40046]')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Button variant="ghost" className="text-slate-300 hover:bg-white/10"><UserRound className="size-4" /> Únete</Button>
          <Button variant="ghost" className="text-slate-300 hover:bg-white/10"><CircleHelp className="size-4" /> Ayuda</Button>
          <Button variant="ghost" size="icon" aria-label="Buscar"><Search className="size-5" /></Button>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" aria-label="Abrir menú" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
      {mobileOpen && (
        <nav className="border-t border-white/10 px-5 py-4 lg:hidden">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/8">{item.label}</NavLink>)}
        </nav>
      )}
    </header>
  );
}

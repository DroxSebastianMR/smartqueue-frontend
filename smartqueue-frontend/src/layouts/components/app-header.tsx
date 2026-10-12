import { Menu, Search, Ticket, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/shared/components/brand-logo';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/queue', label: 'Cartelera' },
  { to: '/monitoring', label: 'Experiencia ML' },
];

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-40 text-white">
      <div className="mx-auto flex h-[88px] max-w-[1600px] items-center gap-10 px-5 sm:px-8 lg:px-14">
        <BrandLogo />
        <nav className="hidden h-full items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('relative flex h-full items-center text-sm font-medium text-zinc-400 transition hover:text-white', isActive && 'text-white after:absolute after:inset-x-0 after:bottom-5 after:h-px after:bg-white')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Buscar"><Search className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Mi cuenta"><UserRound className="size-5" /></Button>
          <NavLink to="/purchase"><Button className="ml-2 rounded-full bg-white px-5 text-zinc-950 hover:bg-zinc-200"><Ticket className="size-4" /> Comprar</Button></NavLink>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" aria-label="Abrir menú" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
      {mobileOpen && (
        <nav className="mx-5 rounded-2xl border border-white/10 bg-zinc-950/90 px-3 py-3 shadow-2xl backdrop-blur-xl lg:hidden">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/8">{item.label}</NavLink>)}
          <NavLink to="/purchase" onClick={() => setMobileOpen(false)} className="mt-2 block"><Button className="w-full rounded-xl bg-white text-zinc-950 hover:bg-zinc-200">Comprar entradas</Button></NavLink>
        </nav>
      )}
    </header>
  );
}

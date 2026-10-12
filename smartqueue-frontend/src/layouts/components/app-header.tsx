import { LogOut, Menu, Search, Ticket, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/shared/components/brand-logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/auth/use-auth';
import { PATHS } from '@/app/router/constants/paths';
import { UserRole } from '@/features/auth/enums/user-role.enum';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/#now-playing', label: 'Cartelera' },
  { to: '/#upcoming', label: 'Próximos estrenos' },
  { to: '/#cinema-finder', label: 'Sedes' },
  { to: PATHS.AUTH.REGISTER, label: 'SocioTrux' },
  { to: '/monitoring', label: 'Experiencia ML', adminOnly: true },
];

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || user?.role === UserRole.ADMIN);
  const handleAccount = () => { if (isAuthenticated) { logout(); navigate(PATHS.HOME); } else navigate(PATHS.AUTH.LOGIN); setMobileOpen(false); };
  return (
    <header className="absolute inset-x-0 top-0 z-40 text-white">
      <div className="mx-auto flex h-[88px] max-w-[1600px] items-center gap-6 px-5 sm:px-8 lg:px-14">
        <BrandLogo />
        <nav className="hidden h-full items-center gap-6 xl:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => { if (location.pathname === '/' && item.to.startsWith('/#')) document.getElementById(item.to.slice(2))?.scrollIntoView({ behavior: 'smooth' }); }}
              className={cn('relative flex h-full items-center whitespace-nowrap text-sm font-medium text-zinc-400 transition hover:text-white', location.pathname + location.hash === item.to && 'text-white after:absolute after:inset-x-0 after:bottom-5 after:h-px after:bg-white')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Buscar funciones" onClick={() => { navigate('/#cinema-finder'); document.getElementById('cinema-finder')?.scrollIntoView({ behavior: 'smooth' }); }}><Search className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label={isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'} onClick={handleAccount}>{isAuthenticated ? <LogOut className="size-5" /> : <UserRound className="size-5" />}</Button>
          <Link to="/purchase"><Button className="ml-2 rounded-full bg-white px-5 text-zinc-950 hover:bg-zinc-200"><Ticket className="size-4" /> Comprar</Button></Link>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto xl:hidden" aria-label="Abrir menú" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
      {mobileOpen && (
        <nav className="mx-5 rounded-2xl border border-white/10 bg-zinc-950/90 px-3 py-3 shadow-2xl backdrop-blur-xl xl:hidden">
          {visibleNavItems.map((item) => <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/8">{item.label}</Link>)}
          <Button variant="ghost" onClick={handleAccount} className="mt-1 w-full justify-start rounded-xl text-zinc-200">{isAuthenticated ? <LogOut className="size-4" /> : <UserRound className="size-4" />}{isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'}</Button>
          <Link to="/purchase" onClick={() => setMobileOpen(false)} className="mt-2 block"><Button className="w-full rounded-xl bg-white text-zinc-950 hover:bg-zinc-200">Comprar entradas</Button></Link>
        </nav>
      )}
    </header>
  );
}

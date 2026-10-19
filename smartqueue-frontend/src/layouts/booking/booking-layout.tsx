import { Link, Outlet } from 'react-router-dom';
import { Ticket, X } from 'lucide-react';
import { AppFooter } from '@/layouts/components/app-footer';

export function BookingLayout() {
  return <div className="flex min-h-screen flex-col bg-[#08090c] text-white">
    <header className="border-b border-white/[.07] bg-[#0d1015]/80">
      <div className="mx-auto grid h-20 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <span className="text-xs font-semibold tracking-[.2em] text-zinc-400 sm:text-sm">CINETRUX</span>
        <div className="flex items-center gap-2 text-sm font-medium"><Ticket className="size-4 text-sky-200" /><span>Tu compra</span></div>
        <Link to="/#cinema-finder" aria-label="Salir de la compra y ver funciones" className="justify-self-end rounded-xl border border-white/10 p-3 text-zinc-400 transition hover:bg-white/5 hover:text-white"><X className="size-4" /></Link>
      </div>
    </header>
    <main className="flex-1"><Outlet /></main>
    <AppFooter compact />
  </div>;
}

import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/constants/paths';
import { Card } from '@/components/ui/card';

export function ForbiddenPage() {
  return <div className="min-h-screen bg-[#08090c] px-5 pb-20 pt-36 text-white"><Card className="mx-auto max-w-lg p-8 text-center"><ShieldAlert className="mx-auto size-9 text-sky-100" /><h1 className="mt-5 text-2xl font-semibold">Acceso restringido</h1><p className="mt-3 text-zinc-400">Esta sección es solo para administradores de Cinetrux.</p><Link to={PATHS.HOME} className="mt-7 inline-flex rounded-xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-white">Volver al inicio</Link></Card></div>;
}

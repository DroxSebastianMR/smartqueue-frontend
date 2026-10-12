import { LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/constants/paths';
import { AuthPageContainer } from '@/features/auth/components/auth-page-container';
import { LoginForm } from '@/features/auth/forms/login-form';

export function LoginPage() {
  return <AuthPageContainer>
    <div className="mb-7 flex size-11 items-center justify-center rounded-xl bg-sky-100/10 text-sky-100"><LockKeyhole className="size-5" /></div>
    <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
    <p className="mt-2 text-sm text-zinc-400">Accede a tu experiencia Cinetrux.</p>
    <LoginForm />
    {import.meta.env.DEV && <div className="mt-6 space-y-1 text-xs leading-5 text-zinc-500"><p>Cliente demo: demo@cinetrux.test / CinetruxDemo2026!</p><p>Admin demo: admin@cinetrux.test / CinetruxAdmin2026!</p></div>}
    <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm text-sky-100/80"><Link to={PATHS.HOME} className="hover:text-white">Volver al inicio</Link><Link to={PATHS.AUTH.REGISTER} className="hover:text-white">Crear cuenta</Link></div>
  </AuthPageContainer>;
}

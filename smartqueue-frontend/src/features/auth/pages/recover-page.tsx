import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/constants/paths';
import { AuthPageContainer } from '@/features/auth/components/auth-page-container';

export function RecoverPage() {
  return <AuthPageContainer>
    <Mail className="size-8 text-sky-100" />
    <h2 className="mt-6 text-2xl font-semibold">Recuperar acceso</h2>
    <p className="mt-3 text-sm leading-6 text-zinc-400">La recuperación estará disponible cuando habilitemos cuentas persistentes. Por ahora, utiliza el acceso demo local; no se enviarán correos desde esta pantalla.</p>
    <Link to={PATHS.AUTH.LOGIN} className="mt-8 inline-block text-sm text-sky-100 hover:text-white">Volver a iniciar sesión</Link>
  </AuthPageContainer>;
}

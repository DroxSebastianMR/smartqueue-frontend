import { UserRoundPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/constants/paths';
import { AuthPageContainer } from '@/features/auth/components/auth-page-container';

export function RegisterPage() {
  return <AuthPageContainer>
    <UserRoundPlus className="size-8 text-sky-100" />
    <h2 className="mt-6 text-2xl font-semibold">Crear cuenta</h2>
    <p className="mt-3 text-sm leading-6 text-zinc-400">El registro se habilitará junto con la persistencia de usuarios. Por ahora, puedes explorar la portada y utilizar la cuenta demo para probar la compra simulada.</p>
    <Link to={PATHS.AUTH.LOGIN} className="mt-8 inline-block text-sm text-sky-100 hover:text-white">Ir a iniciar sesión</Link>
  </AuthPageContainer>;
}

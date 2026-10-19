import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth';
import { PATHS } from '@/app/router/constants/paths';

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const destination = from?.startsWith('/') && !from.startsWith('//') ? from : PATHS.HOME;
  if (isLoading) return <div className="min-h-screen bg-[#08090c]" aria-label="Validando sesión" />;
  return isAuthenticated ? <Navigate to={destination} replace /> : <Outlet />;
}

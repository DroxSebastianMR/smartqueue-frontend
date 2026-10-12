import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth';
import { PATHS } from '@/app/router/constants/paths';

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#08090c]" aria-label="Validando sesión" />;
  return isAuthenticated ? <Navigate to={PATHS.HOME} replace /> : <Outlet />;
}

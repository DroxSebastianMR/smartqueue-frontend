import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth';
import { PATHS } from '@/app/router/constants/paths';
import type { UserRole } from '@/features/auth/enums/user-role.enum';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="min-h-screen bg-[#08090c]" aria-label="Validando sesión" />;
  if (!isAuthenticated) return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location.pathname + location.search }} replace />;
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to={PATHS.FORBIDDEN} replace />;
  return <Outlet />;
}

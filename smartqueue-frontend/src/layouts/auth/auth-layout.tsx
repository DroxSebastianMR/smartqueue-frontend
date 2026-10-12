import { Outlet, useLocation } from 'react-router-dom';
import { BrandLogo } from '@/shared/components/brand-logo';
import { AuthHero } from '@/features/auth/components/auth-hero';
import { getAuthHero } from '@/features/auth/constants/auth-hero';

export function AuthLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(141,197,229,.15),transparent_36%),#08090c] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl"><BrandLogo /></div>
      <main className="mx-auto grid min-h-[calc(100vh-100px)] max-w-6xl items-center py-10 lg:grid-cols-2 lg:gap-20"><AuthHero {...getAuthHero(pathname)} /><Outlet /></main>
    </div>
  );
}

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppFooter, AppHeader } from '@/layouts/components';

export function SiteShell() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-950">
      <AppHeader />
      <main><Outlet /></main>
      <AppFooter />
    </div>
  );
}


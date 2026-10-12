import { Outlet } from 'react-router-dom';

import { AppFooter, AppHeader } from '@/layouts/components';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#08090c] text-slate-950">
      <AppHeader />
      <main><Outlet /></main>
      <AppFooter />
    </div>
  );
}


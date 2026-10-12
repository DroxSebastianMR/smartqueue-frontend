import type { RouteObject } from 'react-router-dom';
import { PATHS } from '@/app/router/constants/paths';
import { ProtectedRoute } from '@/app/router/guards/protected-route';
import { MonitoringPage } from '@/features/monitoring/pages/monitoring-page';
import { PurchasePage } from '@/features/purchase/pages/purchase-page';
import { QueuePage } from '@/features/queue/pages/queue-page';
import { BookingLayout } from '@/layouts/booking/booking-layout';
import { AdminLayout } from '@/layouts/admin/admin-layout';
import { UserRole } from '@/features/auth/enums/user-role.enum';

export const protectedRoutes: RouteObject[] = [
  { element: <ProtectedRoute />, children: [
    { element: <BookingLayout />, children: [
      { path: PATHS.QUEUE, element: <QueuePage /> },
      { path: PATHS.PURCHASE, element: <PurchasePage /> },
    ] },
  ] },
  { element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />, children: [
    { element: <AdminLayout />, children: [
      { path: PATHS.MONITORING, element: <MonitoringPage /> },
    ] },
  ] },
];

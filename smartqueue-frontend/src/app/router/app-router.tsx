import { createBrowserRouter, Navigate } from 'react-router-dom';

import { EventPage } from '@/features/events/presentation/pages/event-page';
import { MonitoringPage } from '@/features/monitoring/presentation/pages/monitoring-page';
import { PurchasePage } from '@/features/purchase/presentation/pages/purchase-page';
import { QueuePage } from '@/features/queue/presentation/pages/queue-page';
import { AppLayout } from '@/layouts/app-layout';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <EventPage /> },
      { path: '/queue', element: <QueuePage /> },
      { path: '/purchase', element: <PurchasePage /> },
      { path: '/monitoring', element: <MonitoringPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);


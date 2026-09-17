'use client';

import { Suspense } from 'react';
import AdminPlanMarketingPanel from '@/components/admin/AdminPlanMarketingPanel';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function AdminPlanMarketingPage() {
  return (
    <Suspense fallback={<RouteLoadingMascot label="Cargando plan de marketing…" variant={5} />}>
      <AdminPlanMarketingPanel />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import AdminPlanMarketingPanel from '@/components/admin/AdminPlanMarketingPanel';
import MarketingShell from '@/components/marketing/MarketingShell';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function AdminMarketingPromocionesPage() {
  return (
    <MarketingShell title="Promociones">
      <Suspense fallback={<RouteLoadingMascot label="Cargando promociones…" variant={5} />}>
        <AdminPlanMarketingPanel embedded />
      </Suspense>
    </MarketingShell>
  );
}

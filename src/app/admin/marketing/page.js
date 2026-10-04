'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingDashboardPage() {
  return (
    <MarketingShell title="Marketing" subtitle="Visitas, cuentas, embudo e ingreso de las suscripciones activas.">
      <MarketingOperationsPanel section="dashboard" />
    </MarketingShell>
  );
}

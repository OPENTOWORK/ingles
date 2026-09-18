'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingDashboardPage() {
  return (
    <MarketingShell
      title="Marketing"
      subtitle="Dashboard de adquisición, journey y atribución (Fase 1)."
    >
      <MarketingPlaceholder
        moduleName="Dashboard Marketing"
        description="métricas agregadas de visitantes, leads y conversiones"
      />
    </MarketingShell>
  );
}

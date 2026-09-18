'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingRoiPage() {
  return (
    <MarketingShell title="ROI" subtitle="Revenue, costes, CAC, ROAS y atribución.">
      <MarketingPlaceholder
        moduleName="ROI"
        description="CAC, CPL, CPA, ROAS (cálculos en fases posteriores)"
      />
    </MarketingShell>
  );
}

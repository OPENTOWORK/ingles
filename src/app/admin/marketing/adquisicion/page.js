'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingAdquisicionPage() {
  return (
    <MarketingShell title="Adquisición" subtitle="De qué canal llegan y cuántos registros deja cada uno.">
      <MarketingOperationsPanel section="acquisition" />
    </MarketingShell>
  );
}

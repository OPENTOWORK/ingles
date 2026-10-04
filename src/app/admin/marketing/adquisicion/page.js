'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingAdquisicionPage() {
  return (
    <MarketingShell title="Adquisición" subtitle="Fuentes de las últimas visitas y cuántas acaban en cuenta o en pago.">
      <MarketingOperationsPanel section="acquisition" />
    </MarketingShell>
  );
}

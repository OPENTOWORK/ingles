'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingRoiPage() {
  return (
    <MarketingShell title="ROI" subtitle="Ingreso de las suscripciones activas.">
      <MarketingOperationsPanel section="roi" />
    </MarketingShell>
  );
}

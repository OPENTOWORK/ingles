'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingCustomerJourneyPage() {
  return (
    <MarketingShell title="Customer Journey" subtitle="Recorrido reciente de cada visita.">
      <MarketingOperationsPanel section="journey" />
    </MarketingShell>
  );
}

'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingCustomerJourneyPage() {
  return (
    <MarketingShell title="Customer Journey" subtitle="Recorrido de cada visita. Elige el mes para ver el histórico.">
      <MarketingOperationsPanel section="journey" />
    </MarketingShell>
  );
}

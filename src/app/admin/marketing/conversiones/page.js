'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingConversionesPage() {
  return (
    <MarketingShell title="Conversiones" subtitle="Leads, clientes y eventos clave.">
      <MarketingPlaceholder moduleName="Conversiones" description="embudo y tasas de conversión" />
    </MarketingShell>
  );
}

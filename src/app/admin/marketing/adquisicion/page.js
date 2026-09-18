'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingAdquisicionPage() {
  return (
    <MarketingShell title="Adquisición" subtitle="Fuentes, medios y UTMs por periodo.">
      <MarketingPlaceholder moduleName="Adquisición" description="canales y campañas de entrada" />
    </MarketingShell>
  );
}

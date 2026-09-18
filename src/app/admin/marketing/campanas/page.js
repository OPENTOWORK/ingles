'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingCampanasPage() {
  return (
    <MarketingShell title="Campañas" subtitle="Campañas multi-plataforma y costes.">
      <MarketingPlaceholder moduleName="Campañas" description="Google Ads, Meta, LinkedIn, email, etc." />
    </MarketingShell>
  );
}

'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingAudiencePanel from '@/components/marketing/MarketingAudiencePanel';

export default function AdminMarketingCorreosPage() {
  return (
    <MarketingShell
      title="Correos"
      subtitle="Correo, plan y aceptación de envíos comerciales de cada usuario."
    >
      <MarketingAudiencePanel />
    </MarketingShell>
  );
}

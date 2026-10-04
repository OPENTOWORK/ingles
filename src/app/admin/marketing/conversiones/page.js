'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingOperationsPanel from '@/components/marketing/MarketingOperationsPanel';

export default function AdminMarketingConversionesPage() {
  return (
    <MarketingShell title="Conversiones" subtitle="De la visita a la cuenta y a la suscripción de pago.">
      <MarketingOperationsPanel section="conversions" />
    </MarketingShell>
  );
}

'use client';

import MarketingShell, { MarketingPlaceholder } from '@/components/marketing/MarketingShell';

export default function AdminMarketingCustomerJourneyPage() {
  return (
    <MarketingShell
      title="Customer Journey"
      subtitle="Recorridos visitor → lead → cliente."
    >
      <MarketingPlaceholder
        moduleName="Customer Journey"
        description="timeline global y búsqueda por usuario en la ficha de alumno"
      />
      <p className="text-sm text-slate-600 mt-4">
        Abre la ficha de un usuario en{' '}
        <strong>Administración → usuarios</strong> para ver su journey individual.
      </p>
    </MarketingShell>
  );
}

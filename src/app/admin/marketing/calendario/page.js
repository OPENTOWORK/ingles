'use client';

import MarketingShell from '@/components/marketing/MarketingShell';
import MarketingCalendar from '@/components/marketing/MarketingCalendar';

export default function AdminMarketingCalendarioPage() {
  return (
    <MarketingShell
      title="Calendario"
      subtitle="Fechas para planificar campañas: San Valentín, Black Friday, Navidad y el curso."
    >
      <MarketingCalendar />
    </MarketingShell>
  );
}

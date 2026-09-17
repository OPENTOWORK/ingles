'use client';

import AdminFinanceModulePanel from '@/components/admin/AdminFinanceModulePanel';

export default function AdminFinanzasTesoreriaPage() {
  return (
    <AdminFinanceModulePanel
      title="Tesorería"
      subtitle="Cobros, pagos y posición de tesorería."
      moduleKey="tesorería"
    />
  );
}

'use client';

import AdminFinanceModulePanel from '@/components/admin/AdminFinanceModulePanel';

export default function AdminFinanzasFacturacionPage() {
  return (
    <AdminFinanceModulePanel
      title="Facturación"
      subtitle="Emisión y seguimiento de facturas."
      moduleKey="facturación"
    />
  );
}

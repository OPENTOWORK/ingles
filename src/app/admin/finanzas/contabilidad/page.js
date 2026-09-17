'use client';

import AdminFinanceModulePanel from '@/components/admin/AdminFinanceModulePanel';

export default function AdminFinanzasContabilidadPage() {
  return (
    <AdminFinanceModulePanel
      title="Contabilidad"
      subtitle="Registro contable y conciliación."
      moduleKey="contabilidad"
    />
  );
}

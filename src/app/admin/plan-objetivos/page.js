'use client';

import { Suspense } from 'react';
import AdminPlanObjetivosPanel from '@/components/admin/AdminPlanObjetivosPanel';

export default function AdminPlanObjetivosPage() {
  return (
    <Suspense fallback={null}>
      <AdminPlanObjetivosPanel />
    </Suspense>
  );
}

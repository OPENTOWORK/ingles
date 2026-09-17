'use client';

import { Suspense } from 'react';
import AdminRolePermissionsPanel from '@/components/admin/AdminRolePermissionsPanel';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function AdminConfiguracionPage() {
  return (
    <Suspense fallback={<RouteLoadingMascot label="Cargando configuración…" variant={5} />}>
      <AdminRolePermissionsPanel />
    </Suspense>
  );
}

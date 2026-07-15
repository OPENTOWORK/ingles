'use client';

import { Suspense } from 'react';
import AdminBlogPanel from '@/components/admin/AdminBlogPanel';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<RouteLoadingMascot label="Cargando blog…" />}>
      <AdminBlogPanel />
    </Suspense>
  );
}

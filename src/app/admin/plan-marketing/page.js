'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

/** Ruta legacy: el plan vive en Marketing → Promociones. */
export default function AdminPlanMarketingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/marketing/promociones/');
  }, [router]);

  return <RouteLoadingMascot label="Abriendo promociones…" variant={5} />;
}

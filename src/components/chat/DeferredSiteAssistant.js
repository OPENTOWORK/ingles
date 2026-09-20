'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { isExamStrategiesPath } from '@/config/appRoutes';

const SiteAssistantWidget = dynamic(() => import('@/components/chat/SiteAssistantWidget'), {
  ssr: false,
  loading: () => null,
});

function SiteAssistantDeferred() {
  const ready = useDeferredMount(3000);
  if (!ready) return null;
  return <SiteAssistantWidget defaultOpen={false} />;
}

/** Solo monta el chat si hay sesión (evita carga en rutas públicas). */
export default function DeferredSiteAssistant({ enabled = false }) {
  const pathname = usePathname() || '';
  if (!enabled || isExamStrategiesPath(pathname)) return null;
  return <SiteAssistantDeferred />;
}

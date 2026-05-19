'use client';

import dynamic from 'next/dynamic';
import { useDeferredMount } from '@/hooks/useDeferredMount';

const SiteAssistantWidget = dynamic(() => import('@/components/chat/SiteAssistantWidget'), {
  ssr: false,
  loading: () => null,
});

export default function DeferredSiteAssistant() {
  const ready = useDeferredMount(3000);
  if (!ready) return null;
  return <SiteAssistantWidget />;
}

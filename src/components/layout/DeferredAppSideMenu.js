'use client';

import dynamic from 'next/dynamic';
import { useDeferredMount } from '@/hooks/useDeferredMount';

const AppSideMenuPanel = dynamic(() => import('@/components/layout/AppSideMenuPanel'), {
  ssr: false,
  loading: () => null,
});

export default function DeferredAppSideMenu({ defaultOpen }) {
  const ready = useDeferredMount(2000);
  if (!ready) return null;
  return <AppSideMenuPanel defaultOpen={defaultOpen} />;
}

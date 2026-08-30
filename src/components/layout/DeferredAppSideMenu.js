'use client';

import dynamic from 'next/dynamic';
import { useDeferredMount } from '@/hooks/useDeferredMount';

function importWithRetry(importer, retriesLeft = 2) {
  return importer().catch((error) => {
    if (retriesLeft <= 0) throw error;
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        importWithRetry(importer, retriesLeft - 1).then(resolve).catch(reject);
      }, 200);
    });
  });
}

const AppSideMenuPanel = dynamic(
  () => importWithRetry(() => import('@/components/layout/AppSideMenuPanel')),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function DeferredAppSideMenu({ defaultOpen }) {
  const ready = useDeferredMount(2000);
  if (!ready) return null;
  return <AppSideMenuPanel defaultOpen={defaultOpen} />;
}

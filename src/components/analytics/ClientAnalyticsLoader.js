'use client';

import dynamic from 'next/dynamic';
import { useClientMounted } from '@/hooks/useClientMounted';

const MicrosoftClarity = dynamic(() => import('@/components/analytics/MicrosoftClarity'), {
  ssr: false,
});
const MetaPixel = dynamic(() => import('@/components/analytics/MetaPixel'), {
  ssr: false,
});

export default function ClientAnalyticsLoader({
  clarityEnabled,
  clarityProjectId,
  pixelEnabled,
  pixelId,
}) {
  const mounted = useClientMounted();
  if (!mounted) return null;

  return (
    <>
      <MicrosoftClarity enabled={clarityEnabled} projectId={clarityProjectId} />
      <MetaPixel enabled={pixelEnabled} pixelId={pixelId} />
    </>
  );
}

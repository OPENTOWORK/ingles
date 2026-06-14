'use client';

import DraloAiWritingPage from '@/components/dralo-ai/DraloAiWritingPage';
import DraloAiFeatureGuard from '@/components/dralo-ai/DraloAiFeatureGuard';

export default function DraloAiWritingRoutePage() {
  return (
    <DraloAiFeatureGuard>
      <DraloAiWritingPage />
    </DraloAiFeatureGuard>
  );
}

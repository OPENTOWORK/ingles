'use client';

import DraloAiSpeakingCoach from '@/components/dralo-ai/DraloAiSpeakingCoach';
import DraloAiFeatureGuard from '@/components/dralo-ai/DraloAiFeatureGuard';

export default function DraloAiSpeakingPage() {
  return (
    <DraloAiFeatureGuard>
      <DraloAiSpeakingCoach />
    </DraloAiFeatureGuard>
  );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LevelsSpeakingAiPanel from '@/components/niveles/LevelsSpeakingAiPanel';

function DraloAiSpeakingCoachInner() {
  const searchParams = useSearchParams();
  const level = searchParams.get('level') || 'B2';
  return <LevelsSpeakingAiPanel defaultLevel={level} />;
}

export default function DraloAiSpeakingCoach() {
  return (
    <Suspense fallback={<main className="dralo-ai-page"><p style={{ padding: 24 }}>Loading…</p></main>}>
      <DraloAiSpeakingCoachInner />
    </Suspense>
  );
}

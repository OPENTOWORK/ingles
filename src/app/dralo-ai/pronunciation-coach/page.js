'use client';

import DraloAiPronunciationCoach from '@/components/dralo-ai/DraloAiPronunciationCoach';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';

export default function DraloAiPronunciationCoachPage() {
  return <DraloAiPronunciationCoach config={DRALO_AI_MODES['pronunciation-coach']} />;
}

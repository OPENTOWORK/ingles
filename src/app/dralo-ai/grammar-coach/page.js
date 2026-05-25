'use client';

import DraloAiGrammarCoach from '@/components/dralo-ai/DraloAiGrammarCoach';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';

export default function DraloAiGrammarCoachPage() {
  return <DraloAiGrammarCoach config={DRALO_AI_MODES['grammar-coach']} />;
}

'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';

export default function DraloAiReadingPage() {
  return <DraloAiStudio config={DRALO_AI_MODES.reading} />;
}

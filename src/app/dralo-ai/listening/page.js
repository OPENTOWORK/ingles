'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';

export default function DraloAiListeningPage() {
  return <DraloAiStudio config={DRALO_AI_MODES.listening} />;
}

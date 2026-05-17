'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';

export default function DraloAiWritingPage() {
  return <DraloAiStudio config={DRALO_AI_MODES.writing} />;
}

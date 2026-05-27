'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig } from '@/lib/draloAiTrackHelpers';

export default function DraloAiListeningExamPage() {
  const config = getExamModeConfig('listening');
  return (
    <DraloAiStudio
      config={config}
      track="exam"
      backHref="/dralo-ai/listening"
      breadcrumbTrail="Preparación del examen"
      pageTitle={`${config.title} · Examen`}
      pageDescription="Todas las partes del listening Cambridge: extracts, completion, conversation y matching."
    />
  );
}

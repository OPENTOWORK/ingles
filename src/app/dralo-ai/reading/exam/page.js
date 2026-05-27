'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig } from '@/lib/draloAiTrackHelpers';

export default function DraloAiReadingExamPage() {
  const config = getExamModeConfig('reading');
  return (
    <DraloAiStudio
      config={config}
      track="exam"
      backHref="/dralo-ai/reading"
      breadcrumbTrail="Preparación del examen"
      pageTitle={`${config.title} · Examen`}
      pageDescription="Multiple choice, gapped text y multiple matching al estilo Cambridge."
    />
  );
}

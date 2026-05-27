'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig } from '@/lib/draloAiTrackHelpers';

export default function DraloAiUoeExamPage() {
  const config = getExamModeConfig('use-of-english');
  return (
    <DraloAiStudio
      config={config}
      track="exam"
      backHref="/dralo-ai/use-of-english"
      breadcrumbTrail="Preparación del examen"
      pageTitle={`${config.title} · Examen`}
      pageDescription="Partes del examen Cambridge: cloze, word formation y transformaciones."
    />
  );
}

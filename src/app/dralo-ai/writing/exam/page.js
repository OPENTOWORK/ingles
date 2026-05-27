'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig } from '@/lib/draloAiTrackHelpers';

export default function DraloAiWritingExamPage() {
  const config = getExamModeConfig('writing');
  return (
    <DraloAiStudio
      config={config}
      track="exam"
      backHref="/dralo-ai/writing"
      breadcrumbTrail="Preparación del examen"
      pageTitle={`${config.title} · Examen`}
      pageDescription="Essay obligatorio y article/letter/review — tareas del examen."
    />
  );
}

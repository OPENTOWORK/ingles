'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig, getSituationalMeta, mapScenariosToActivities } from '@/lib/draloAiTrackHelpers';

export default function DraloAiReadingSituationalPage() {
  const config = getExamModeConfig('reading');
  const meta = getSituationalMeta('reading');
  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={mapScenariosToActivities('reading')}
      backHref="/dralo-ai/reading"
      breadcrumbTrail="Situaciones reales"
      pageTitle={meta?.title}
      pageDescription={meta?.description}
    />
  );
}

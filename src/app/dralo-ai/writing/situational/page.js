'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig, getSituationalMeta, mapScenariosToActivities } from '@/lib/draloAiTrackHelpers';

export default function DraloAiWritingSituationalPage() {
  const config = getExamModeConfig('writing');
  const meta = getSituationalMeta('writing');
  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={mapScenariosToActivities('writing')}
      backHref="/dralo-ai/writing"
      breadcrumbTrail="Situaciones reales"
      pageTitle={meta?.title}
      pageDescription={meta?.description}
    />
  );
}

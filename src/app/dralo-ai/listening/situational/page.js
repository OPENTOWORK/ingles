'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig, getSituationalMeta, mapScenariosToActivities } from '@/lib/draloAiTrackHelpers';

export default function DraloAiListeningSituationalPage() {
  const config = getExamModeConfig('listening');
  const meta = getSituationalMeta('listening');
  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={mapScenariosToActivities('listening')}
      backHref="/dralo-ai/listening"
      breadcrumbTrail="Situaciones reales"
      pageTitle={meta?.title}
      pageDescription={meta?.description}
    />
  );
}

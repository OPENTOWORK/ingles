'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { getExamModeConfig, getSituationalMeta, mapScenariosToActivities } from '@/lib/draloAiTrackHelpers';

export default function DraloAiUoeSituationalPage() {
  const config = getExamModeConfig('use-of-english');
  const meta = getSituationalMeta('use-of-english');
  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={mapScenariosToActivities('use-of-english')}
      backHref="/dralo-ai/use-of-english"
      breadcrumbTrail="Situaciones reales"
      pageTitle={meta?.title || config.title}
      pageDescription={meta?.description}
    />
  );
}

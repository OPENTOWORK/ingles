'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { DRALO_AI_SITUATIONAL_EYEBROW } from '@/data/draloAiSituationalConfig';
import {
  getExamModeConfig,
  getSituationalMeta,
  mapScenariosToActivities,
} from '@/lib/draloAiTrackHelpers';

/** Real-world practice for a Dralo AI skill (no exam-prep track). */
export default function DraloAiSituationalSkillPage({ skillId }) {
  const config = getExamModeConfig(skillId);
  const meta = getSituationalMeta(skillId);

  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={mapScenariosToActivities(skillId)}
      backHref="/dralo-ai"
      backLabel="Dralo AI"
      pageTitle={meta?.title || config.title}
      pageDescription={meta?.description}
      pageEyebrow={DRALO_AI_SITUATIONAL_EYEBROW}
    />
  );
}

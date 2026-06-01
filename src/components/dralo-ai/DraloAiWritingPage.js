'use client';

import DraloAiStudio from '@/components/dralo-ai/DraloAiStudio';
import { DRALO_AI_SITUATIONAL_EYEBROW } from '@/data/draloAiSituationalConfig';
import {
  getExamModeConfig,
  getSituationalMeta,
  mapScenariosToActivities,
} from '@/lib/draloAiTrackHelpers';

export const DRALO_AI_WRITING_CORRECTION_ACTIVITY_ID = 'writing-correction';

const WRITING_CORRECTION_ACTIVITY = {
  id: DRALO_AI_WRITING_CORRECTION_ACTIVITY_ID,
  label: 'Writing Correction',
  icon: '✨',
  hint: 'Paste your text and get structured Exam Coach feedback (level, scores, corrections, improved version).',
};

/** Dralo AI · Writing — Exam Coach correction + real-world formats. */
export default function DraloAiWritingPage() {
  const config = getExamModeConfig('writing');
  const meta = getSituationalMeta('writing');
  const activities = [WRITING_CORRECTION_ACTIVITY, ...mapScenariosToActivities('writing')];

  return (
    <DraloAiStudio
      config={config}
      track="situational"
      activities={activities}
      defaultActivityId={DRALO_AI_WRITING_CORRECTION_ACTIVITY_ID}
      writingCorrectionActivityId={DRALO_AI_WRITING_CORRECTION_ACTIVITY_ID}
      backHref="/dralo-ai"
      backLabel="Dralo AI"
      pageTitle={meta?.title || config.title}
      pageDescription={
        'Correct your own writing with the Exam Coach, or practise WhatsApp, emails and other formats with instant feedback.'
      }
      pageEyebrow={DRALO_AI_SITUATIONAL_EYEBROW}
    />
  );
}

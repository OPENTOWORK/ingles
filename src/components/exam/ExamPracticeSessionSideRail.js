'use client';

import ExamPracticeSideRail from '@/components/exam/ExamPracticeSideRail';
import ReadingPracticeToolsPanel from '@/components/exam/ReadingPracticeToolsPanel';
import ReadingPracticeFeedbackToggle from '@/components/exam/ReadingPracticeFeedbackToggle';

/**
 * Side rail for skill practice (listening, writing, speaking, …).
 * Matches Reading & Use of English: full Tools panel + Instant feedback toggle.
 */
export default function ExamPracticeSessionSideRail({
  strategy = null,
  progress = null,
  lang = 'en',
}) {
  return (
    <ExamPracticeSideRail
      strategy={strategy}
      progress={progress}
      tools={
        <>
          <ReadingPracticeToolsPanel lang={lang} />
          <ReadingPracticeFeedbackToggle lang={lang} />
        </>
      }
    />
  );
}

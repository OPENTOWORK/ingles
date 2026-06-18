'use client';

import ExamPracticeSideRail from '@/components/exam/ExamPracticeSideRail';
import ReadingPracticeToolsPanel from '@/components/exam/ReadingPracticeToolsPanel';

/**
 * Side rail for skill practice (listening, writing, speaking, …).
 * Matches Reading & Use of English: full Tools panel + Instant feedback toggle.
 */
export default function ExamPracticeSessionSideRail({
  strategy = null,
  progress = null,
  topRail = null,
  finishNotice = null,
  lang = 'en',
}) {
  return (
    <ExamPracticeSideRail
      topRail={topRail}
      strategy={strategy}
      progress={progress}
      tools={<ReadingPracticeToolsPanel lang={lang} />}
      finishNotice={finishNotice}
    />
  );
}

'use client';

import ExamPracticeSideRail from '@/components/exam/ExamPracticeSideRail';
import B2ReadingStrategyPanel from '@/components/b2/B2ReadingStrategyPanel';
import ReadingPracticeProgressPanel from '@/components/exam/ReadingPracticeProgressPanel';
import ReadingPracticeToolsPanel from '@/components/exam/ReadingPracticeToolsPanel';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

export default function ReadingPracticeSideRail({
  strategyPack,
  partNumber,
  questions,
  checkedQuestions,
  selectedOptions,
  groupedAnswers,
  openChecks,
  correctCount,
  totalSlots,
  hideFeedback,
  lang = 'en',
}) {
  const session = useReadingPracticeSession();

  return (
    <ExamPracticeSideRail
      strategy={
        strategyPack ? (
          <B2ReadingStrategyPanel pack={strategyPack} partNumber={partNumber} />
        ) : null
      }
      progress={
        <ReadingPracticeProgressPanel
          questions={questions}
          checkedQuestions={checkedQuestions}
          selectedOptions={selectedOptions}
          groupedAnswers={groupedAnswers}
          openChecks={openChecks}
          flaggedQuestions={session.flaggedQuestions}
          confidenceByQuestion={session.confidenceByQuestion}
          partNumber={partNumber}
          correctCount={correctCount}
          totalSlots={totalSlots}
          checkAttempts={session.checkAttempts}
          hideFeedback={hideFeedback}
          lang={lang}
        />
      }
      tools={<ReadingPracticeToolsPanel lang={lang} />}
    />
  );
}

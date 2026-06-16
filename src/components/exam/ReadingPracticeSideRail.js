'use client';

import ExamPracticeSideRail from '@/components/exam/ExamPracticeSideRail';
import B2ReadingStrategyPanel from '@/components/b2/B2ReadingStrategyPanel';
import ReadingPracticeProgressPanel from '@/components/exam/ReadingPracticeProgressPanel';
import ReadingPracticeToolsPanel from '@/components/exam/ReadingPracticeToolsPanel';
import ReadingPracticeFeedbackToggle from '@/components/exam/ReadingPracticeFeedbackToggle';
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
  examSlot,
  progressBySlot,
  examLabelsBySlot,
  passing,
  finishNotice = null,
  lang = 'en',
  scoringVersion = 1,
  questionsAnswered,
  totalQuestions,
  correctItems,
  pointsEarned,
  maxPoints,
  accuracyByPoints,
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
          scoringVersion={scoringVersion}
          questionsAnswered={questionsAnswered}
          totalQuestions={totalQuestions}
          correctItems={correctItems}
          pointsEarned={pointsEarned}
          maxPoints={maxPoints}
          accuracyByPoints={accuracyByPoints}
          checkAttempts={session.checkAttempts}
          hideFeedback={hideFeedback}
          examSlot={examSlot}
          progressBySlot={progressBySlot}
          examLabelsBySlot={examLabelsBySlot}
          passing={passing}
          lang={lang}
        />
      }
      tools={
        <>
          <ReadingPracticeToolsPanel lang={lang} />
          <ReadingPracticeFeedbackToggle lang={lang} />
        </>
      }
      finishNotice={finishNotice}
    />
  );
}

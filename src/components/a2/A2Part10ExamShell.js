'use client';

import { A2Part10ExamView } from '@/components/a2/A2Part10ExamView';

export default function A2Part10ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  intro = '',
  groups = [],
  getQuestionKey,
  selectedPart,
  selectedOptions,
  checkedQuestions,
  hideFeedback,
  onOptionSelect,
  aiHintsByKey = {},
}) {
  return (
    <div className="a2-p10-exam-frame">
      {showDemoNote ? (
        <p className="a2-p10-paper__demo-note" role="status">
          Official Cambridge sample format (no audio yet). An admin can save this to Supabase by
          regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part10ExamView
        directions={directions}
        intro={intro}
        groups={groups}
        getQuestionKey={getQuestionKey}
        selectedPart={selectedPart}
        selectedOptions={selectedOptions}
        checkedQuestions={checkedQuestions}
        hideFeedback={hideFeedback}
        onOptionSelect={onOptionSelect}
        aiHintsByKey={aiHintsByKey}
      />
    </div>
  );
}

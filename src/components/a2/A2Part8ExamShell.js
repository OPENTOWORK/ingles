'use client';

import { A2Part8ExamView } from '@/components/a2/A2Part8ExamView';

export default function A2Part8ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
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
    <div className="a2-p8-exam-frame">
      {showDemoNote ? (
        <p className="a2-p8-paper__demo-note" role="status">
          Official Cambridge sample format (placeholder pictures, no audio yet). An admin can save
          this to Supabase by regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part8ExamView
        directions={directions}
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

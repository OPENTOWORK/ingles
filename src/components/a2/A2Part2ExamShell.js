'use client';

import { A2Part2ExamView } from '@/components/a2/A2Part2ExamView';

export default function A2Part2ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  passageText = '',
  profileNames = [],
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
    <div className="a2-p2-exam-frame">
      {showDemoNote ? (
        <p className="a2-p2-paper__demo-note" role="status">
          Official Cambridge sample text (no photos yet). An admin can save this to Supabase by
          regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part2ExamView
        directions={directions}
        passageText={passageText}
        profileNames={profileNames}
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

'use client';

import { A2Part4ExamView } from '@/components/a2/A2Part4ExamView';

export default function A2Part4ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  passageTitle = '',
  passageParagraphs = [],
  passageText = '',
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
    <div className="a2-p4-exam-frame">
      {showDemoNote ? (
        <p className="a2-p4-paper__demo-note" role="status">
          Official Cambridge sample text. An admin can save this to Supabase by regenerating Exam{' '}
          {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part4ExamView
        directions={directions}
        passageTitle={passageTitle}
        passageParagraphs={passageParagraphs}
        passageText={passageText}
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

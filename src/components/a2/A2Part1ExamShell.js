'use client';

import { A2Part1ExamView } from '@/components/a2/A2Part1ExamView';

/**
 * Part 1 A2 — hoja de examen encuadrada (texto sin imágenes).
 */
export default function A2Part1ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  example = null,
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
    <div className="a2-p1-exam-frame">
      {showDemoNote ? (
        <p className="a2-p1-paper__demo-note" role="status">
          Official Cambridge sample text (no images yet). An admin can save this to Supabase
          by regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part1ExamView
        directions={directions}
        example={example}
        groups={groups}
        textOnlyStimulus
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

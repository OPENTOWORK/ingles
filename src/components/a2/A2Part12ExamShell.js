'use client';

import { useState, useCallback } from 'react';
import { A2Part12ExamView } from '@/components/a2/A2Part12ExamView';

/**
 * Demo autocontenido de la Parte 12 (Listening Part 5, sin fila Supabase):
 * gestiona el emparejamiento persona↔comida y la comprobación con el answer key.
 */
export default function A2Part12ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  introLines = [],
  example = null,
  people = [],
  optionPool = [],
  answers = {},
  hideFeedback = false,
}) {
  const [selections, setSelections] = useState({});
  const [checks, setChecks] = useState({});

  const handleSelect = useCallback(
    (number, letter) => {
      setSelections((prev) => ({ ...prev, [number]: letter }));
      if (!letter) {
        setChecks((prev) => ({ ...prev, [number]: undefined }));
        return;
      }
      const isCorrect =
        String(letter).toUpperCase() === String(answers[number] || '').toUpperCase();
      setChecks((prev) => ({ ...prev, [number]: isCorrect }));
    },
    [answers],
  );

  return (
    <div className="a2-p12-exam-frame">
      {showDemoNote ? (
        <p className="a2-p12-paper__demo-note" role="status">
          Official Cambridge sample format (no audio yet). An admin can save this to Supabase by
          regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part12ExamView
        directions={directions}
        introLines={introLines}
        example={example}
        people={people}
        optionPool={optionPool}
        answers={answers}
        selections={selections}
        checks={checks}
        hideFeedback={hideFeedback}
        onSelect={handleSelect}
      />
    </div>
  );
}

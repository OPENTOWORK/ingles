'use client';

import { useState, useCallback } from 'react';
import { A2Part5ExamView } from '@/components/a2/A2Part5ExamView';

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Demo autocontenido de la Parte 5 (sin fila Supabase): gestiona su propio
 * estado de respuestas y comprobación con el answer key oficial.
 */
export default function A2Part5ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  email = {},
  example = null,
  bodyParagraphs = [],
  answers = {},
  hideFeedback = false,
}) {
  const [values, setValues] = useState({});
  const [checks, setChecks] = useState({});

  const handleChange = useCallback((number, value) => {
    setValues((prev) => ({ ...prev, [number]: value }));
    setChecks((prev) => ({ ...prev, [number]: undefined }));
  }, []);

  const handleCheck = useCallback(
    (number, value) => {
      if (!String(value || '').trim()) return;
      const accepted = (answers[number] || []).map((w) => normalize(w));
      const isCorrect = accepted.includes(normalize(value));
      setChecks((prev) => ({ ...prev, [number]: isCorrect }));
    },
    [answers],
  );

  return (
    <div className="a2-p5-exam-frame">
      {showDemoNote ? (
        <p className="a2-p5-paper__demo-note" role="status">
          Official Cambridge sample text. An admin can save this to Supabase by regenerating Exam{' '}
          {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part5ExamView
        directions={directions}
        email={email}
        example={example}
        bodyParagraphs={bodyParagraphs}
        values={values}
        checks={checks}
        answers={answers}
        hideFeedback={hideFeedback}
        onChange={handleChange}
        onCheck={handleCheck}
      />
    </div>
  );
}

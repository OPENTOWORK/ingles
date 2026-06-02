'use client';

import { useState, useCallback } from 'react';
import { A2Part9ExamView } from '@/components/a2/A2Part9ExamView';

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Demo autocontenido de la Parte 9 (Listening Part 2, sin fila Supabase):
 * gestiona su propio estado de respuestas y comprobación con el answer key oficial.
 */
export default function A2Part9ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  intro = '',
  noteTitle = [],
  rows = [],
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
    <div className="a2-p9-exam-frame">
      {showDemoNote ? (
        <p className="a2-p9-paper__demo-note" role="status">
          Official Cambridge sample format (no audio yet). An admin can save this to Supabase by
          regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part9ExamView
        directions={directions}
        intro={intro}
        noteTitle={noteTitle}
        rows={rows}
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

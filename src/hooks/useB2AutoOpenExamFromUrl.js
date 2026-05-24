'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Abre la práctica de examen cuando la URL incluye ?examen=N (p. ej. desde Full Exam).
 */
export function useB2AutoOpenExamFromUrl({ examPracticeOpen, handleSelectExam, selectExamSlot }) {
  const searchParams = useSearchParams();
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    const q = searchParams.get('examen');
    if (!q || autoOpenedRef.current || examPracticeOpen) return;
    autoOpenedRef.current = true;
    handleSelectExam(selectExamSlot, Number(q));
  }, [searchParams, examPracticeOpen, handleSelectExam, selectExamSlot]);
}

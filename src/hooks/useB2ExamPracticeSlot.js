'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';

export const B2_EXAM_PRACTICE_SLOT_KEY = 'b2-exam-practice-slot';

/** Lee slot inicial desde URL o sessionStorage (evita carga doble con slot 1). */
export function readInitialB2ExamSlot(searchParams) {
  const q = searchParams.get('examen');
  if (q !== null && q !== '') return clampB2ExamSlot(q);
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(B2_EXAM_PRACTICE_SLOT_KEY);
      if (stored !== null && stored !== '') return clampB2ExamSlot(stored);
    } catch {
      /* ignore */
    }
  }
  return 1;
}

/**
 * Estado del examen 1–5 en páginas B2 de práctica (sync URL ?examen=, sessionStorage).
 * Usar dentro de un boundary Suspense (usa useSearchParams).
 */
export function useB2ExamPracticeSlot() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [examSlot, setExamSlotState] = useState(() => readInitialB2ExamSlot(searchParams));

  useEffect(() => {
    const next = readInitialB2ExamSlot(new URLSearchParams(queryString));
    setExamSlotState((prev) => (prev === next ? prev : next));
  }, [queryString]);

  const selectExamSlot = useCallback(
    (n) => {
      const v = clampB2ExamSlot(n);
      const params = new URLSearchParams(queryString);
      const urlSlot = params.get('examen');
      if (v === examSlot && urlSlot !== null && urlSlot !== '' && clampB2ExamSlot(urlSlot) === v) {
        return;
      }
      setExamSlotState(v);
      try {
        sessionStorage.setItem(B2_EXAM_PRACTICE_SLOT_KEY, String(v));
      } catch {
        /* ignore */
      }
      params.set('examen', String(v));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [examSlot, pathname, queryString, router],
  );

  return { examSlot, selectExamSlot };
}

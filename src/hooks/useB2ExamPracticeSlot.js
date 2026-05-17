'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';

export const B2_EXAM_PRACTICE_SLOT_KEY = 'b2-exam-practice-slot';

/**
 * Estado del examen 1–5 en páginas B2 de práctica (sync URL ?examen=, sessionStorage).
 * Usar dentro de un boundary Suspense (usa useSearchParams).
 */
export function useB2ExamPracticeSlot() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [examSlot, setExamSlotState] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const q = params.get('examen');
    let next = 1;
    if (q !== null && q !== '') {
      next = clampB2ExamSlot(q);
    } else {
      try {
        const stored = sessionStorage.getItem(B2_EXAM_PRACTICE_SLOT_KEY);
        if (stored !== null && stored !== '') next = clampB2ExamSlot(stored);
      } catch {
        /* ignore */
      }
    }
    setExamSlotState(next);
  }, [queryString]);

  const selectExamSlot = useCallback(
    (n) => {
      const v = clampB2ExamSlot(n);
      setExamSlotState(v);
      try {
        sessionStorage.setItem(B2_EXAM_PRACTICE_SLOT_KEY, String(v));
      } catch {
        /* ignore */
      }
      router.replace(`${pathname}?examen=${v}`, { scroll: false });
    },
    [pathname, router],
  );

  return { examSlot, selectExamSlot };
}

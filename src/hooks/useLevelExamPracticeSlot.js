'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clampB2ExamSlot } from '@/utils/b2ResolveExam';

export function levelExamPracticeSlotKey(slug) {
  return `${String(slug || 'level').toLowerCase()}-exam-practice-slot`;
}

/**
 * Examen 1–5 en páginas de práctica por nivel (URL ?examen= + sessionStorage).
 */
export function useLevelExamPracticeSlot(slug) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const storageKey = levelExamPracticeSlotKey(slug);
  const [examSlot, setExamSlotState] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const q = params.get('examen');
    let next = 1;
    if (q !== null && q !== '') {
      next = clampB2ExamSlot(q);
    } else {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored !== null && stored !== '') next = clampB2ExamSlot(stored);
      } catch {
        /* ignore */
      }
    }
    setExamSlotState(next);
  }, [queryString, storageKey]);

  const selectExamSlot = useCallback(
    (n) => {
      const v = clampB2ExamSlot(n);
      setExamSlotState(v);
      try {
        sessionStorage.setItem(storageKey, String(v));
      } catch {
        /* ignore */
      }
      router.replace(`${pathname}?examen=${v}`, { scroll: false });
    },
    [pathname, router, storageKey],
  );

  return { examSlot, selectExamSlot };
}

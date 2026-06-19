'use client';

import { useCallback, useEffect, useState } from 'react';
import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';
import { buildExamModeProgressBySlot } from '@/utils/examModeSession';

/**
 * Progreso del selector de exámenes en exam mode (sesiones locales por slot).
 */
export function useExamModePickerProgress({ slug, userId, availableSlots }) {
  const [progressBySlot, setProgressBySlot] = useState({});

  const refreshProgress = useCallback(() => {
    const slots =
      availableSlots?.length > 0
        ? availableSlots
        : Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);
    setProgressBySlot(buildExamModeProgressBySlot(slug, userId, slots));
  }, [slug, userId, availableSlots]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onStorage = (event) => {
      if (event.key?.includes('dralo_exam_mode')) {
        refreshProgress();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshProgress);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshProgress);
    };
  }, [refreshProgress]);

  return { progressBySlot, refreshProgress };
}

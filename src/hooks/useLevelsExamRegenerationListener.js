'use client';

import { useEffect } from 'react';
import { LEVELS_EXAM_REGENERATED_EVENT } from '@/utils/levelsExamRegenerationSync';

/**
 * Reload practice data when the active exam slot was regenerated (admin).
 */
export function useLevelsExamRegenerationListener({ slug, examSlot, onRegenerated }) {
  useEffect(() => {
    if (typeof onRegenerated !== 'function') return undefined;

    const handler = (event) => {
      const detail = event?.detail || {};
      if (detail.slug !== String(slug || '').toLowerCase()) return;
      if (Number(detail.examSlot) !== Number(examSlot)) return;
      onRegenerated();
    };

    window.addEventListener(LEVELS_EXAM_REGENERATED_EVENT, handler);
    return () => window.removeEventListener(LEVELS_EXAM_REGENERATED_EVENT, handler);
  }, [slug, examSlot, onRegenerated]);
}

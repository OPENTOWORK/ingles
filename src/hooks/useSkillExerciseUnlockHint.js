'use client';

import { useMemo } from 'react';
import { useExamStarGatingBypass } from '@/hooks/useExamStarGatingBypass';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { getSkillExerciseNavState } from '@/utils/skillPracticeNavigation';
import {
  buildProgressBySlotWithLiveOverlay,
  getSkillNextExerciseUnlockHint,
} from '@/utils/skillPartFirstProgress';

/**
 * Unlock banner for skill practice — same rules as B2ExamPracticeModuleNav footer hint.
 * @param {null | {
 *   enabled?: boolean,
 *   examSlot?: number,
 *   examenIdBySlot?: Record<number, string>,
 *   partNumber?: number,
 *   pagePartMin?: number,
 *   pagePartMax?: number,
 *   partMinForTabLabels?: number,
 *   progressBySlot?: Record<number, object>,
 *   livePartProgress?: object | null,
 *   lang?: 'en' | 'es',
 * }} config
 */
export function useSkillExerciseUnlockHint(config) {
  const bypassStarGating = useExamStarGatingBypass();
  const { maxExamSlot } = usePlanEntitlements();

  return useMemo(() => {
    if (!config?.enabled) return null;

    const {
      examSlot,
      examenIdBySlot = {},
      partNumber,
      pagePartMin,
      pagePartMax,
      partMinForTabLabels,
      progressBySlot,
      livePartProgress,
      lang = 'en',
    } = config;

    const effectiveProgress = buildProgressBySlotWithLiveOverlay(
      progressBySlot,
      examSlot,
      partNumber,
      livePartProgress,
    );

    const nav = getSkillExerciseNavState({
      examSlot,
      examenIdBySlot,
      partNumber,
      partMin: pagePartMin ?? partMinForTabLabels ?? 1,
      partMax: pagePartMax,
      progressBySlot: effectiveProgress,
      bypassStarGating,
      maxExamSlot,
    });

    return getSkillNextExerciseUnlockHint(nav, { lang });
  }, [config, bypassStarGating, maxExamSlot]);
}

export default useSkillExerciseUnlockHint;

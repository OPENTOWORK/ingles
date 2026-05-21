'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TRAINING_CEFR_LEVELS,
  TRAINING_DIFFICULTY_IDS,
  TRAINING_SKILL_IDS,
  TRAINING_STARS_UPDATED_EVENT,
  computeAllCefrStarProgress,
  computeAllDifficultyStarProgress,
  computeAllSkillStarProgress,
  computeCefrStarProgress,
  computeDifficultyStarProgress,
  computeSkillStarProgress,
} from '@/utils/trainingStarsProgress';

function scheduleIdleWork(fn, timeout = 800) {
  if (typeof window === 'undefined') return () => {};
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const t = window.setTimeout(fn, 0);
  return () => window.clearTimeout(t);
}

function useStarProgressMap(compute) {
  const [progressMap, setProgressMap] = useState({});
  const computeRef = useRef(compute);
  computeRef.current = compute;

  const runCompute = useCallback(() => {
    setProgressMap(computeRef.current());
  }, []);

  useEffect(() => {
    return scheduleIdleWork(runCompute, 600);
  }, [runCompute]);

  useEffect(() => {
    let debounceId = null;
    const refresh = () => {
      if (debounceId) window.clearTimeout(debounceId);
      debounceId = window.setTimeout(runCompute, 80);
    };

    window.addEventListener('storage', refresh);
    window.addEventListener(TRAINING_STARS_UPDATED_EVENT, refresh);
    return () => {
      if (debounceId) window.clearTimeout(debounceId);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(TRAINING_STARS_UPDATED_EVENT, refresh);
    };
  }, [runCompute]);

  return progressMap;
}

/**
 * Progreso de estrellas por nivel CEFR (a2, b1, …).
 * @returns {Record<string, { earned: number, max: number, percent: number }>}
 */
export function useTrainingCefrStarProgressMap() {
  return useStarProgressMap(computeAllCefrStarProgress);
}

/** Progreso por skill para un nivel CEFR (p. ej. b2). */
export function useTrainingSkillStarProgressMap(cefrLevel) {
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const compute = useCallback(() => computeAllSkillStarProgress(levelKey), [levelKey]);
  return useStarProgressMap(compute);
}

/** Progreso por dificultad para un skill y nivel CEFR. */
export function useTrainingDifficultyStarProgressMap(cefrLevel, skillId) {
  const levelKey = (cefrLevel || 'a2').toLowerCase();
  const skill = skillId || TRAINING_SKILL_IDS[0];
  const compute = useCallback(
    () => computeAllDifficultyStarProgress(levelKey, skill),
    [levelKey, skill],
  );
  return useStarProgressMap(compute);
}

export function useTrainingCefrStarProgress(cefrLevel) {
  const map = useTrainingCefrStarProgressMap();
  const key = (cefrLevel || 'a2').toLowerCase();
  return map[key] ?? computeCefrStarProgress(key);
}

export {
  TRAINING_CEFR_LEVELS,
  TRAINING_DIFFICULTY_IDS,
  TRAINING_SKILL_IDS,
  computeDifficultyStarProgress,
  computeSkillStarProgress,
  getMaxStarsForDifficulty,
  getMaxStarsForSkill,
} from '@/utils/trainingStarsProgress';

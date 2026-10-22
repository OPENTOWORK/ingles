'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLevelInfo } from '@/lib/dralo-levels';
import { syncTrainingExperience } from '@/lib/trainingExperienceClient';

const EMPTY_LEVEL = getLevelInfo(0);

/**
 * Training experience for the profile card. Loading it also saves the stars kept in this browser.
 * @param {string | null | undefined} accessToken Reloads when the session changes.
 */
export function useTrainingExperience(accessToken) {
  const [state, setState] = useState({
    totalXp: 0,
    levelInfo: EMPTY_LEVEL,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const json = await syncTrainingExperience();
      const totalXp = Number(json?.totalXp) || 0;
      setState({
        totalXp,
        levelInfo: json?.levelInfo ?? getLevelInfo(totalXp),
        loading: false,
        error: null,
      });
    } catch {
      setState({ totalXp: 0, levelInfo: EMPTY_LEVEL, loading: false, error: 'unavailable' });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, accessToken]);

  return {
    ...state,
    isEmpty: !state.loading && !state.error && state.totalXp === 0,
    refresh,
  };
}

export default useTrainingExperience;

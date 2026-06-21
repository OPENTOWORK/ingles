'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useLevelsCategoryTimer } from '@/hooks/useLevelsCategoryTimer';
import { recordPartPracticeSessionTime } from '@/utils/partSessionTime';

/**
 * Session timer for one exam part: auto-starts on part change, can finalize on completion.
 */
export function usePartPracticeTimer({ practiceReady = true, partKey = null, autoStart = true } = {}) {
  const timer = useLevelsCategoryTimer({ autoStart: false });
  const savedRef = useRef(false);
  const saveParamsRef = useRef(null);

  useEffect(() => {
    savedRef.current = false;
    if (!practiceReady || !partKey) return;
    timer.reset();
    if (autoStart) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when part identity changes
  }, [partKey, practiceReady, autoStart]);

  const registerSaveParams = useCallback((params) => {
    saveParamsRef.current = params;
  }, []);

  const finalizeSession = useCallback(
    async (saveParams = null) => {
      if (savedRef.current) return Math.max(timer.secondsRef.current, timer.seconds);

      timer.stop();

      const params = {
        ...saveParamsRef.current,
        ...(saveParams && typeof saveParams === 'object' ? saveParams : {}),
      };
      const elapsed = Math.max(timer.secondsRef.current, timer.seconds);
      if (elapsed < 1) {
        savedRef.current = true;
        return 0;
      }

      savedRef.current = true;

      if (params?.userId && params?.preguntaId) {
        const result = await recordPartPracticeSessionTime({ ...params, seconds: elapsed });
        if (result?.error && typeof console !== 'undefined') {
          console.warn('[partPracticeTimer] save failed:', result.error.message || result.error);
        }
      }

      return elapsed;
    },
    [timer],
  );

  useEffect(() => {
    const onPageHide = () => {
      const params = saveParamsRef.current;
      if (savedRef.current || !params?.userId || !params?.preguntaId) return;
      const elapsed = Math.max(timer.secondsRef.current, timer.seconds);
      if (elapsed < 1) return;
      void finalizeSession(params);
    };

    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [finalizeSession, timer]);

  return {
    ...timer,
    finalizeSession,
    registerSaveParams,
  };
}

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

  useEffect(() => {
    savedRef.current = false;
    if (!practiceReady || !partKey) return;
    timer.reset();
    if (autoStart) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when part identity changes
  }, [partKey, practiceReady, autoStart]);

  const finalizeSession = useCallback(
    async (saveParams = null) => {
      if (savedRef.current) return timer.seconds;
      if (timer.isIdle && timer.seconds <= 0) return 0;

      const seconds = timer.stop();
      savedRef.current = true;

      if (saveParams && seconds >= 1) {
        await recordPartPracticeSessionTime({ ...saveParams, seconds });
      }

      return seconds;
    },
    [timer],
  );

  return {
    ...timer,
    finalizeSession,
  };
}

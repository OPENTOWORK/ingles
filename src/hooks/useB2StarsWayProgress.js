'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedB2Level, getCachedB2ExamenIdsBySlot } from '@/utils/b2LevelCache';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';
import { LEVELS_PART_PROGRESS_SAVED_EVENT } from '@/utils/levelsProgressEvents';

/**
 * Progress for all B2 paper parts (1–17) — skill practice scores only.
 */
export function useB2StarsWayProgress() {
  const [progressBySlot, setProgressBySlot] = useState({});
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [loading, setLoading] = useState(true);
  const refreshInFlightRef = useRef(null);
  const progressBySlotRef = useRef(progressBySlot);

  useEffect(() => {
    progressBySlotRef.current = progressBySlot;
  }, [progressBySlot]);

  const availableSlots = useMemo(
    () =>
      Object.entries(examenIdBySlot)
        .filter(([, id]) => Boolean(id))
        .map(([slot]) => Number(slot))
        .filter((n) => n > 0)
        .sort((a, b) => a - b),
    [examenIdBySlot],
  );

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const hasExistingData = Object.keys(progressBySlotRef.current).length > 0;
    if (!hasExistingData) setLoading(true);

    const promise = (async () => {
      try {
        const { data: levelData } = await getCachedB2Level(supabase);
        if (!levelData?.id) {
          setExamenIdBySlot({});
          setProgressBySlot({});
          return;
        }

        const idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, levelData.id);
        setExamenIdBySlot(idsBySlot);

        const uid = await getSessionUserId();
        if (!uid || !Object.keys(idsBySlot).length) {
          setProgressBySlot({});
          return;
        }

        const { bySlot } = await fetchB2PuntuacionesProgress(supabase, {
          userId: uid,
          examenIdBySlot: idsBySlot,
          partMin: 1,
          partMax: 17,
          partsInPaper: 17,
        });
        setProgressBySlot(bySlot);
      } finally {
        setLoading(false);
      }
    })();

    refreshInFlightRef.current = promise;
    try {
      await promise;
    } finally {
      if (refreshInFlightRef.current === promise) {
        refreshInFlightRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    const onProgressSaved = () => void refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener(LEVELS_PART_PROGRESS_SAVED_EVENT, onProgressSaved);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(LEVELS_PART_PROGRESS_SAVED_EVENT, onProgressSaved);
    };
  }, [refresh]);

  const slotsForProgress = availableSlots.length
    ? availableSlots
    : Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);

  return {
    progressBySlot,
    availableSlots: slotsForProgress,
    loading,
    refresh,
  };
}

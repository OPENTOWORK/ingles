'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedB2Level, getCachedB2ExamenIdsBySlot } from '@/utils/b2LevelCache';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';

/**
 * Progress for all B2 paper parts (1–17) — skill practice scores only.
 */
export function useB2StarsWayProgress() {
  const [progressBySlot, setProgressBySlot] = useState({});
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
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
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

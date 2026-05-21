'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot } from '@/utils/levelsLevelCache';
import { getSessionUserId } from '@/utils/levelsEstadisticas';

/**
 * Progreso y selector de examen (mismo patrón que B2) para cualquier nivel CEFR.
 */
export function useLevelExamScoringSession({ slug, partMin, partMax }) {
  const partsInPaper = partMax - partMin + 1;
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [progressBySlot, setProgressBySlot] = useState({});
  const [examPracticeOpen, setExamPracticeOpen] = useState(false);
  const [partFinishNotice, setPartFinishNotice] = useState(null);

  const refreshPuntuacionesProgress = useCallback(async () => {
    const uid = await getSessionUserId();
    if (!uid || !Object.keys(examenIdBySlot).length) return;
    const { bySlot } = await fetchB2PuntuacionesProgress(supabase, {
      userId: uid,
      examenIdBySlot,
      partMin,
      partMax,
      partsInPaper,
    });
    setProgressBySlot(bySlot);
  }, [examenIdBySlot, partMin, partMax, partsInPaper]);

  useEffect(() => {
    void (async () => {
      const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
      if (!levelData?.id) return;
      const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
      setExamenIdBySlot(idsBySlot);
    })();
  }, [slug]);

  useEffect(() => {
    if (!examPracticeOpen) return;
    void (async () => {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
      void refreshPuntuacionesProgress();
    })();
  }, [examPracticeOpen, refreshPuntuacionesProgress]);

  const handleSelectExam = useCallback((selectExamSlot, slot) => {
    selectExamSlot(slot);
    setExamPracticeOpen(true);
    setPartFinishNotice(null);
    void (async () => {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
    })();
  }, []);

  const getPartSavedScoreLabel = useCallback(
    (part, examSlot) => {
      const fromName = part.nombre?.match(/\d+/)?.[0];
      const partNumber = Number(part.partNumber ?? fromName ?? 0);
      const saved = progressBySlot[examSlot]?.parts?.[partNumber];
      if (!saved?.total) return null;
      return `${saved.correct}/${saved.total}`;
    },
    [progressBySlot],
  );

  return {
    partsInPaper,
    examenIdBySlot,
    progressBySlot,
    examPracticeOpen,
    partFinishNotice,
    setPartFinishNotice,
    handleSelectExam,
    refreshPuntuacionesProgress,
    getPartSavedScoreLabel,
  };
}

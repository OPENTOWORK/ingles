'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveB2PartPuntuacionIfComplete } from '@/utils/recordLevelsB2PartScore';
import { supabase } from '@/utils/supabaseClient';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import {
  getCachedLevelBySlug,
  getCachedExamenIdsBySlot,
  invalidateLevelExamCache,
} from '@/utils/levelsLevelCache';
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
  const [currentExamenId, setCurrentExamenId] = useState(null);
  const currentExamenIdRef = useRef(null);
  const lastSavedPartSigRef = useRef('');

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

  const reloadExamCatalog = useCallback(async () => {
    const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
    if (!levelData?.id) return;
    invalidateLevelExamCache(levelData.id);
    const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
    setExamenIdBySlot(idsBySlot);
  }, [slug]);

  useEffect(() => {
    void reloadExamCatalog();
  }, [reloadExamCatalog]);

  useEffect(() => {
    if (!examPracticeOpen) return;
    void (async () => {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
      void refreshPuntuacionesProgress();
    })();
  }, [examPracticeOpen, refreshPuntuacionesProgress]);

  const setExamenContext = useCallback((examenId) => {
    setCurrentExamenId(examenId);
    currentExamenIdRef.current = examenId;
  }, []);

  const handleSelectExam = useCallback((selectExamSlot, slot) => {
    selectExamSlot(slot);
    setExamPracticeOpen(true);
    setPartFinishNotice(null);
    lastSavedPartSigRef.current = '';
    void (async () => {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
    })();
  }, []);

  const resetPartNoticeOnPartChange = useCallback((examSlot, partNumber, progressBySlotLocal) => {
    const saved = progressBySlotLocal?.[examSlot]?.parts?.[partNumber];
    if (saved?.total) {
      setPartFinishNotice({
        type: 'saved',
        text: `Última nota guardada: ${saved.correct}/${saved.total}`,
      });
    } else {
      setPartFinishNotice(null);
    }
  }, []);

  const trySavePartProgress = useCallback(
    async ({ examSlot, partNumber, preguntaId, parteId, progress }) => {
      if (!progress?.complete) return { saved: false };
      const examenId = currentExamenIdRef.current;
      const uid = await getSessionUserId();
      if (!uid || !preguntaId || !examenId || !partNumber) return { saved: false };

      const sig = `${examSlot}:${partNumber}:${progress.correct}`;
      if (lastSavedPartSigRef.current === sig) return { saved: true, progress };

      const result = await saveB2PartPuntuacionIfComplete({
        userId: uid,
        preguntaId,
        parteId,
        examenId,
        partNumber,
        progress,
      });
      if (result.saved) {
        lastSavedPartSigRef.current = sig;
        void refreshPuntuacionesProgress();
      }
      return result;
    },
    [refreshPuntuacionesProgress, slug],
  );

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
    currentExamenId,
    setExamenContext,
    handleSelectExam,
    refreshPuntuacionesProgress,
    getPartSavedScoreLabel,
    resetPartNoticeOnPartChange,
    trySavePartProgress,
    reloadExamCatalog,
  };
}

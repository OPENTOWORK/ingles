'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { fetchB2PuntuacionesProgress } from '@/utils/levelsPuntuacionesProgress';
import { getCachedB2Level, getCachedB2ExamenIdsBySlot } from '@/utils/b2LevelCache';
import { invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { getB2PartScoring, getB2PartPassingPoints } from '@/utils/levelsB2PartScoring';
import { saveB2PartPuntuacionIfComplete } from '@/utils/recordLevelsB2PartScore';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';

function buildPartFinishNotice(progress, partNumber, { saved = true } = {}) {
  const v2 =
    isB2ScoringV2Enabled() && Number(partNumber) >= 1 && Number(partNumber) <= 7;
  const pointsEarned = progress.pointsEarned ?? progress.puntosObtenidos ?? progress.correct;
  const maxPoints = progress.maxPoints ?? progress.puntosMaximos ?? progress.total;
  return {
    passed: progress.passed,
    correct: v2 ? pointsEarned : progress.correct,
    total: v2 ? maxPoints : progress.total,
    passing: v2 ? getB2PartPassingPoints(partNumber) : progress.passing,
    scoringVersion: progress.scoringVersion ?? (v2 ? 2 : 1),
    v2LocalOnly: v2 && !saved,
  };
}

/**
 * Progreso, guardado y selector de examen compartido (partes partMin–partMax).
 */
export function useB2ExamScoringSession({ partMin, partMax }) {
  const partsInPaper = partMax - partMin + 1;
  const [b2LevelId, setB2LevelId] = useState(null);
  const [examenIdBySlot, setExamenIdBySlot] = useState({});
  const [progressBySlot, setProgressBySlot] = useState({});
  const [examPracticeOpen, setExamPracticeOpen] = useState(false);
  const [currentExamenId, setCurrentExamenId] = useState(null);
  const [partFinishNotice, setPartFinishNotice] = useState(null);
  const lastSavedPartSigRef = useRef('');
  const currentExamenIdRef = useRef(null);

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

  const reloadExamenCatalog = useCallback(async () => {
    const { data: levelData } = await getCachedB2Level(supabase);
    if (!levelData?.id) return;
    invalidateLevelExamCache(levelData.id);
    const idsBySlot = await getCachedB2ExamenIdsBySlot(supabase, levelData.id);
    setExamenIdBySlot(idsBySlot);
    setB2LevelId(levelData.id);
  }, []);

  useEffect(() => {
    void reloadExamenCatalog();
  }, [reloadExamenCatalog]);

  useEffect(() => {
    if (!examPracticeOpen || !Object.keys(examenIdBySlot).length) return;
    void refreshPuntuacionesProgress();
  }, [examPracticeOpen, examenIdBySlot, refreshPuntuacionesProgress]);

  const setExamenContext = useCallback((examenId) => {
    setCurrentExamenId(examenId);
    currentExamenIdRef.current = examenId;
  }, []);

  const handleSelectExam = useCallback((selectExamSlot, slot) => {
    selectExamSlot(slot);
    setExamPracticeOpen(true);
    setPartFinishNotice(null);
    lastSavedPartSigRef.current = '';
  }, []);

  const getPartSavedScoreLabel = useCallback(
    (part, examSlot) => {
      const partNumber = Number(part.nombre?.match(/\d+/)?.[0] || part.partNumber || 0);
      const saved = progressBySlot[examSlot]?.parts?.[partNumber];
      if (!saved?.total) return null;
      return `${saved.correct}/${saved.total}${saved.passed ? ' ✓' : ''}`;
    },
    [progressBySlot],
  );

  const trySavePartProgress = useCallback(
    async ({
      examSlot,
      partNumber,
      preguntaId,
      parteId,
      progress,
    }) => {
      if (!progress?.complete) return { saved: false };

      const examenId = currentExamenIdRef.current;
      const uid = await getSessionUserId();
      if (!uid || !preguntaId || !examenId || !partNumber) return { saved: false };

      const sig = `${examSlot}:${partNumber}:${
        progress.scoringVersion === 2
          ? progress.pointsEarned ?? progress.puntosObtenidos ?? progress.correct
          : progress.correct
      }`;
      if (lastSavedPartSigRef.current === sig) return { saved: true, progress };

      const result = await saveB2PartPuntuacionIfComplete({
        userId: uid,
        preguntaId,
        parteId,
        examenId,
        partNumber,
        progress,
      });

      if (result.error) {
        setPartFinishNotice({
          error: result.error?.message || String(result.error),
        });
        return result;
      }

      if (result.saved) {
        lastSavedPartSigRef.current = sig;
        void refreshPuntuacionesProgress();
      }

      setPartFinishNotice(buildPartFinishNotice(progress, partNumber, { saved: result.saved }));

      return result;
    },
    [refreshPuntuacionesProgress],
  );

  const saveWritingOrSpeakingScore = useCallback(
    async ({ examSlot, partNumber, preguntaId, parteId, correct, total, passed }) => {
      const progress = {
        complete: true,
        correct,
        total,
        passing: Math.ceil(total * 0.6),
        passed,
      };
      return trySavePartProgress({
        examSlot,
        partNumber,
        preguntaId,
        parteId,
        progress,
      });
    },
    [trySavePartProgress],
  );

  const resetPartNoticeOnPartChange = useCallback((examSlot, partNumber, progressBySlotLocal) => {
    lastSavedPartSigRef.current = '';
    const saved = progressBySlotLocal?.[examSlot]?.parts?.[partNumber];
    const cfg = getB2PartScoring(partNumber);
    if (saved?.total && cfg) {
      const v2 = isB2ScoringV2Enabled() && partNumber >= 1 && partNumber <= 7;
      const pointsEarned = saved.puntosObtenidos ?? saved.correct;
      const maxPoints = saved.puntosMaximos ?? saved.total;
      setPartFinishNotice({
        passed: saved.passed,
        correct: v2 ? pointsEarned : saved.correct,
        total: v2 ? maxPoints : saved.total,
        passing: v2 ? getB2PartPassingPoints(partNumber) : cfg.passing,
        scoringVersion: saved.scoringVersion ?? (v2 ? 2 : 1),
      });
    } else {
      setPartFinishNotice(null);
    }
  }, []);

  return {
    partsInPaper,
    b2LevelId,
    examenIdBySlot,
    progressBySlot,
    examPracticeOpen,
    setExamPracticeOpen,
    currentExamenId,
    partFinishNotice,
    setPartFinishNotice,
    refreshPuntuacionesProgress,
    setExamenContext,
    handleSelectExam,
    getPartSavedScoreLabel,
    trySavePartProgress,
    saveWritingOrSpeakingScore,
    resetPartNoticeOnPartChange,
    reloadExamenCatalog,
  };
}

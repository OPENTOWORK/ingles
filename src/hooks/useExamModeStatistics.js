'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import { fetchExamModeSlotStats } from '@/lib/fetchExamModeSlotStats';
import { mergeExamModeStatsRows } from '@/utils/examModeStatsRows';
import { computeExamModeStats } from '@/utils/examModeStats';

/**
 * Estadísticas del examen: plantilla con ceros + Supabase + sesión local.
 */
export function useExamModeStatistics(slug, examSlot) {
  const { session, ready, userId, repeatExam: repeatSession } = useExamModeSession(slug, examSlot);
  const [supabaseData, setSupabaseData] = useState({
    examenId: null,
    puntuaciones: [],
    estadisticas: [],
  });
  const [dbReady, setDbReady] = useState(false);

  const loadSupabase = useCallback(async () => {
    if (!userId) {
      setSupabaseData({ examenId: null, puntuaciones: [], estadisticas: [] });
      setDbReady(true);
      return;
    }
    try {
      const data = await fetchExamModeSlotStats(supabase, { userId, slug, examSlot });
      setSupabaseData(data);
    } catch {
      setSupabaseData({ examenId: null, puntuaciones: [], estadisticas: [] });
    } finally {
      setDbReady(true);
    }
  }, [userId, slug, examSlot]);

  useEffect(() => {
    setDbReady(false);
    void loadSupabase();
  }, [loadSupabase]);

  const { rows, estadisticas } = useMemo(
    () =>
      mergeExamModeStatsRows({
        slug,
        session: ready ? session : null,
        puntuacionesRows: supabaseData.puntuaciones,
        estadisticasRows: supabaseData.estadisticas,
      }),
    [slug, session, ready, supabaseData],
  );

  const stats = useMemo(() => computeExamModeStats(rows), [rows]);

  const refresh = useCallback(() => {
    void loadSupabase();
  }, [loadSupabase]);

  const repeatExam = useCallback(
    (options = {}) => repeatSession({ ...options, examenId: supabaseData.examenId }),
    [repeatSession, supabaseData.examenId],
  );

  return {
    rows,
    stats,
    estadisticas,
    examenId: supabaseData.examenId,
    session,
    ready: ready && dbReady,
    userId,
    repeatExam,
    refresh,
  };
}

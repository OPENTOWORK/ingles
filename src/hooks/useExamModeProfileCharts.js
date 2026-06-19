'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  fetchExamModeProfileCharts,
  mergeLocalExamModeIntoCharts,
} from '@/lib/aggregateExamModeProfileCharts';

/**
 * Exam-mode part scores for the profile chart (Supabase + local session fallback).
 */
export function useExamModeProfileCharts(userId) {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) {
      setCharts([]);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const remote = await fetchExamModeProfileCharts(supabase, userId);
      const merged = mergeLocalExamModeIntoCharts(remote, userId);
      setCharts(merged);
    } catch (err) {
      setError(err?.message || 'Could not load exam mode statistics.');
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return undefined;

    const onStorage = (event) => {
      if (event.key?.includes('dralo_exam_mode')) {
        void refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, [userId, refresh]);

  const hasAnyData = charts.some((c) => c.hasData);

  return { charts, loading, error, hasAnyData, refresh };
}

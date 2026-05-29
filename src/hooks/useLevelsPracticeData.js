'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { fetchLevelsPracticeData } from '@/lib/fetchLevelsPracticeData';

const cache = new Map();

export function getCachedLevelsPracticeData(userId) {
  return userId ? cache.get(userId) : null;
}

export function invalidateLevelsPracticeCache(userId) {
  if (userId) cache.delete(userId);
}

/**
 * Shared cache for levels_estadisticas / puntuaciones (Exam stats, Progress, Goals, etc.).
 */
export function useLevelsPracticeData(userId, { enabled = true } = {}) {
  const [data, setData] = useState(() => (userId ? cache.get(userId) ?? null : null));
  const [loading, setLoading] = useState(Boolean(enabled && userId && !cache.has(userId)));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false);
      return undefined;
    }

    const cached = cache.get(userId);
    if (cached) {
      setData(cached);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchLevelsPracticeData(supabase, userId)
      .then((result) => {
        if (cancelled) return;
        cache.set(userId, result);
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load practice data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, enabled]);

  return { data, loading, error };
}

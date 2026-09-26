'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

const OPEN = {
  loading: false,
  unlimited: true,
  lives: null,
  max: null,
  nextLifeAt: null,
  regenHours: null,
  error: '',
};

function fromPayload(json) {
  return {
    loading: false,
    unlimited: Boolean(json.unlimited),
    lives: json.unlimited ? null : Number(json.lives) || 0,
    max: json.unlimited ? null : Number(json.max) || 0,
    nextLifeAt: json.nextLifeAt || null,
    regenHours: json.regenHours ?? null,
    error: '',
  };
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

/**
 * Training lives for the signed-in student.
 * Pass `{ enabled: false }` when a parent already loaded them.
 */
export function useTrainingLives({ enabled = true, path = '/api/training/lives' } = {}) {
  const [state, setState] = useState(() => ({ ...OPEN, loading: enabled }));

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    const headers = await authHeaders();
    if (!headers) {
      setState(OPEN);
      return OPEN;
    }
    try {
      const res = await fetch(buildClientApiUrl(path), {
        headers,
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setState(OPEN);
        return OPEN;
      }
      if (!res.ok) {
        const next = { ...OPEN, unlimited: false, error: 'unavailable' };
        setState(next);
        return next;
      }
      const next = fromPayload(json);
      setState(next);
      return next;
    } catch {
      const next = { ...OPEN, unlimited: false, error: 'unavailable' };
      setState(next);
      return next;
    }
  }, [enabled, path]);

  const loseLife = useCallback(async () => {
    const headers = await authHeaders();
    if (!headers) return { unlimited: true, spent: false };
    try {
      const res = await fetch(buildClientApiUrl(path), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lose' }),
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState((current) => ({ ...current, error: 'unavailable' }));
        return { error: true };
      }
      const next = fromPayload(json);
      setState(next);
      return { ...next, spent: Boolean(json.spent) };
    } catch {
      setState((current) => ({ ...current, error: 'unavailable' }));
      return { error: true };
    }
  }, [path]);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.access_token) {
        setState(OPEN);
        return;
      }
      void refresh();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || state.loading || state.unlimited || state.error || !state.nextLifeAt) return undefined;
    const ms = new Date(state.nextLifeAt).getTime() - Date.now();
    const id = setTimeout(() => {
      void refresh();
    }, Math.min(Math.max(ms, 1000), 2147000000));
    return () => clearTimeout(id);
  }, [enabled, state.loading, state.unlimited, state.error, state.nextLifeAt, refresh]);

  return {
    ...state,
    outOfLives:
      enabled && !state.loading && !state.unlimited && !state.error && state.lives != null && state.lives <= 0,
    refresh,
    loseLife,
  };
}

export default useTrainingLives;

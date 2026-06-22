'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { supabase } from '@/utils/supabaseClient';
import {
  addExerciseFavorite,
  EXERCISE_FAVORITES_UPDATED_EVENT,
  isExerciseFavorite,
  removeExerciseFavorite,
} from '@/lib/exerciseFavoritesRepository';
import { buildExerciseFavoriteMeta } from '@/lib/exerciseFavoriteMeta';

/**
 * @param {string | null | undefined} preguntaId
 * @param {import('@/lib/exerciseFavoriteMeta').ExerciseFavoriteMeta | null} meta
 * @param {boolean} [enabled]
 */
export function useExerciseFavorite(preguntaId, meta, enabled = true) {
  const { session } = useUserRole();
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const userId = session?.user?.id ?? resolvedUserId;
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setResolvedUserId(session.user.id);
      return undefined;
    }

    let cancelled = false;

    const applySession = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id ?? null;
      if (!cancelled) setResolvedUserId(uid);
    };

    void applySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) setResolvedUserId(nextSession?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      authListener?.subscription?.unsubscribe();
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!enabled || !preguntaId || !userId) {
      setIsFavorite(false);
      setReady(Boolean(!enabled || !preguntaId || !userId));
      return;
    }

    let cancelled = false;
    setReady(false);
    void isExerciseFavorite(userId, preguntaId)
      .then((value) => {
        if (!cancelled) {
          setIsFavorite(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, preguntaId, userId]);

  useEffect(() => {
    if (!enabled || !preguntaId || !userId) return undefined;

    const handleUpdate = (event) => {
      if (event?.detail?.userId && event.detail.userId !== userId) return;
      void isExerciseFavorite(userId, preguntaId).then(setIsFavorite).catch(() => {});
    };

    window.addEventListener(EXERCISE_FAVORITES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(EXERCISE_FAVORITES_UPDATED_EVENT, handleUpdate);
  }, [enabled, preguntaId, userId]);

  const toggle = useCallback(async () => {
    if (!enabled || !preguntaId || !userId || !meta || busy) return false;
    setBusy(true);
    try {
      if (isFavorite) {
        await removeExerciseFavorite(userId, { preguntaId });
        setIsFavorite(false);
      } else {
        await addExerciseFavorite(userId, preguntaId, buildExerciseFavoriteMeta(meta));
        setIsFavorite(true);
      }
      return true;
    } catch (err) {
      console.warn('[exerciseFavorite] toggle failed', err?.message || err);
      return false;
    } finally {
      setBusy(false);
    }
  }, [enabled, preguntaId, userId, meta, isFavorite, busy]);

  return {
    userId,
    isFavorite,
    busy,
    ready,
    canToggle: Boolean(enabled && preguntaId && userId && meta),
    toggle,
  };
}

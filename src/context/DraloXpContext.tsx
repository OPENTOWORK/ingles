'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DraloLevelInfo } from '@/lib/dralo-levels';
import { getLevelInfo } from '@/lib/dralo-levels';
import {
  computeDraloXpReward,
  type DraloXpAwardInput,
} from '@/lib/draloXpRewards';
import { supabase } from '@/utils/supabaseClient';

type XpToast = { amount: number; id: number } | null;

type DraloXpContextValue = {
  totalXp: number;
  levelInfo: DraloLevelInfo;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  toast: XpToast;
  refresh: () => Promise<void>;
  addXp: (amount: number) => Promise<DraloLevelInfo | null>;
  awardForCorrectAnswer: (
    awardKey: string,
    input: DraloXpAwardInput,
  ) => Promise<number | null>;
  clearAwardKeys: () => void;
  dismissToast: () => void;
};

const DraloXpContext = createContext<DraloXpContextValue | null>(null);

const EMPTY = getLevelInfo(0);

async function fetchAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

export function DraloXpProvider({ children }: { children: ReactNode }) {
  const [totalXp, setTotalXp] = useState(0);
  const [levelInfo, setLevelInfo] = useState<DraloLevelInfo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<XpToast>(null);
  const awardedKeysRef = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await fetchAuthToken();
      if (!token) {
        setTotalXp(0);
        setLevelInfo(EMPTY);
        return;
      }
      const res = await fetch('/api/dralo/experience', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'No se pudo cargar el XP.');
      }
      const xp = Number(payload?.totalXp) || 0;
      setTotalXp(xp);
      setLevelInfo(payload?.levelInfo ?? getLevelInfo(xp));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar XP.';
      setError(msg);
      setTotalXp(0);
      setLevelInfo(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  const addXp = useCallback(async (amount: number) => {
    const delta = Math.floor(Number(amount));
    if (!Number.isFinite(delta) || delta <= 0) return null;

    const token = await fetchAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/dralo/experience', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: delta }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'No se pudo sumar XP.');
      }
      const xp = Number(payload?.totalXp) || 0;
      const info = payload?.levelInfo ?? getLevelInfo(xp);
      setTotalXp(xp);
      setLevelInfo(info);
      setToast({ amount: delta, id: Date.now() });
      window.setTimeout(() => setToast(null), 3200);
      return info as DraloLevelInfo;
    } catch (e) {
      console.warn('[DraloXp] addXp:', e);
      return null;
    }
  }, []);

  const awardForCorrectAnswer = useCallback(
    async (awardKey: string, input: DraloXpAwardInput) => {
      if (!awardKey || input.correct === false) return null;
      if (awardedKeysRef.current.has(awardKey)) return null;

      const amount = computeDraloXpReward({ ...input, correct: true });
      if (amount <= 0) return null;

      awardedKeysRef.current.add(awardKey);
      await addXp(amount);
      return amount;
    },
    [addXp],
  );

  const clearAwardKeys = useCallback(() => {
    awardedKeysRef.current.clear();
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo<DraloXpContextValue>(
    () => ({
      totalXp,
      levelInfo,
      loading,
      error,
      isEmpty: !loading && !error && totalXp === 0,
      toast,
      refresh,
      addXp,
      awardForCorrectAnswer,
      clearAwardKeys,
      dismissToast,
    }),
    [
      totalXp,
      levelInfo,
      loading,
      error,
      toast,
      refresh,
      addXp,
      awardForCorrectAnswer,
      clearAwardKeys,
      dismissToast,
    ],
  );

  return (
    <DraloXpContext.Provider value={value}>
      <DraloXpBootstrap onMount={refresh} />
      {children}
    </DraloXpContext.Provider>
  );
}

function DraloXpBootstrap({ onMount }: { onMount: () => Promise<void> }) {
  useEffect(() => {
    void onMount();
  }, [onMount]);
  return null;
}

export function useDraloXp(): DraloXpContextValue {
  const ctx = useContext(DraloXpContext);
  if (!ctx) {
    throw new Error('useDraloXp must be used within DraloXpProvider');
  }
  return ctx;
}

/** Safe hook for optional provider (outside Dralo AI layout). */
export function useDraloXpOptional(): DraloXpContextValue | null {
  return useContext(DraloXpContext);
}

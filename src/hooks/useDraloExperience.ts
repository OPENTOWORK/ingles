'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DraloLevelInfo } from '@/lib/dralo-levels';
import { getLevelInfo } from '@/lib/dralo-levels';
import { supabase } from '@/utils/supabaseClient';

export type DraloExperienceState = {
  totalXp: number;
  levelInfo: DraloLevelInfo;
  hasRecord: boolean;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  tablesReady: boolean;
  refresh: () => Promise<void>;
};

const EMPTY_LEVEL = getLevelInfo(0);

export function useDraloExperience(accessToken?: string | null): DraloExperienceState {
  const [totalXp, setTotalXp] = useState(0);
  const [levelInfo, setLevelInfo] = useState<DraloLevelInfo>(EMPTY_LEVEL);
  const [hasRecord, setHasRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tablesReady, setTablesReady] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let token = accessToken ?? null;
      if (!token) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token ?? null;
      }

      if (!token) {
        setTotalXp(0);
        setLevelInfo(EMPTY_LEVEL);
        setHasRecord(false);
        setTablesReady(true);
        return;
      }

      const res = await fetch('/api/dralo/experience', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 503 && payload?.tablesReady === false) {
          setTablesReady(false);
          setTotalXp(0);
          setLevelInfo(EMPTY_LEVEL);
          setHasRecord(false);
          setError(payload?.error || 'Tablas de experiencia no disponibles.');
          return;
        }
        throw new Error(payload?.error || 'No se pudo cargar la experiencia.');
      }

      const xp = Number(payload?.totalXp) || 0;
      setTotalXp(xp);
      setLevelInfo(payload?.levelInfo ?? getLevelInfo(xp));
      setHasRecord(Boolean(payload?.hasRecord));
      setTablesReady(payload?.tablesReady !== false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar experiencia.';
      setError(msg);
      setTotalXp(0);
      setLevelInfo(EMPTY_LEVEL);
      setHasRecord(false);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    totalXp,
    levelInfo,
    hasRecord,
    loading,
    error,
    isEmpty: !loading && !error && totalXp === 0,
    tablesReady,
    refresh,
  };
}

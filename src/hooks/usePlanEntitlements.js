'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

/**
 * Plan + cuotas del alumno (API /api/subscription/entitlements).
 */
export function usePlanEntitlements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        if (mountedRef.current) {
          setData(null);
          setLoading(false);
        }
        return null;
      }

      const res = await fetch(buildClientApiUrl('/api/subscription/entitlements'), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        if (mountedRef.current) setData(null);
        return null;
      }

      const json = await res.json();
      if (mountedRef.current) setData(json);
      return json;
    } catch {
      if (mountedRef.current) setData(null);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const maxExamSlot = data?.maxExamSlot ?? 1;
  const applyLimits = Boolean(data?.applyLimits);

  const isExamSlotLocked = useCallback(
    (slot) => applyLimits && Number(slot) > maxExamSlot,
    [applyLimits, maxExamSlot],
  );

  return {
    data,
    loading,
    refresh,
    planSlug: data?.planSlug ?? 'free',
    applyLimits,
    maxExamSlot,
    subscriptionMonths: data?.subscriptionMonths ?? null,
    plusExamUnlock: data?.plusExamUnlock ?? null,
    entitlements: data?.entitlements ?? null,
    usage: data?.usage ?? null,
    progressTracking: Boolean(data?.progressTracking),
    writingAdvanced: Boolean(data?.writingAdvanced),
    isExamSlotLocked,
  };
}

export default usePlanEntitlements;

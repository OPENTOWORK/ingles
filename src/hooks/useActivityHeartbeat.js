'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_INITIAL_DELAY_MS } from '@/lib/userActivity';

export function useActivityHeartbeat(session, enabled = true) {
  const lastPingRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled || !session?.access_token) return undefined;

    let intervalId = null;
    let cancelled = false;

    const sendHeartbeat = async () => {
      if (cancelled || document.visibilityState === 'hidden') return;

      const now = Date.now();
      const deltaSeconds = Math.min(
        120,
        Math.max(5, Math.round((now - lastPingRef.current) / 1000)),
      );
      lastPingRef.current = now;

      try {
        await fetch('/api/activity/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ deltaSeconds }),
          keepalive: true,
        });
      } catch {
        /* red silenciosa */
      }
    };

    const startInterval = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void sendHeartbeat();
        }
      }, HEARTBEAT_INTERVAL_MS);
    };

    const initialTimer = window.setTimeout(() => {
      if (cancelled) return;
      void sendHeartbeat();
      startInterval();
    }, HEARTBEAT_INITIAL_DELAY_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        void sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      void sendHeartbeat();
    };
  }, [enabled, session?.access_token]);
}

'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { HEARTBEAT_INTERVAL_MS } from '@/lib/userActivity';

export function useActivityHeartbeat(session) {
  const lastPingRef = useRef(Date.now());

  useEffect(() => {
    if (!session?.access_token) return undefined;

    const sendHeartbeat = async () => {
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

    void sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        void sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onHide);
      void sendHeartbeat();
    };
  }, [session?.access_token]);
}

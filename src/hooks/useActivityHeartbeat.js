'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_INITIAL_DELAY_MS } from '@/lib/userActivity';
import { detectClientDeviceType } from '@/lib/clientDeviceType';
import { isDevLightweightMode } from '@/lib/devRuntime';

export function useActivityHeartbeat(session, enabled = true) {
  const lastPingRef = useRef(Date.now());
  const deviceTypeRef = useRef(null);

  useEffect(() => {
    if (isDevLightweightMode() || !enabled || !session?.access_token) return undefined;

    deviceTypeRef.current = detectClientDeviceType();
    // No arrastres tiempo de una sesión/render anterior al activar el tracker.
    lastPingRef.current = Date.now();

    let intervalId = null;
    let cancelled = false;

    const sendHeartbeat = async ({ allowHidden = false, allowCancelled = false } = {}) => {
      if ((!allowCancelled && cancelled) || (!allowHidden && document.visibilityState === 'hidden')) {
        return;
      }

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
          body: JSON.stringify({
            deltaSeconds,
            deviceType: deviceTypeRef.current,
          }),
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
        // Guarda el tramo visible justo antes de que la pestaña pase a segundo plano.
        void sendHeartbeat({ allowHidden: true });
        return;
      }

      // El tiempo pasado con la pestaña oculta no es actividad de Dralo.
      lastPingRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);

      // El cleanup puede ejecutarse al navegar/cerrar la página. Envía primero el último
      // tramo visible y marca después el tracker como cancelado.
      void sendHeartbeat({ allowHidden: true, allowCancelled: true });
      cancelled = true;
    };
  }, [enabled, session?.access_token]);
}

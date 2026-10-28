'use client';

import { useEffect, useRef } from 'react';
import {
  ACTIVITY_IDLE_TIMEOUT_MS,
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_INITIAL_DELAY_MS,
} from '@/lib/userActivity';
import { detectClientDeviceType } from '@/lib/clientDeviceType';
import { isDevLightweightMode } from '@/lib/devRuntime';

const MIN_RECORDED_DELTA_SECONDS = 5;

export function useActivityHeartbeat(session, enabled = true) {
  const lastPingRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  const deviceTypeRef = useRef(null);

  useEffect(() => {
    if (isDevLightweightMode() || !enabled || !session?.access_token) return undefined;

    const startedAt = Date.now();
    lastPingRef.current = startedAt;
    lastActivityRef.current = startedAt;
    deviceTypeRef.current = detectClientDeviceType();

    let intervalId = null;
    let cancelled = false;

    const markActivity = () => {
      const now = Date.now();
      const wasIdle = now - lastActivityRef.current > ACTIVITY_IDLE_TIMEOUT_MS;
      lastActivityRef.current = now;

      // Si el usuario vuelve tras un periodo largo de inactividad, no rellenamos ese hueco.
      if (wasIdle) {
        lastPingRef.current = now;
      }
    };

    const sendHeartbeat = async ({ allowHidden = false, force = false } = {}) => {
      if (cancelled && !force) return;
      if (!allowHidden && document.visibilityState === 'hidden') return;

      const now = Date.now();
      const previousPing = lastPingRef.current || now;
      const activeUntil = Math.min(now, lastActivityRef.current + ACTIVITY_IDLE_TIMEOUT_MS);
      const activeMs = Math.max(0, activeUntil - previousPing);
      const deltaSeconds = Math.min(120, Math.round(activeMs / 1000));

      // Avanzamos el reloj aunque no guardemos nada para no recontar intervalos.
      lastPingRef.current = now;

      if (deltaSeconds < MIN_RECORDED_DELTA_SECONDS) return;

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
      intervalId = window.setInterval(() => {
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
        // Guardamos el último tramo visible antes de pausar.
        void sendHeartbeat({ allowHidden: true, force: true });
        return;
      }

      // Al volver, comenzamos a contar desde este momento; nunca sumamos el tiempo oculto.
      const now = Date.now();
      lastPingRef.current = now;
      lastActivityRef.current = now;
    };

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(initialTimer);
      if (intervalId) window.clearInterval(intervalId);

      // Guardar antes de cancelar evita perder el tramo final de la sesión.
      void sendHeartbeat({ allowHidden: true, force: true });
      cancelled = true;

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, session?.access_token]);
}

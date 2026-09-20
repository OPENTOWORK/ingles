'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { classifyStudyPath } from '@/lib/studyFocus';
import {
  mergeStudyReportWithBuffer,
  STUDY_CONSENT_VERSION,
  STUDY_IDLE_THRESHOLD_MS,
  STUDY_PING_INTERVAL_MS,
} from '@/lib/studySession';

const TICK_MS = 5000;
const INPUT_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

function emptyBuffer() {
  return {
    focusSeconds: 0,
    awaySeconds: 0,
    idleSeconds: 0,
    awayEvents: 0,
    longestAwaySeconds: 0,
    areas: {},
  };
}

function hasBufferedTime(buffer) {
  return (
    buffer.focusSeconds > 0 ||
    buffer.awaySeconds > 0 ||
    buffer.idleSeconds > 0 ||
    buffer.awayEvents > 0
  );
}

/**
 * Sesión de estudio monitorizada, con consentimiento explícito del alumno.
 *
 * Mide tres estados: foco (Dralo en primer plano y con interacción), ausencia
 * (pestaña oculta o ventana sin foco) e inactividad. El navegador no expone a
 * qué sitio va el alumno cuando se ausenta, así que solo se registra que salió.
 */
export function useStudySession(session) {
  const pathname = usePathname();
  const accessToken = session?.access_token || null;

  const [activeSession, setActiveSession] = useState(null);
  const [report, setReport] = useState(null);
  const [liveReport, setLiveReport] = useState(null);
  const [lastSummary, setLastSummary] = useState(null);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  const bufferRef = useRef(emptyBuffer());
  const lastTickRef = useRef(Date.now());
  const lastInputRef = useRef(Date.now());
  const isAwayRef = useRef(false);
  const awayStartRef = useRef(null);
  const forcedIdleRef = useRef(false);
  const areaRef = useRef(null);
  const sessionIdRef = useRef(null);

  areaRef.current = classifyStudyPath(pathname).area;
  sessionIdRef.current = activeSession?.id || null;

  const authFetch = useCallback(
    (url, options = {}) =>
      fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(options.headers || {}),
        },
      }),
    [accessToken],
  );

  const drainBuffer = useCallback(() => {
    const payload = bufferRef.current;
    bufferRef.current = emptyBuffer();
    return payload;
  }, []);

  /** Reparte el tiempo transcurrido entre foco, ausencia e inactividad. */
  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.round((now - lastTickRef.current) / 1000);
    lastTickRef.current = now;
    if (elapsed <= 0) return;

    const buffer = bufferRef.current;
    if (isAwayRef.current) {
      buffer.awaySeconds += elapsed;
      return;
    }
    if (forcedIdleRef.current || now - lastInputRef.current > STUDY_IDLE_THRESHOLD_MS) {
      buffer.idleSeconds += elapsed;
      return;
    }

    buffer.focusSeconds += elapsed;
    const area = areaRef.current;
    if (area) buffer.areas[area] = (buffer.areas[area] || 0) + elapsed;
  }, []);

  const start = useCallback(async () => {
    if (!accessToken || starting) return false;
    setStarting(true);
    setError('');

    let idleDetectionGranted = false;
    let idleDetector = null;
    if (typeof window !== 'undefined' && 'IdleDetector' in window) {
      try {
        const permission = await window.IdleDetector.requestPermission();
        if (permission === 'granted') {
          idleDetector = new window.IdleDetector();
          await idleDetector.start({ threshold: STUDY_IDLE_THRESHOLD_MS });
          idleDetectionGranted = true;
        }
      } catch {
        /* El alumno puede negarlo: el seguimiento sigue con foco de pestaña. */
      }
    }

    try {
      const res = await authFetch('/api/estudio/sesion', {
        method: 'POST',
        body: JSON.stringify({
          consentVersion: STUDY_CONSENT_VERSION,
          idleDetectionGranted,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo iniciar la sesión.');
        return false;
      }

      bufferRef.current = emptyBuffer();
      lastTickRef.current = Date.now();
      lastInputRef.current = Date.now();
      isAwayRef.current = false;
      awayStartRef.current = null;
      forcedIdleRef.current = false;

      setActiveSession(data.session);
      setReport(data.report);
      setLastSummary(null);
      return true;
    } catch {
      setError('No se pudo conectar con el servidor.');
      return false;
    } finally {
      setStarting(false);
    }
  }, [accessToken, authFetch, starting]);

  const finish = useCallback(async () => {
    if (!sessionIdRef.current || finishing) return null;
    setFinishing(true);
    tick();

    try {
      const res = await authFetch('/api/estudio/sesion/finalizar', {
        method: 'POST',
        body: JSON.stringify({ sessionId: sessionIdRef.current, ...drainBuffer() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo cerrar la sesión.');
        return null;
      }

      setActiveSession(null);
      setReport(null);
      setLastSummary({ report: data.report, resumen: data.resumen, source: data.resumenSource });
      return data;
    } catch {
      setError('No se pudo conectar con el servidor.');
      return null;
    } finally {
      setFinishing(false);
    }
  }, [authFetch, drainBuffer, finishing, tick]);

  const dismissSummary = useCallback(() => setLastSummary(null), []);

  // Recupera una sesión que siguiera abierta (recarga de página, otra pestaña).
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await authFetch('/api/estudio/sesion');
        const data = await res.json().catch(() => ({}));
        if (cancelled || !res.ok || !data.session) return;
        lastTickRef.current = Date.now();
        lastInputRef.current = Date.now();
        setActiveSession(data.session);
        setReport(data.report);
      } catch {
        /* sin sesión previa */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, authFetch]);

  // Estado de foco e inactividad mientras la sesión está activa.
  useEffect(() => {
    if (!activeSession) return undefined;

    const markInput = () => {
      lastInputRef.current = Date.now();
      forcedIdleRef.current = false;
    };

    const leave = () => {
      if (isAwayRef.current) return;
      tick();
      isAwayRef.current = true;
      awayStartRef.current = Date.now();
      bufferRef.current.awayEvents += 1;
    };

    const enter = () => {
      if (!isAwayRef.current) return;
      tick();
      isAwayRef.current = false;
      if (awayStartRef.current) {
        const seconds = Math.round((Date.now() - awayStartRef.current) / 1000);
        bufferRef.current.longestAwaySeconds = Math.max(
          bufferRef.current.longestAwaySeconds,
          seconds,
        );
      }
      awayStartRef.current = null;
      markInput();
    };

    const onVisibility = () => (document.visibilityState === 'hidden' ? leave() : enter());

    document.addEventListener('visibilitychange', onVisibility);
    INPUT_EVENTS.forEach((event) =>
      window.addEventListener(event, markInput, { passive: true }),
    );

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      INPUT_EVENTS.forEach((event) => window.removeEventListener(event, markInput));
    };
  }, [activeSession, tick]);

  // Contador en pantalla sin esperar al ping de 30 s.
  useEffect(() => {
    if (!activeSession || !report) {
      setLiveReport(null);
      return undefined;
    }

    const refresh = () => {
      tick();
      setLiveReport(mergeStudyReportWithBuffer(report, bufferRef.current));
    };

    refresh();
    const uiTicker = setInterval(refresh, 1000);
    return () => clearInterval(uiTicker);
  }, [activeSession, report, tick]);

  // Contabilidad continua y envío periódico de contadores.
  useEffect(() => {
    if (!activeSession) return undefined;

    const ticker = setInterval(tick, TICK_MS);
    const pinger = setInterval(async () => {
      tick();
      const payload = bufferRef.current;
      if (!hasBufferedTime(payload)) return;

      try {
        const res = await authFetch('/api/estudio/sesion/ping', {
          method: 'POST',
          body: JSON.stringify({ sessionId: sessionIdRef.current, ...drainBuffer() }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.report) setReport(data.report);
        if (res.status === 409) setActiveSession(null);
      } catch {
        /* se reintenta en el siguiente ping */
      }
    }, STUDY_PING_INTERVAL_MS);

    return () => {
      clearInterval(ticker);
      clearInterval(pinger);
    };
  }, [activeSession, authFetch, drainBuffer, tick]);

  // Al cerrar la pestaña, el último tramo se envía con sendBeacon.
  useEffect(() => {
    if (!activeSession) return undefined;

    const flush = () => {
      tick();
      const payload = bufferRef.current;
      if (!hasBufferedTime(payload) || !navigator.sendBeacon) return;
      navigator.sendBeacon(
        '/api/estudio/sesion/ping',
        new Blob([JSON.stringify({ sessionId: sessionIdRef.current, ...drainBuffer() })], {
          type: 'application/json',
        }),
      );
    };

    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [activeSession, drainBuffer, tick]);

  const displayReport = liveReport || report;

  return {
    activeSession,
    report: displayReport,
    lastSummary,
    starting,
    finishing,
    error,
    start,
    finish,
    dismissSummary,
  };
}

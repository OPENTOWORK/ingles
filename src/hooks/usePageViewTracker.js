'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getPageTitleForPath } from '@/lib/pageViewLabels';
import { isTrackedPublicPath, readOrCreateVisitorId } from '@/lib/visitorPresence';

const MIN_DURATION_SEC = 2;

export function usePageViewTracker(session, enabled = true) {
  const pathname = usePathname();
  const pathRef = useRef(null);
  const enteredAtRef = useRef(Date.now());
  const visitedAtRef = useRef(null);
  const lastFlushKeyRef = useRef('');

  const flushView = async (path, durationSeconds, visitedAtIso) => {
    if (!path || durationSeconds < MIN_DURATION_SEC || !isTrackedPublicPath(path)) return;

    const flushKey = `${path}|${visitedAtIso || ''}|${durationSeconds}`;
    if (lastFlushKeyRef.current === flushKey) return;
    lastFlushKeyRef.current = flushKey;

    const visitorId = readOrCreateVisitorId();
    if (!session?.access_token && !visitorId) return;

    try {
      await fetch('/api/activity/page-view/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          visitorId,
          path,
          pageTitle: getPageTitleForPath(path),
          durationSeconds,
          visitedAt: visitedAtIso,
        }),
        keepalive: true,
      });
    } catch {
      /* red silenciosa */
    }
  };

  useEffect(() => {
    if (!enabled) return undefined;

    const now = Date.now();
    const previousPath = pathRef.current;

    if (previousPath && previousPath !== pathname) {
      const durationSeconds = Math.round((now - enteredAtRef.current) / 1000);
      void flushView(previousPath, durationSeconds, visitedAtRef.current);
    }

    pathRef.current = pathname;
    enteredAtRef.current = now;
    visitedAtRef.current = new Date(now).toISOString();

    const onHide = () => {
      if (document.visibilityState !== 'hidden' || !pathRef.current) return;
      const durationSeconds = Math.round((Date.now() - enteredAtRef.current) / 1000);
      void flushView(pathRef.current, durationSeconds, visitedAtRef.current);
      enteredAtRef.current = Date.now();
      visitedAtRef.current = new Date().toISOString();
    };

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      if (!pathRef.current) return;
      const durationSeconds = Math.round((Date.now() - enteredAtRef.current) / 1000);
      void flushView(pathRef.current, durationSeconds, visitedAtRef.current);
    };
  }, [enabled, session?.access_token, pathname]);
}

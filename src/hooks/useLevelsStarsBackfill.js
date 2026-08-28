'use client';

import { useEffect, useRef } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/** Wait until initial navigation has settled before background sync work. */
const BACKFILL_DEFER_MS = 15000;

/**
 * Once per browser session: backfill Levels_stars from puntuaciones + sync exam-mode local sessions.
 */
export function useLevelsStarsBackfill(session) {
  const ranRef = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || ranRef.current) return undefined;

    ranRef.current = true;
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      void (async () => {
        try {
          const token = session.access_token;
          if (!token || cancelled) return;

          const { syncExamModeLocalSessionsToSupabase } = await import(
            '@/utils/syncExamModeLocalSessions'
          );
          if (!cancelled) {
            void syncExamModeLocalSessionsToSupabase(userId, 'b2');
          }

          await fetch(buildClientApiUrl('/api/levels/sync-stars'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            keepalive: true,
          });
        } catch (err) {
          console.warn('[useLevelsStarsBackfill]', err?.message || err);
        }
      })();
    }, BACKFILL_DEFER_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.user?.id, session?.access_token]);
}

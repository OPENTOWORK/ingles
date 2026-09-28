'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { readBrowserTrafficFields } from '@/lib/trafficSource';
import { readOrCreateVisitorId } from '@/lib/visitorPresence';

async function sendVisit(visitorId, accessToken, heartbeat = false) {
  const traffic = readBrowserTrafficFields();
  await fetch('/api/activity/visitor/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ visitorId, heartbeat, ...traffic }),
    keepalive: true,
  });
}

/** Cuenta una visita aunque no haya cuenta, y la enlaza si luego inicia sesión. */
export default function VisitorPresence() {
  useEffect(() => {
    const visitorId = readOrCreateVisitorId();
    if (!visitorId) return undefined;
    let cancelled = false;

    let token = '';
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (cancelled) return;
      token = sessionData?.session?.access_token || '';
      sendVisit(visitorId, token || undefined).catch(() => {});
    });

    const ping = () => {
      if (cancelled || document.visibilityState === 'hidden') return;
      sendVisit(visitorId, token || undefined, true).catch(() => {});
    };

    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      sendVisit(visitorId, token || undefined, true).catch(() => {});
    };

    const intervalId = window.setInterval(ping, 15000);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      token = session?.access_token || '';
      if (!token) return;
      sendVisit(visitorId, token).catch(() => {});
    });

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}

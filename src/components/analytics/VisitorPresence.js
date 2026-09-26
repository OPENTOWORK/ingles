'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { readBrowserTrafficFields } from '@/lib/trafficSource';

const STORAGE_KEY = 'dralo_visitor_id';
const VISITOR_ID_PATTERN = /^vis_[a-f0-9]{32}$/;

function readOrCreateVisitorId() {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (VISITOR_ID_PATTERN.test(existing || '')) return existing;
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    const visitorId = `vis_${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
    window.localStorage.setItem(STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return null;
  }
}

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

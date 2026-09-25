'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

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

async function sendVisit(visitorId, accessToken) {
  await fetch('/api/activity/visitor/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ visitorId }),
    keepalive: true,
  });
}

/** Cuenta una visita aunque no haya cuenta, y la enlaza si luego inicia sesión. */
export default function VisitorPresence() {
  useEffect(() => {
    const visitorId = readOrCreateVisitorId();
    if (!visitorId) return undefined;

    sendVisit(visitorId).catch(() => {});

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token;
      if (!token) return;
      sendVisit(visitorId, token).catch(() => {});
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}

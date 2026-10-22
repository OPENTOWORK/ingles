'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getGuestRegisterHref } from '@/lib/guestPreviewAccess';
import styles from './GuestCloseRegisterPrompt.module.css';

const LEAVE_MESSAGE = 'Si quieres guardar tus progresos, regístrate.';
const PRACTICE_HUB_PATH = '/exam-practice/b2';
const PRACTICE_PROMPT_DELAY_MS = 60_000;

function normalizePath(pathname = '') {
  return String(pathname || '').replace(/\/$/, '') || '/';
}

function isAuthScreen(pathname = '') {
  const path = normalizePath(pathname);
  return path === '/login' || path === '/registro' || path.startsWith('/auth');
}

function isB2PracticeHub(pathname = '') {
  return normalizePath(pathname) === PRACTICE_HUB_PATH;
}

export default function GuestCloseRegisterPrompt() {
  const pathname = usePathname() ?? '';
  const [guest, setGuest] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const onAuthScreen = isAuthScreen(pathname);
  const active = guest && !onAuthScreen && !dismissed;

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setGuest(!data.session?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setGuest(!session?.user);
      if (session?.user) setOpen(false);
    });
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!active || !isB2PracticeHub(pathname)) {
      setOpen(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setOpen(true), PRACTICE_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, pathname]);

  if (!open || !active) return null;

  const registerHref = getGuestRegisterHref(
    `${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`,
  );

  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="guest-close-title">
        <h2 id="guest-close-title" className={styles.title}>
          {LEAVE_MESSAGE}
        </h2>
        <div className={styles.actions}>
          <Link href={registerHref} className={styles.cta} onClick={() => setDismissed(true)}>
            Regístrate
          </Link>
          <button type="button" className={styles.dismiss} onClick={() => setDismissed(true)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

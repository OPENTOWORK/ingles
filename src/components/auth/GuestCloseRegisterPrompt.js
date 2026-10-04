'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getGuestRegisterHref } from '@/lib/guestPreviewAccess';
import styles from './GuestCloseRegisterPrompt.module.css';

const LEAVE_MESSAGE = 'Si quieres guardar tus progresos, regístrate.';

function isAuthScreen(pathname = '') {
  const path = String(pathname || '').replace(/\/$/, '') || '/';
  return path === '/login' || path === '/registro' || path.startsWith('/auth');
}

/** El cursor sale por arriba, hacia el botón de cerrar la ventana. */
export function isWindowCloseIntent(event) {
  if (!event || event.relatedTarget || event.toElement) return false;
  return Number(event.clientY) <= 0;
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
    if (!active) return undefined;
    const onLeave = (event) => {
      if (isWindowCloseIntent(event)) setOpen(true);
    };
    document.documentElement.addEventListener('mouseout', onLeave);
    return () => document.documentElement.removeEventListener('mouseout', onLeave);
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = LEAVE_MESSAGE;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [active]);

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

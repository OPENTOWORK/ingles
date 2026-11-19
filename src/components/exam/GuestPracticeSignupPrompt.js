'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { buildSignupHref } from '@/lib/signupTracking';
import styles from './GuestPracticeSignupPrompt.module.css';

const DISMISS_KEY = 'dralo_post_practice_signup_dismissed';

/** Aviso no bloqueante al ver las respuestas sin cuenta. */
export default function GuestPracticeSignupPrompt({ open }) {
  const [signedIn, setSignedIn] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [latched, setLatched] = useState(false);
  const [href, setHref] = useState('/registro/?src=post_practice');

  useEffect(() => {
    if (open) setLatched(true);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data?.session?.user));
    });
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') setDismissed(true);
    } catch {
      /* si no hay almacenamiento, se puede cerrar igual en esta visita */
    }
    setHref(buildSignupHref(window.location.search, 'post_practice'));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!latched || signedIn !== false || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* el estado local basta para esta visita */
    }
  };

  return (
    <aside className={styles.prompt} role="dialog" aria-labelledby="guest-practice-signup-title" aria-modal="false">
      <h2 id="guest-practice-signup-title" className={styles.title}>
        Ya sabes cómo es esta parte. Ahora sigue practicando.
      </h2>
      <p className={styles.text}>
        Crea tu cuenta para practicar el resto de partes del examen y recibir feedback sobre tus respuestas.
      </p>
      <div className={styles.actions}>
        <Link href={href} className={styles.primary}>
          Crear mi cuenta gratis
        </Link>
        <button type="button" className={styles.later} onClick={close}>
          Ahora no
        </button>
      </div>
    </aside>
  );
}

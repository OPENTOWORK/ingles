'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createGoogleIdTokenNonce,
  getGoogleClientId,
  loadGoogleIdentityScript,
} from '@/lib/googleIdentity';
import { isDraloAppSurface } from '@/lib/draloAppShell';
import { supabase } from '@/utils/supabaseClient';
import { useReadingNightMode } from '@/hooks/useReadingNightMode';
import styles from './GoogleIdentityButton.module.css';

const PREVIEW_QUERY_KEYS = ['itPreviewApp', 'itPreviewPlatform', 'itPreviewRole', '_itPreview', 'next'];

function googleMustStayInThisWindow() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  return isDraloAppSurface();
}

async function startGoogleRedirect() {
  const redirectTo = new URL('/auth/callback/', window.location.origin);
  const current = new URLSearchParams(window.location.search);
  for (const key of PREVIEW_QUERY_KEYS) {
    const value = current.get(key);
    if (value) redirectTo.searchParams.set(key, value);
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export default function GoogleIdentityButton({
  onCredential,
  onUnavailable,
  disabled = false,
}) {
  const hostRef = useRef(null);
  const nonceRef = useRef('');
  const onCredentialRef = useRef(onCredential);
  const onUnavailableRef = useRef(onUnavailable);
  const [failed, setFailed] = useState(!getGoogleClientId());
  const [redirectMode, setRedirectMode] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const isNight = useReadingNightMode();

  onCredentialRef.current = onCredential;
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (googleMustStayInThisWindow()) {
      setRedirectMode(true);
      return undefined;
    }

    const clientId = getGoogleClientId();
    if (!clientId) {
      setFailed(true);
      onUnavailableRef.current?.();
      return undefined;
    }

    let cancelled = false;

    const render = async () => {
      try {
        const google = await loadGoogleIdentityScript();
        if (cancelled || !hostRef.current || !google?.accounts?.id) {
          throw new Error('Google Identity no está listo.');
        }

        const { nonce, hashedNonce } = await createGoogleIdTokenNonce();
        if (cancelled) return;
        nonceRef.current = nonce;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) return;
            onCredentialRef.current?.({
              credential: response.credential,
              nonce: nonceRef.current,
            });
          },
          nonce: hashedNonce,
          ux_mode: 'popup',
          context: 'signin',
          auto_select: false,
          itp_support: true,
          use_fedcm_for_prompt: true,
        });

        hostRef.current.innerHTML = '';
        const width = Math.max(240, Math.min(400, Math.round(hostRef.current.clientWidth || 320)));
        google.accounts.id.renderButton(hostRef.current, {
          type: 'standard',
          theme: isNight ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width,
        });
      } catch (error) {
        console.error('[google-identity]', error);
        if (!cancelled) {
          setFailed(true);
          onUnavailableRef.current?.();
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [isNight]);

  if (redirectMode) {
    return (
      <button
        type="button"
        className="login-page__google"
        disabled={disabled || redirecting}
        onClick={() => {
          if (disabled || redirecting) return;
          setRedirecting(true);
          startGoogleRedirect().catch((error) => {
            console.error('[google-identity] redirect', error);
            setRedirecting(false);
            onUnavailableRef.current?.();
          });
        }}
      >
        <span className="login-page__google-icon" aria-hidden>
          <svg viewBox="0 0 48 48" width="18" height="18">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </span>
        {redirecting ? 'Abriendo Google…' : 'Continuar con Google'}
      </button>
    );
  }

  if (failed) return null;

  return (
    <div
      className={`${styles.wrap}${disabled ? ` ${styles.disabled}` : ''}`}
      aria-busy={disabled ? 'true' : 'false'}
    >
      <div ref={hostRef} className={styles.buttonHost} />
    </div>
  );
}

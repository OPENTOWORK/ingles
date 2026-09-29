'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createGoogleIdTokenNonce,
  getGoogleClientId,
  loadGoogleIdentityScript,
} from '@/lib/googleIdentity';
import { useReadingNightMode } from '@/hooks/useReadingNightMode';
import styles from './GoogleIdentityButton.module.css';

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
  const isNight = useReadingNightMode();

  onCredentialRef.current = onCredential;
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
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

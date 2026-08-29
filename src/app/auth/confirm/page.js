'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import SiteMascot from '@/components/SiteMascot';

/**
 * Canjea en el navegador los enlaces de correo (confirmar email, recuperar
 * contraseña).
 *
 * Se hace en cliente a propósito: así la sesión queda donde el SDK del
 * navegador la busca, y los antivirus de correo que precargan enlaces no
 * pueden gastar el token, porque no ejecutan JavaScript.
 */

const VALID_TYPES = ['signup', 'magiclink', 'recovery', 'invite', 'email', 'email_change'];

const DEFAULT_NEXT_BY_TYPE = {
  recovery: '/update-password',
  signup: '/perfil',
  magiclink: '/perfil',
  invite: '/perfil',
  email: '/perfil',
  email_change: '/perfil',
};

function safeNext(value, type) {
  const fallback = DEFAULT_NEXT_BY_TYPE[type] || '/perfil';
  const raw = String(value || '').trim();
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

function readParams() {
  if (typeof window === 'undefined') return () => null;
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return (key) => {
    const value = query.get(key) ?? hash.get(key);
    return value && value !== 'null' && value !== 'undefined' ? value : null;
  };
}

function describeError(rawMessage, type) {
  const text = String(rawMessage || '').toLowerCase();
  if (text.includes('expired')) {
    return type === 'recovery'
      ? 'El enlace para cambiar la contraseña ha caducado. Los enlaces duran 1 hora.'
      : 'El enlace de confirmación ha caducado. Pide uno nuevo desde la página de acceso.';
  }
  if (text.includes('already') || text.includes('used')) {
    return type === 'recovery'
      ? 'Este enlace ya se había usado. Pide uno nuevo para cambiar la contraseña.'
      : 'Este enlace ya se había usado. Si tu cuenta ya está confirmada, inicia sesión con tu contraseña.';
  }
  return type === 'recovery'
    ? 'El enlace no es válido. Pide uno nuevo desde «¿Has olvidado tu contraseña?».'
    : 'El enlace de confirmación no es válido. Pide uno nuevo desde la página de acceso.';
}

function AuthConfirmInner() {
  const [error, setError] = useState('');
  const [type, setType] = useState('magiclink');
  const startedRef = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo y el token es de un solo uso.
    if (startedRef.current) return;
    startedRef.current = true;

    const get = readParams();
    const linkType = get('type') || 'magiclink';
    setType(linkType);

    const next = safeNext(get('next'), linkType);

    const run = async () => {
      const errorParam = get('error_description') || get('error');
      if (errorParam) {
        setError(describeError(errorParam, linkType));
        return;
      }

      const tokenHash = get('token_hash');
      const code = get('code');

      if (!tokenHash && !code) {
        setError(describeError('', linkType));
        return;
      }

      if (tokenHash && !VALID_TYPES.includes(linkType)) {
        setError(describeError('', linkType));
        return;
      }

      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: linkType,
        });
        if (verifyError) {
          setError(describeError(verifyError.message, linkType));
          return;
        }
      } else {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          const { data } = await supabase.auth.getSession();
          if (!data?.session) {
            setError(describeError(exchangeError.message, linkType));
            return;
          }
        }
      }

      // replace() para que el botón «atrás» no vuelva a un token ya gastado.
      window.location.replace(next);
    };

    run().catch((err) => {
      console.error('[auth/confirm]', err);
      setError(describeError(err?.message, linkType));
    });
  }, []);

  if (error) {
    return (
      <main className="login-page" style={mainStyle}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', lineHeight: 0 }}>
          <SiteMascot variant={8} width={110} alt="" />
        </div>
        <h2 style={headingStyle}>No hemos podido abrir el enlace</h2>
        <p className="login-page__error" style={errorStyle}>{error}</p>
        <Link href={type === 'recovery' ? '/reset-password' : '/login'} style={buttonStyle}>
          {type === 'recovery' ? 'Pedir un enlace nuevo' : 'Ir a iniciar sesión'}
        </Link>
      </main>
    );
  }

  return (
    <main className="login-page" style={mainStyle}>
      <div style={{ textAlign: 'center', marginBottom: '1rem', lineHeight: 0 }}>
        <SiteMascot variant={3} width={110} alt="" />
      </div>
      <h2 style={headingStyle}>
        {type === 'recovery' ? 'Abriendo tu enlace…' : 'Confirmando tu email…'}
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b' }}>Un momento, por favor.</p>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page" style={mainStyle}>
          <h2 style={headingStyle}>Cargando…</h2>
        </main>
      }
    >
      <AuthConfirmInner />
    </Suspense>
  );
}

const mainStyle = {
  maxWidth: '420px',
  margin: '4rem auto',
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Segoe UI, sans-serif',
};

const headingStyle = { textAlign: 'center', marginBottom: '1rem' };

const errorStyle = {
  marginBottom: '1.25rem',
  padding: '0.75rem',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  color: '#b91c1c',
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const buttonStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '0.75rem',
  backgroundColor: '#0070f3',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '4px',
  textDecoration: 'none',
};

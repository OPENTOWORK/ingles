'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import SiteMascot from '@/components/SiteMascot';

const LINK_ERRORS = {
  link_expired:
    'El enlace ha caducado. Los enlaces duran 1 hora; pide uno nuevo y ábrelo cuanto antes.',
  link_used:
    'Ese enlace ya se había usado. Pide uno nuevo para crear tu contraseña.',
  link_invalid:
    'El enlace no es válido. Pide uno nuevo y ábrelo directamente desde el correo.',
};

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const linkError = searchParams.get('error');
    if (linkError && linkError !== 'null') {
      setError(LINK_ERRORS[linkError] || LINK_ERRORS.link_invalid);
    }
  }, [searchParams]);

  /** Correo nativo de Supabase: red de seguridad si nuestro envío no está disponible. */
  const sendWithSupabase = async (redirectBase) => {
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/update-password`,
    });
    return supabaseError;
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Introduce un email válido.');
      return;
    }

    setSending(true);
    const redirectBase =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
      let response = null;
      let data = {};
      try {
        response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        });
        data = await response.json().catch(() => ({}));
      } catch {
        response = null;
      }

      if (response?.ok && data.ok) {
        setSent(true);
        return;
      }

      if (response?.status === 429) {
        setError(data.error || 'Demasiadas peticiones. Espera unos minutos.');
        return;
      }

      if (response && response.status !== 404 && data.code !== 'NO_SERVICE_ROLE' && data.error) {
        console.warn('[reset-password] envío propio falló, usando Supabase:', data.error);
      }

      const supabaseError = await sendWithSupabase(redirectBase);
      if (supabaseError) {
        setError(
          supabaseError.message ||
            'No hemos podido enviar el correo. Inténtalo de nuevo o escríbenos desde Contacto.',
        );
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="login-page" style={authMainStyle}>
      <div style={{ textAlign: 'center', marginBottom: '1rem', lineHeight: 0 }}>
        <SiteMascot variant={8} width={120} alt="" />
      </div>
      <h2 style={authHeadingStyle}>Recuperar Contraseña</h2>

      {!sent ? (
        <form onSubmit={handlePasswordReset}>
          {error && (
            <p className="login-page__error" style={errorStyle}>
              {error}
            </p>
          )}
          <label htmlFor="reset-email" style={authLabelStyle}>Email</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            style={authInputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            style={{
              ...authButtonStyle,
              backgroundColor: sending ? '#94a3b8' : authButtonStyle.backgroundColor,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
            disabled={sending}
          >
            {sending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className="login-page__success">Enlace enviado. Revisa tu correo.</p>
          <p style={hintStyle}>
            Si no lo ves en unos minutos, mira en spam o promociones. El enlace caduca en 1 hora y
            solo se puede usar una vez.
          </p>
        </div>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page" style={{ ...authMainStyle, textAlign: 'center' }}>
          Cargando…
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

const authMainStyle = {
  maxWidth: '400px',
  margin: '4rem auto',
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Segoe UI, sans-serif',
};

const authHeadingStyle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
};

const authLabelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
};

const authInputStyle = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const authButtonStyle = {
  width: '100%',
  padding: '0.75rem',
  marginTop: '1.5rem',
  backgroundColor: '#0070f3',
  color: 'white',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const errorStyle = {
  marginBottom: '1rem',
  padding: '0.75rem',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  color: '#b91c1c',
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const hintStyle = {
  marginTop: '0.75rem',
  fontSize: '0.85rem',
  color: '#64748b',
  lineHeight: 1.5,
};

'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import SiteMascot from '@/components/SiteMascot';
import { landingFont } from '@/components/home/landing/landingFont';

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
    <main className={`login-page ${landingFont.variable}`} style={authMainStyle}>
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
              ...(sending ? { background: '#c4b8f5', boxShadow: 'none', cursor: 'not-allowed' } : null),
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
        <main className={`login-page ${landingFont.variable}`} style={{ ...authMainStyle, textAlign: 'center' }}>
          Cargando…
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

const authMainStyle = {
  maxWidth: '440px',
  margin: '2.75rem auto 3rem',
  padding: '2rem 1.75rem 1.75rem',
  backgroundColor: '#fff',
  borderRadius: '28px',
  border: '1px solid #e0d6ff',
  boxShadow: '0 18px 44px rgba(76, 56, 170, 0.12)',
  color: '#4a4769',
};

const authHeadingStyle = {
  textAlign: 'center',
  margin: '0 0 1.5rem',
  color: '#1d1857',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  fontSize: '1.65rem',
};

const authLabelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#1d1857',
  fontWeight: 700,
  fontSize: '0.92rem',
};

const authInputStyle = {
  width: '100%',
  padding: '0.8rem 0.95rem',
  fontSize: '1rem',
  border: '1.5px solid #e0d6ff',
  borderRadius: '14px',
  boxSizing: 'border-box',
  color: '#1d1857',
  background: '#fff',
};

const authButtonStyle = {
  width: '100%',
  padding: '0.9rem 1.35rem',
  marginTop: '1.5rem',
  background: 'linear-gradient(135deg, #8466ff 0%, #6545ec 55%, #5333d6 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(99, 67, 236, 0.32)',
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

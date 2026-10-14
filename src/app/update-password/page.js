'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import PasswordInput from '@/components/PasswordInput';
import { landingFont } from '@/components/home/landing/landingFont';

const PASSWORD_RULES = [
  { id: 'length', label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'Un número', test: (p) => /\d/.test(p) },
];

/** Supabase manda los errores en la query o en el hash según el flujo. */
function readLinkParams() {
  if (typeof window === 'undefined') return { get: () => null };
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return { get: (key) => query.get(key) || hash.get(key) };
}

function formatAuthError(error, fallback = 'Ha ocurrido un error. Inténtalo de nuevo.') {
  if (!error) return fallback;
  const raw = String(error.message || error.msg || error.error || '').trim();
  if (!raw || raw === 'null' || raw === 'undefined') return fallback;
  return raw;
}

function describeLinkError(code, description) {
  const raw = `${code || ''} ${description || ''}`.toLowerCase();
  if (raw.includes('expired')) {
    return 'El enlace ha caducado. Los enlaces duran 1 hora; pide uno nuevo y ábrelo cuanto antes.';
  }
  if (raw.includes('already') || raw.includes('used')) {
    return 'Ese enlace ya se había usado. Pide uno nuevo para crear tu contraseña.';
  }
  return 'El enlace no es válido o ha caducado. Pide uno nuevo desde «¿Has olvidado tu contraseña?».';
}

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const resolvedRef = useRef(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(newPassword) }));
  const passwordIsStrong = passwordChecks.every((rule) => rule.passed);

  const markReady = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setStatus('ready');
    setError('');
    // Quitamos el token de la URL para que no quede en historial ni capturas.
    window.history.replaceState({}, '', '/update-password');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      const { get } = readLinkParams();

      const errorCode = get('error_code') || get('error');
      if (errorCode && errorCode !== 'null') {
        resolvedRef.current = true;
        setStatus('invalid');
        setError(describeLinkError(errorCode, get('error_description')));
        return;
      }

      const tokenHash = get('token_hash');
      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: get('type') || 'recovery',
        });
        if (!cancelled && verifyError) {
          resolvedRef.current = true;
          setStatus('invalid');
          setError(
            describeLinkError(verifyError.message, verifyError.message) ||
              'El enlace no es válido o ha caducado.',
          );
          return;
        }
      }

      const code = get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }

      for (let attempt = 0; attempt < 20 && !cancelled && !resolvedRef.current; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          markReady();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      if (cancelled || resolvedRef.current) return;
      resolvedRef.current = true;
      setStatus('invalid');
      setError(describeLinkError('', ''));
    };

    establishSession();

    return () => {
      cancelled = true;
    };
  }, [markReady]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordIsStrong) {
      setError('La contraseña debe cumplir los cuatro requisitos de abajo.');
      return;
    }

    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError('La sesión de recuperación ha caducado. Pide un enlace nuevo y ábrelo de inmediato.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(
          formatAuthError(
            updateError,
            'No se pudo actualizar la contraseña. Pide un enlace nuevo e inténtalo otra vez.',
          ),
        );
        return;
      }

      // Cerramos la sesión de recuperación para que entren con la nueva contraseña.
      await supabase.auth.signOut().catch(() => {});
      setStatus('updated');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`login-page ${landingFont.variable}`} style={authMainStyle}>
      <h2 style={authHeadingStyle}>Nueva contraseña</h2>

      {status === 'checking' && (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Comprobando el enlace…</p>
      )}

      {status === 'invalid' && (
        <div>
          <p className="login-page__error" style={errorStyle}>{error}</p>
          <Link href="/reset-password" style={linkButtonStyle}>
            Pedir un enlace nuevo
          </Link>
        </div>
      )}

      {status === 'ready' && (
        <form onSubmit={handleUpdate}>
          {error && <p className="login-page__error" style={errorStyle}>{error}</p>}
          <label htmlFor="new-password" style={authLabelStyle}>
            Introduce tu nueva contraseña
          </label>
          <PasswordInput
            id="new-password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={authInputStyle}
            autoComplete="new-password"
          />
          <ul style={rulesListStyle}>
            {passwordChecks.map((rule) => (
              <li key={rule.id} style={{ color: rule.passed ? '#15803d' : '#64748b' }}>
                {rule.passed ? '✓' : '·'} {rule.label}
              </li>
            ))}
          </ul>
          <button
            type="submit"
            style={{
              ...authButtonStyle,
              ...(saving ? { background: '#c4b8f5', boxShadow: 'none', cursor: 'not-allowed' } : null),
            }}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </form>
      )}

      {status === 'updated' && (
        <p className="login-page__success" style={{ textAlign: 'center' }}>
          Contraseña actualizada. Redirigiendo al login...
        </p>
      )}
    </main>
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

const linkButtonStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '0.9rem 1.35rem',
  background: 'linear-gradient(135deg, #8466ff 0%, #6545ec 55%, #5333d6 100%)',
  color: '#fff',
  fontWeight: 700,
  borderRadius: '999px',
  textDecoration: 'none',
  boxShadow: '0 10px 24px rgba(99, 67, 236, 0.32)',
};

const rulesListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: '0.75rem 0 0',
  fontSize: '0.85rem',
  lineHeight: 1.7,
};

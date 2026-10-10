'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRedirectPathByUserId, getRedirectPathByRoleName, peekCachedRoleName } from '@/utils/authRoles';
import {
  destinationAfterLogin,
  isPhoneViewport,
  markOpenMainMenuAfterLogin,
} from '@/utils/postAuthNavigation';
import { completeSignIn } from '@/utils/completeSignIn';
import { reportLoginAttempt } from '@/utils/reportLoginAttempt';
import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { clearLogoutPending } from '@/utils/logout';
import toast from 'react-hot-toast';
import SiteMascot from '@/components/SiteMascot';
import PasswordInput from '@/components/PasswordInput';
import GoogleIdentityButton from '@/components/auth/GoogleIdentityButton';
import { getGoogleClientId } from '@/lib/googleIdentity';
import { readAttributionFromSearch } from '@/lib/abExperiment';
import { trackRegistrationStart } from '@/lib/abExperimentTrack';

const LOGIN_GREETINGS = [
  '¡Tu B2 empieza aquí! 🚀',
  '¡Vamos a por ese aprobado! 🎯',
  '¡Qué alegría verte por aquí! 💜',
  '¡Entra, que tenemos mucho que practicar!',
  '¡Cada ejercicio te acerca a tu B2!',
  '¡Hoy puede ser un gran día para mejorar tu inglés!',
  '¡Ey! ¿Preparado para superar tu próximo examen?',
  '¡Yo te ayudo a dominar el B2! 💪',
  '¡Un poquito de práctica hoy, un gran resultado mañana!',
  '¡Tu próximo aprobado empieza con un clic!',
  '¡Hey! 👋 ¿Listo para conseguir tu B2?',
];

function isAuthOrLandingNextPath(path = '') {
  const p = String(path || '').split('?')[0];
  return (
    p === '/login' ||
    p.startsWith('/login/') ||
    p === '/registro' ||
    p.startsWith('/registro/') ||
    p.startsWith('/auth/') ||
    p.startsWith('/reset-password') ||
    p.startsWith('/update-password') ||
    p.startsWith('/campana') ||
    p.startsWith('/preparar-b2')
  );
}

function getSafeNextPath(searchParams) {
  const next = searchParams?.get('next')?.trim();
  if (!next || !next.startsWith('/') || next.startsWith('//') || isAuthOrLandingNextPath(next)) {
    return null;
  }
  return next;
}

async function resolvePostLoginPath(user, searchParams) {
  const nextPath = getSafeNextPath(searchParams);
  const phone = isPhoneViewport();

  let path;
  if (nextPath) {
    path = destinationAfterLogin({ nextPath, phone });
  } else {
    const cachedRole = peekCachedRoleName(user.id);
    const rolePath = cachedRole
      ? getRedirectPathByRoleName(cachedRole)
      : await getRedirectPathByUserId(user.id, user.email);
    path = destinationAfterLogin({ rolePath, phone });
  }

  if (path === '/' && phone) markOpenMainMenuAfterLogin();
  return path;
}

/** Mensajes de /auth/confirm cuando un enlace de correo no se puede canjear. */
let lastLoginErrorToastKey = '';
let lastLoginErrorToastAt = 0;

const LINK_ERRORS = {
  link_expired: 'El enlace del correo ha caducado. Inicia sesión con tu contraseña o pide uno nuevo.',
  link_used: 'Ese enlace ya se había usado. Inicia sesión con tu email y contraseña.',
  link_invalid: 'El enlace del correo no es válido. Inicia sesión con tu email y contraseña.',
  oauth_state:
    'La conexión con Google caducó antes de volver. Pulsa Continuar con Google otra vez y acepta el acceso enseguida.',
};

function LoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  /** Email cuya cuenta existe pero sigue sin confirmar. */
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resendState, setResendState] = useState('idle');
  const [showGoogleOAuthFallback, setShowGoogleOAuthFallback] = useState(!getGoogleClientId());
  const [googleLoading, setGoogleLoading] = useState(false);
  const [greeting, setGreeting] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const index = Math.floor(Math.random() * LOGIN_GREETINGS.length);
    setGreeting(LOGIN_GREETINGS[index]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      clearLogoutPending();
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;
      const path = await resolvePostLoginPath(session.user, searchParams);
      if (!cancelled) router.replace(path);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    const attribution = readAttributionFromSearch(searchParams.toString());
    if (attribution) trackRegistrationStart(attribution);
  }, [searchParams]);

  const registerHref = (() => {
    const query = searchParams.toString();
    return query ? `/registro/?${query}` : '/registro';
  })();

  useEffect(() => {
    const errorCode = searchParams.get('error_code');
    const linkError = searchParams.get('error');
    const key =
      errorCode === 'bad_oauth_state' || linkError === 'oauth_state'
        ? 'oauth_state'
        : linkError && linkError !== 'null'
          ? linkError
          : '';
    if (!key) return;

    const now = Date.now();
    if (lastLoginErrorToastKey === key && now - lastLoginErrorToastAt < 1500) return;
    lastLoginErrorToastKey = key;
    lastLoginErrorToastAt = now;

    toast.error(key === 'oauth_state' ? LINK_ERRORS.oauth_state : LINK_ERRORS[key] || LINK_ERRORS.link_invalid);
  }, [searchParams]);

  useEffect(() => {
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setFailedAttempts(0);
      setLockoutUntil(null);
    }
  }, [lockoutUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast.error("Demasiados intentos fallidos. Intenta de nuevo en unos segundos.");
      return;
    }

    if (!email || !password) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, introduce un email válido.");
      return;
    }

    setLoading(true);
    setUnconfirmedEmail('');
    setResendState('idle');
    const loadingToast = toast.loading("Iniciando sesión...");
    clearLogoutPending();

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      const message = error.message.toLowerCase();

      // La contraseña es correcta pero falta verificar el buzón: no es un
      // intento fallido, así que no cuenta para el bloqueo temporal.
      if (error.code === 'email_not_confirmed' || message.includes('email not confirmed')) {
        setUnconfirmedEmail(email.trim().toLowerCase());
        reportLoginAttempt({ email, code: 'email_not_confirmed' });
        toast.error('Tu email todavía no está confirmado.');
        return;
      }

      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setLockoutUntil(Date.now() + 30 * 1000);
          toast.error("Has superado el número de intentos. Espera 30 segundos.");
        }
        return next;
      });

      if (message.includes("invalid login credentials")) {
        reportLoginAttempt({ email, code: 'invalid_credentials' });
        toast.error("Email o contraseña incorrectos. Revisa que el email esté bien escrito.");
      } else if (message.includes("user not found")) {
        reportLoginAttempt({ email, code: 'user_not_found' });
        toast.error("Usuario no encontrado.");
      } else if (message.includes('rate limit') || error.code === 'over_request_rate_limit') {
        reportLoginAttempt({ email, code: 'rate_limit' });
        toast.error("Ha ocurrido un error inesperado. Intenta más tarde.");
      } else {
        console.error("Error desconocido de Supabase:", error);
        reportLoginAttempt({ email, code: 'unexpected' });
        toast.error("Ha ocurrido un error inesperado. Intenta más tarde.");
      }
      return;
    }

    const result = await completeSignIn(signInData);

    toast.dismiss(loadingToast);
    setLoading(false);

    if (!result.ok) {
      console.error('completeSignIn failed:', result.reason, result.error);
      reportLoginAttempt({ email, code: 'session_not_saved' });
      toast.error('No se pudo guardar la sesión. Inténtalo de nuevo.');
      return;
    }

    toast.success("Inicio de sesión exitoso");
    setFailedAttempts(0);
    void ensureAppUserProfile().catch(() => {});

    const path = await resolvePostLoginPath(result.user, searchParams);
    router.replace(path);
  };

  const handleResendConfirmation = async () => {
    setResendState('sending');
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unconfirmedEmail }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendState('idle');
        if (res.status === 429 || data.code === 'RATE_LIMIT') {
          toast.error(
            data.error ||
              'Has pedido demasiados correos seguidos. Espera unos minutos y revisa spam.',
          );
        } else {
          toast.error(data.error || 'No se pudo reenviar el correo. Inténtalo en unos minutos.');
        }
        return;
      }

      if (data.alreadyConfirmed) {
        setUnconfirmedEmail('');
        setResendState('idle');
        toast.success(data.message);
        return;
      }

      setResendState('sent');
      toast.success(data.message || 'Correo de confirmación reenviado.');
    } catch {
      setResendState('idle');
      toast.error('No se pudo reenviar el correo. Comprueba tu conexión.');
    }
  };

  const handleOAuthLogin = async (provider) => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      console.error(`Error OAuth (${provider}):`, error);
      reportLoginAttempt({
        code: 'oauth_failed',
        provider: provider === 'google' ? 'google' : '',
      });
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('provider is not enabled') || msg.includes('unsupported provider')) {
        toast.error(
          `El proveedor ${provider} no está habilitado en Supabase. Actívalo en Authentication → Providers.`
        );
      } else {
        toast.error('No se pudo iniciar sesión con ' + provider + '. ' + error.message);
      }
    }
  };

  const handleGoogleIdToken = async ({ credential, nonce }) => {
    if (!credential || googleLoading) return;
    setGoogleLoading(true);
    const loadingToast = toast.loading('Iniciando sesión con Google...');
    clearLogoutPending();

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
      nonce,
    });

    if (error) {
      toast.dismiss(loadingToast);
      setGoogleLoading(false);
      console.error('[login] google id token', error);
      reportLoginAttempt({ code: 'oauth_failed', provider: 'google' });
      toast.error('No se pudo iniciar sesión con Google. Prueba el botón de respaldo.');
      setShowGoogleOAuthFallback(true);
      return;
    }

    const result = await completeSignIn(data);
    toast.dismiss(loadingToast);
    setGoogleLoading(false);

    if (!result.ok) {
      console.error('completeSignIn failed:', result.reason, result.error);
      reportLoginAttempt({
        email: data?.user?.email || '',
        code: 'session_not_saved',
        provider: 'google',
      });
      toast.error('No se pudo guardar la sesión. Inténtalo de nuevo.');
      return;
    }

    toast.success('Inicio de sesión exitoso');
    void ensureAppUserProfile().catch(() => {});
    const path = await resolvePostLoginPath(result.user, searchParams);
    router.replace(path);
  };

  return (
    <main className="login-page" style={styles.main}>
      <div className="login-page__mascot">
        <SiteMascot variant={3} width={132} alt="Dralo te da la bienvenida" />
        {greeting ? <p className="login-page__bubble">{greeting}</p> : null}
      </div>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login / Register</h2>

      {unconfirmedEmail && (
        <div style={styles.noticeBox}>
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
            Confirma tu email para entrar
          </strong>
          <p style={{ margin: '0 0 0.75rem' }}>
            Enviamos un enlace de confirmación a <strong>{unconfirmedEmail}</strong>. Ábrelo y
            podrás iniciar sesión. Mira también en spam o promociones.
          </p>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>
            Si ya abriste el enlace, pulsa <strong>Login</strong> de nuevo: no hace falta reenviar
            el correo.
          </p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resendState !== 'idle'}
            style={{
              ...styles.noticeButton,
              cursor: resendState === 'idle' ? 'pointer' : 'default',
              opacity: resendState === 'idle' ? 1 : 0.7,
            }}
          >
            {resendState === 'sending'
              ? 'Enviando…'
              : resendState === 'sent'
                ? 'Correo reenviado'
                : 'Reenviar correo de confirmación'}
          </button>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" style={{ ...styles.label, marginTop: "1rem" }}>Password</label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: loading ? "#999" : styles.button.backgroundColor,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Login"}
        </button>

        <p style={styles.linkText}>
          <a href="/reset-password" style={styles.link}>¿Has olvidado tu contraseña?</a>
        </p>
        <p style={styles.linkText}>
          ¿No tienes cuenta? <a href={registerHref} style={styles.link}>Regístrate</a>
        </p>
      </form>

      <p className="login-page__divider" role="separator">
        <span>o</span>
      </p>

      <GoogleIdentityButton
        disabled={googleLoading}
        onCredential={handleGoogleIdToken}
        onUnavailable={() => setShowGoogleOAuthFallback(true)}
      />
      {showGoogleOAuthFallback ? (
        <button
          type="button"
          className="login-page__google"
          onClick={() => handleOAuthLogin('google')}
          disabled={googleLoading}
        >
          <span className="login-page__google-icon" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          </span>
          Continuar con Google
        </button>
      ) : (
        <button
          type="button"
          className="login-page__google-fallback"
          onClick={() => handleOAuthLogin('google')}
        >
          Si el botón no carga, continúa aquí
        </button>
      )}
    </main>
  );
}

const styles = {
  main: {
    maxWidth: "400px",
    margin: "4rem auto",
    padding: "2rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    fontFamily: "Segoe UI, sans-serif",
  },
  label: { display: "block", marginBottom: "0.5rem" },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    marginTop: "1.5rem",
    backgroundColor: "#0070f3",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  linkText: { marginTop: "1rem", fontSize: "0.9rem", textAlign: "center", color: "#666" },
  link: { color: "#0070f3", textDecoration: "none" },
  noticeBox: {
    marginBottom: "1.25rem",
    padding: "0.9rem 1rem",
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: "8px",
    color: "#78350f",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  noticeButton: {
    width: "100%",
    padding: "0.6rem",
    backgroundColor: "#b45309",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="login-page" style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</main>}>
      <LoginPageInner />
    </Suspense>
  );
}

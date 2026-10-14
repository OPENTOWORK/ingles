'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import {
  getRedirectPathByRoleName,
  getRedirectPathByUserId,
  normalizeEmail,
  peekCachedRoleName,
} from '@/utils/authRoles';
import { mapSignupErrorMessage } from '@/utils/authSignupErrors';
import SiteMascot from '@/components/SiteMascot';
import PasswordInput from '@/components/PasswordInput';
import GoogleIdentityButton from '@/components/auth/GoogleIdentityButton';
import { getGoogleClientId } from '@/lib/googleIdentity';
import { FORM_LEGAL_SNIPPETS } from '@/lib/legal/legalDocuments';
import { detectClientDeviceType } from '@/lib/clientDeviceType';
import { readAttributionFromSearch, FOUNDING_OFFER } from '@/lib/abExperiment';
import { trackRegistrationComplete, trackRegistrationStart } from '@/lib/abExperimentTrack';
import { completeSignIn } from '@/utils/completeSignIn';
import { reportLoginAttempt } from '@/utils/reportLoginAttempt';
import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { clearLogoutPending } from '@/utils/logout';
import { landingFont } from '@/components/home/landing/landingFont';
import {
  destinationAfterLogin,
  isPhoneViewport,
  markOpenMainMenuAfterLogin,
} from '@/utils/postAuthNavigation';

const PASSWORD_RULES = [
  { id: 'length', label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'Un número', test: (p) => /\d/.test(p) },
];

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProtection, setAcceptedDataProtection] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [fromCampaign, setFromCampaign] = useState(false);
  const [showGoogleOAuthFallback, setShowGoogleOAuthFallback] = useState(!getGoogleClientId());
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const attribution = readAttributionFromSearch(window.location.search);
    if (attribution) {
      setFromCampaign(attribution.pageType === 'campaign');
      trackRegistrationStart(attribution);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ref = new URLSearchParams(window.location.search).get('ref')?.trim();
    if (!ref) return;
    try {
      sessionStorage.setItem('dralo_referral_token', ref);
    } catch {
      /* ignore */
    }
  }, []);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const passwordIsStrong = passwordChecks.every((rule) => rule.passed);

  const persistMarketingConsent = async (userId, userEmail, marketingAccepted) => {
    if (!userId) return;

    const attempts = [
      () =>
        supabase
          .from('user_profiles')
          .update({ consentimiento_comercial: marketingAccepted })
          .eq('id', userId),
      () =>
        supabase
          .from('user_profiles')
          .update({ marketing_updates: marketingAccepted })
          .eq('id', userId),
      () =>
        supabase
          .from('user_profiles')
          .update({
            metadata: {
              legal_acceptance: {
                marketing_updates: marketingAccepted,
                updated_at: new Date().toISOString(),
              },
            },
          })
          .eq('id', userId),
      () =>
        supabase
          .from('user_profiles')
          .upsert(
            {
              id: userId,
              email: userEmail,
              consentimiento_comercial: marketingAccepted,
            },
            { onConflict: 'id' }
          ),
    ];

    for (const runAttempt of attempts) {
      try {
        const { error } = await runAttempt();
        if (!error) return;
      } catch (_error) {
        // Intento siguiente
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const normalizedNombre = nombre.trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Introduce un email válido.');
      return;
    }

    if (!acceptedTerms || !acceptedDataProtection) {
      toast.error('Debes aceptar Términos y condiciones y Protección de datos para registrarte.');
      return;
    }

    // Supabase cifra/hash de forma segura la password, pero reforzamos validación mínima.
    if (!passwordIsStrong) {
      setShowPasswordRules(true);
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Creando cuenta…');

    const legal_acceptance = {
      terms_and_conditions: true,
      data_protection: true,
      marketing_updates: Boolean(acceptedMarketing),
      accepted_at: new Date().toISOString(),
    };
    const registrationDevice = detectClientDeviceType();

    const tryServerRegister = async () => {
      const storedRef =
        (typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('ref')?.trim() ||
            sessionStorage.getItem('dralo_referral_token')?.trim() ||
            ''
          : '');

      let res;
      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            nombre: normalizedNombre,
            acceptedTerms: true,
            acceptedDataProtection: true,
            acceptedMarketing,
            referralToken: storedRef || undefined,
            deviceType: registrationDevice,
          }),
        });
      } catch {
        return { ok: false, useFallback: true, data: {} };
      }

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.ok) {
        return { ok: true, data, useFallback: false };
      }

      const useFallback =
        res.status === 404 ||
        res.status === 0 ||
        (res.status === 503 && data.code === 'NO_SERVICE_ROLE');

      return { ok: false, data, res, useFallback };
    };

    const tryClientSignUp = async () => {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            role: 'student',
            ...(normalizedNombre ? { name: normalizedNombre } : {}),
            legal_acceptance,
            registration_device: registrationDevice,
          },
        },
      });
      return { data, error };
    };

    const completeClientSignUp = async () => {
      const { data, error } = await tryClientSignUp();
      if (error) {
        toast.error(mapSignupErrorMessage(error.message));
        return false;
      }
      await persistMarketingConsent(data?.user?.id, normalizedEmail, acceptedMarketing);
      if (data?.session?.access_token) {
        try {
          await fetch('/api/auth/ensure-profile', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceType: registrationDevice }),
          });
        } catch {
          /* perfil se puede completar en el primer login */
        }
      }
      const needsConfirm = !data?.session;
      toast.success(
        needsConfirm
          ? 'Cuenta creada. Revisa tu correo (y la carpeta de spam) para confirmar antes de iniciar sesión.'
          : '¡Registro exitoso! Ya puedes iniciar sesión.',
      );
      trackRegistrationComplete();
      router.push('/login');
      return true;
    };

    try {
      const server = await tryServerRegister();

      if (server.ok) {
        toast.success(
          server.data?.message ||
            'Cuenta creada. Confirma tu email desde el correo que te hemos enviado para poder entrar.',
        );
        trackRegistrationComplete();
        router.push('/login');
        return;
      }

      if (server.useFallback) {
        const isMissingServiceRole =
          server.res?.status === 503 && server.data?.code === 'NO_SERVICE_ROLE';

        if (isMissingServiceRole) {
          console.warn(
            '[registro] SUPABASE_SERVICE_ROLE_KEY no configurada; usando registro por cliente.',
          );
        }

        const completed = await completeClientSignUp();
        if (!completed && isMissingServiceRole) {
          toast.error(
            'No se pudo completar el registro. Si no recibes el email de confirmación, contacta con soporte.',
          );
        }
        return;
      }

      if (server.data?.code === 'EMAIL_EXISTS') {
        toast.error(server.data.error, { duration: 6000 });
        router.push('/login');
        return;
      }

      toast.error(server.data?.error || 'No se pudo registrar.', { duration: 6000 });
    } catch {
      toast.error(
        'Se ha perdido la conexión al crear la cuenta. Prueba a iniciar sesión: si no funciona, vuelve a registrarte.',
        { duration: 8000 },
      );
    } finally {
      toast.dismiss(loadingToast);
      setSubmitting(false);
    }
  };

  const enterAfterGoogle = async (user) => {
    const cachedRole = peekCachedRoleName(user?.id);
    const rolePath = cachedRole
      ? getRedirectPathByRoleName(cachedRole)
      : await getRedirectPathByUserId(user?.id, user?.email);
    const phone = isPhoneViewport();
    const path = destinationAfterLogin({ rolePath, phone });
    if (path === '/' && phone) markOpenMainMenuAfterLogin();
    const createdMs = Date.parse(user?.created_at || '');
    if (Number.isFinite(createdMs) && Date.now() - createdMs < 3 * 60 * 1000) {
      trackRegistrationComplete();
    }
    await persistMarketingConsent(user?.id, user?.email, acceptedMarketing);
    router.replace(path);
  };

  const handleOAuthLogin = async (provider) => {
    if (googleLoading) return;
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

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
          `El proveedor ${provider} no está habilitado en Supabase. Actívalo en Authentication → Providers.`,
        );
      } else {
        toast.error(`No se pudo iniciar sesión con ${provider}. ${error.message}`);
      }
    }
  };

  const handleGoogleIdToken = async ({ credential, nonce }) => {
    if (!credential || googleLoading) return;
    setGoogleLoading(true);
    const loadingToast = toast.loading('Creando cuenta con Google...');
    clearLogoutPending();

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
      nonce,
    });

    if (error) {
      toast.dismiss(loadingToast);
      setGoogleLoading(false);
      console.error('[registro] google id token', error);
      reportLoginAttempt({ code: 'oauth_failed', provider: 'google' });
      toast.error('No se pudo continuar con Google. Prueba el botón de respaldo.');
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

    toast.success('Cuenta lista');
    void ensureAppUserProfile().catch(() => {});
    await enterAfterGoogle(result.user);
  };

  return (
    <main className={`login-page ${landingFont.variable}`} style={authMainStyle}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem', lineHeight: 0 }}>
        <SiteMascot variant={5} width={120} alt="Dralo" />
      </div>
      <h2 style={authHeadingStyle}>Crear cuenta</h2>
      {fromCampaign ? (
        <div style={campaignNoteStyle}>
          <p style={campaignNoteTitleStyle}>Crea tu cuenta y accede a la promoción del Plan Plus</p>
          <p style={campaignNoteBodyStyle}>
            {`Para los primeros ${FOUNDING_OFFER.total} registros. Sin tarjeta. Para conservar el Plus gratis, completa el formulario que recibirás a los ${FOUNDING_OFFER.delayDays} días dentro de los ${FOUNDING_OFFER.responseDays} días siguientes.`}
          </p>
        </div>
      ) : null}

      <form onSubmit={handleRegister} noValidate>
        <label htmlFor="registro-nombre" style={authLabelStyle}>
          Nombre <span style={optionalTagStyle}>(opcional)</span>
        </label>
        <input
          id="registro-nombre"
          type="text"
          autoComplete="given-name"
          placeholder="Tu nombre"
          maxLength={120}
          style={authInputStyle}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label htmlFor="registro-email" style={{ ...authLabelStyle, margin: '1rem 0 0.5rem' }}>
          Email
        </label>
        <input
          id="registro-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          style={authInputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="registro-password" style={{ ...authLabelStyle, margin: '1rem 0 0.5rem' }}>
          Contraseña
        </label>
        <PasswordInput
          id="registro-password"
          placeholder="••••••••"
          style={authInputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowPasswordRules(true)}
          autoComplete="new-password"
        />

        {showPasswordRules || password ? (
          <ul style={passwordRulesStyle}>
            {passwordChecks.map((rule) => (
              <li
                key={rule.id}
                style={{
                  ...passwordRuleItemStyle,
                  color: rule.passed ? '#15803d' : '#64748b',
                }}
              >
                <span aria-hidden="true">{rule.passed ? '✓' : '•'}</span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={passwordHintStyle}>
            Mínimo 8 caracteres, con una mayúscula, una minúscula y un número.
          </p>
        )}

        <p className="login-page__divider" role="separator">
          <span>o</span>
        </p>

        <div className="login-page__google-slot">
          <GoogleIdentityButton
            disabled={googleLoading}
            onCredential={handleGoogleIdToken}
            onUnavailable={() => setShowGoogleOAuthFallback(true)}
          />
        </div>
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

        <button
          type="submit"
          style={
            submitting
              ? { ...authButtonStyle, opacity: 0.7, cursor: 'not-allowed' }
              : authButtonStyle
          }
          disabled={submitting}
        >
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <label className="login-page__checkbox-label" style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <span>
              Al crear una cuenta, acepto los{' '}
              <a href="/terminos-condiciones" style={linkStyle}>
                Términos y condiciones
              </a>{' '}
              y confirmo haber leído la{' '}
              <a href="/politica-privacidad" style={linkStyle}>
                Política de privacidad
              </a>
              .
            </span>
          </label>

          <label className="login-page__checkbox-label" style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedDataProtection}
              onChange={(e) => setAcceptedDataProtection(e.target.checked)}
              required
            />
            <span>
              Acepto la{' '}
              <a href="/proteccion-datos" style={linkStyle}>
                Política de protección de datos
              </a>
              .
            </span>
          </label>

          <label className="login-page__checkbox-label" style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedMarketing}
              onChange={(e) => setAcceptedMarketing(e.target.checked)}
            />
            <span>
              {FORM_LEGAL_SNIPPETS.marketing ||
                'Deseo recibir comunicaciones comerciales, novedades y recursos de Dralo.'}
            </span>
          </label>
        </div>

        <p className="login-page__footer-note" style={footerNoteStyle}>
          ¿Ya tienes cuenta? <a href="/login" style={linkStyle}>Inicia sesión</a>
        </p>
      </form>
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

const campaignNoteStyle = {
  margin: '-0.65rem 0 1.35rem',
  textAlign: 'center',
};

const campaignNoteTitleStyle = {
  margin: '0 0 0.4rem',
  color: '#1e1b4b',
  fontWeight: 700,
  lineHeight: 1.35,
};

const campaignNoteBodyStyle = {
  margin: 0,
  color: '#3f3a5a',
  fontSize: '0.95rem',
  lineHeight: 1.5,
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
  marginTop: '1.35rem',
  background: 'linear-gradient(135deg, #8466ff 0%, #6545ec 55%, #5333d6 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(99, 67, 236, 0.32)',
};

const optionalTagStyle = {
  color: '#94a3b8',
  fontWeight: 400,
  fontSize: '0.85rem',
};

const passwordHintStyle = {
  margin: '0.5rem 0 0',
  fontSize: '0.82rem',
  color: '#64748b',
};

const passwordRulesStyle = {
  listStyle: 'none',
  margin: '0.6rem 0 0',
  padding: 0,
  display: 'grid',
  gap: '0.25rem',
};

const passwordRuleItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.82rem',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  fontSize: '0.9rem',
  lineHeight: 1.4,
};

const footerNoteStyle = {
  marginTop: '1rem',
  fontSize: '0.9rem',
  textAlign: 'center',
};

const linkStyle = {
  color: '#6a4be8',
  fontWeight: 700,
  textDecoration: 'none',
};

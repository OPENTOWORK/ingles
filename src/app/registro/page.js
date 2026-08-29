'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import { normalizeEmail } from '@/utils/authRoles';
import { mapSignupErrorMessage } from '@/utils/authSignupErrors';
import SiteMascot from '@/components/SiteMascot';
import PasswordInput from '@/components/PasswordInput';
import { FORM_LEGAL_SNIPPETS } from '@/lib/legal/legalDocuments';

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
  const router = useRouter();

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

    const tryServerRegister = async () => {
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
            headers: { Authorization: `Bearer ${data.session.access_token}` },
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

  return (
    <main className="login-page" style={authMainStyle}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem', lineHeight: 0 }}>
        <SiteMascot variant={5} width={120} alt="Dralo" />
      </div>
      <h2 style={authHeadingStyle}>Crear cuenta</h2>

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
          Password
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
  textDecoration: 'underline',
};

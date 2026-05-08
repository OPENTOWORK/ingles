'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import { normalizeEmail } from '@/utils/authRoles';
import { mapSignupErrorMessage } from '@/utils/authSignupErrors';
import SiteMascot from '@/components/SiteMascot';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProtection, setAcceptedDataProtection] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

    if (!acceptedTerms || !acceptedDataProtection) {
      toast.error('Debes aceptar Términos y condiciones y Protección de datos para registrarte.');
      return;
    }

    // Supabase cifra/hash de forma segura la password, pero reforzamos validación mínima.
    const passwordIsStrong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password);

    if (!passwordIsStrong) {
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
            legal_acceptance,
          },
        },
      });
      return { data, error };
    };

    const isDev = process.env.NODE_ENV === 'development';

    try {
      const server = await tryServerRegister();

      if (server.ok) {
        toast.success(server.data?.message || 'Cuenta creada. Ya puedes iniciar sesión.');
        router.push('/login');
        return;
      }

      if (server.useFallback) {
        if (isDev) {
          const { data, error } = await tryClientSignUp();
          if (error) {
            toast.error(mapSignupErrorMessage(error.message));
            return;
          }
          await persistMarketingConsent(data?.user?.id, normalizedEmail, acceptedMarketing);
          const needsConfirm = !data?.session;
          toast.success(
            needsConfirm
              ? 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
              : '¡Registro exitoso! Ya puedes iniciar sesión.'
          );
          router.push('/login');
          return;
        }
        const isMissingServiceRole =
          server.res?.status === 503 && server.data?.code === 'NO_SERVICE_ROLE';
        toast.error(
          isMissingServiceRole
            ? 'Registro sin confirmación por email: añade SUPABASE_SERVICE_ROLE_KEY en el hosting (Variables de entorno). Ver .env.example.'
            : 'Registro solo disponible con la API del servidor (no export estático sin /api). Añade SUPABASE_SERVICE_ROLE_KEY o usa despliegue con Node.'
        );
        return;
      }

      toast.error(server.data?.error || 'No se pudo registrar.');
    } catch {
      toast.error('Error de red. Intenta de nuevo.');
    } finally {
      toast.dismiss(loadingToast);
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "0.75rem", lineHeight: 0 }}>
        <SiteMascot variant={5} width={120} alt="Dralo" />
      </div>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Crear cuenta</h2>

      <form onSubmit={handleRegister}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          style={submitting ? { ...buttonStyle, opacity: 0.7, cursor: 'not-allowed' } : buttonStyle}
          disabled={submitting}
        >
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <span>
              Acepto los{' '}
              <a href="/terminos-condiciones" style={linkStyle}>
                Terminos y condiciones
              </a>
              .
            </span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedDataProtection}
              onChange={(e) => setAcceptedDataProtection(e.target.checked)}
              required
            />
            <span>
              Acepto la politica de{' '}
              <a href="/proteccion-datos" style={linkStyle}>
                Proteccion de datos
              </a>
              .
            </span>
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={acceptedMarketing}
              onChange={(e) => setAcceptedMarketing(e.target.checked)}
            />
            <span>Deseo recibir actualizaciones de mejoras en Dralo y ofertas comerciales.</span>
          </label>
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center", color: "#666" }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: "#0070f3" }}>Inicia sesión</a>
        </p>
      </form>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  marginTop: "1.5rem",
  backgroundColor: "#0070f3",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};


const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  fontSize: '0.9rem',
  color: '#333',
  lineHeight: 1.4,
};

const linkStyle = {
  color: '#0070f3',
  textDecoration: 'underline',
};

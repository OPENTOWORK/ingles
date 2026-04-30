'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { normalizeEmail } from '@/utils/authRoles';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProtection, setAcceptedDataProtection] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
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
      alert('Debes aceptar Términos y condiciones y Protección de datos para registrarte.');
      return;
    }

    // Supabase cifra/hash de forma segura la password, pero reforzamos validación mínima.
    const passwordIsStrong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password);

    if (!passwordIsStrong) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          role: 'student',
          legal_acceptance: {
            terms_and_conditions: true,
            data_protection: true,
            marketing_updates: Boolean(acceptedMarketing),
            accepted_at: new Date().toISOString(),
          },
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      await persistMarketingConsent(data?.user?.id, normalizedEmail, acceptedMarketing);
      alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      router.push('/login');
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

        <button type="submit" style={buttonStyle}>Registrarme</button>

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

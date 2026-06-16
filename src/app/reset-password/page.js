'use client';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import SiteMascot from '@/components/SiteMascot';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const redirectBase =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/update-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
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
          <label style={authLabelStyle}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            style={authInputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" style={authButtonStyle}>Enviar enlace</button>
        </form>
      ) : (
        <p className="login-page__success" style={{ textAlign: 'center' }}>
          Enlace enviado. Revisa tu correo.
        </p>
      )}
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

'use client';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password', // cámbialo a tu dominio final
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
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
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Recuperar Contraseña</h2>

      {!sent ? (
        <form onSubmit={handlePasswordReset}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" style={buttonStyle}>Enviar enlace</button>
        </form>
      ) : (
        <p style={{ textAlign: "center", color: "green" }}>
          Enlace enviado. Revisa tu correo.
        </p>
      )}
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

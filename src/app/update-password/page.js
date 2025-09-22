'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [updated, setUpdated] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(error.message);
    } else {
      setUpdated(true);
      setTimeout(() => router.push('/login'), 2000);
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
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Nueva contraseña</h2>

      {!updated ? (
        <form onSubmit={handleUpdate}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Introduce tu nueva contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Actualizar contraseña</button>
        </form>
      ) : (
        <p style={{ textAlign: "center", color: "green" }}>
          Contraseña actualizada. Redirigiendo al login...
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

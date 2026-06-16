'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import PasswordInput from '@/components/PasswordInput';

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [updated, setUpdated] = useState(false);
  const [canUpdatePassword, setCanUpdatePassword] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCanUpdatePassword(Boolean(session));
    };
    checkRecoverySession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!canUpdatePassword) {
      alert('El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.');
      return;
    }

    const passwordIsStrong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword);

    if (!passwordIsStrong) {
      alert('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

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
    <main className="login-page" style={authMainStyle}>
      <h2 style={authHeadingStyle}>Nueva contraseña</h2>

      {!updated ? (
        <form onSubmit={handleUpdate}>
          {!canUpdatePassword && (
            <p className="login-page__error" style={{ marginBottom: '1rem' }}>
              Este enlace no es válido o ha expirado. Solicita uno nuevo desde &quot;¿Has olvidado tu contraseña?&quot;.
            </p>
          )}
          <label style={authLabelStyle}>Introduce tu nueva contraseña</label>
          <PasswordInput
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={authInputStyle}
            autoComplete="new-password"
          />
          <button type="submit" style={authButtonStyle}>Actualizar contraseña</button>
        </form>
      ) : (
        <p className="login-page__success" style={{ textAlign: 'center' }}>
          Contraseña actualizada. Redirigiendo al login...
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const DEFAULT_GMAIL = 'draloenglish@gmail.com';

export default function ConfigurarCorreoPage() {
  const [gmailUser, setGmailUser] = useState(DEFAULT_GMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact/configure-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmailUser, appPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'No se pudo configurar el correo.', { duration: 12000 });
        return;
      }
      toast.success(data.message || 'Correo configurado.');
      setPassword('');
    } catch {
      toast.error('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={mainStyle}>
      <h1 style={{ marginBottom: 8 }}>Configurar avisos de soporte</h1>
      <p style={{ color: '#555', lineHeight: 1.5, marginBottom: 16 }}>
        Los tickets avisan a <strong>draloenglish@gmail.com</strong>. Necesitas una{' '}
        <strong>contraseña de aplicación</strong> de Google (no la contraseña normal).
      </p>

      <p style={{ background: '#f0f7ff', padding: 12, borderRadius: 6, marginBottom: 20, lineHeight: 1.5 }}>
        <strong>Recomendado:</strong> inicia sesión en Google con{' '}
        <strong>draloenglish@gmail.com</strong>, crea la contraseña de aplicación y úsala aquí con ese
        mismo email. Así evitas el error &quot;Username and Password not accepted&quot;.
      </p>

      <ol style={{ marginBottom: 24, paddingLeft: 20, lineHeight: 1.6 }}>
        <li>
          Abre{' '}
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">
            Contraseñas de aplicación
          </a>{' '}
          con la cuenta que pongas abajo (2 pasos activados).
        </li>
        <li>Nombre: <em>Dralo soporte</em> → Generar → copia las 16 letras.</li>
        <li>Pégalas aquí (sin espacios).</li>
      </ol>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <label style={labelStyle}>Cuenta Gmail que envía</label>
        <input
          type="email"
          value={gmailUser}
          onChange={(e) => setGmailUser(e.target.value)}
          placeholder="draloenglish@gmail.com"
          style={inputStyle}
          required
        />

        <label style={labelStyle}>Contraseña de aplicación (16 caracteres)</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
          placeholder="abcdefghijklmnop"
          autoComplete="off"
          maxLength={16}
          style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: 2 }}
          required
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Enviando prueba…' : 'Guardar y enviar correo de prueba'}
        </button>
      </form>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          background: '#fff8e6',
          border: '1px solid #f6e05e',
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.55,
          color: '#744210',
        }}
      >
        <strong>Producción (www.dralo.es):</strong> esta página solo funciona en local. En{' '}
        <strong>Vercel → english-practice → Settings → Environment Variables</strong> añade al
        menos:
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: 20 }}>
          <li>
            <code>RESEND_API_KEY</code> (desde resend.com) y verifica <code>dralo.es</code>, o
          </li>
          <li>
            <code>SUPPORT_SMTP_USER</code> + <code>SUPPORT_SMTP_PASS</code> (contraseña de
            aplicación Gmail, 16 caracteres)
          </li>
        </ul>
        En local puedes ejecutar: <code>node scripts/sync-email-env-vercel.mjs</code>
      </div>

      <p style={{ marginTop: 16, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
        Alternativa sin Gmail: <code>WEB3FORMS_ACCESS_KEY</code> desde{' '}
        <a href="https://web3forms.com" target="_blank" rel="noreferrer">
          web3forms.com
        </a>{' '}
        (gratis, destino draloenglish@gmail.com).
      </p>

      <p style={{ marginTop: 16 }}>
        <Link href="/contacto" style={{ color: '#0070f3' }}>
          ← Volver a Soporte
        </Link>
      </p>
    </main>
  );
}

const mainStyle = {
  maxWidth: 560,
  margin: '3rem auto',
  padding: '2rem',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  fontFamily: 'Segoe UI, sans-serif',
};

const labelStyle = { display: 'block', marginBottom: 8, fontWeight: 600 };

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: 4,
  boxSizing: 'border-box',
  marginBottom: 16,
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#0070f3',
  color: '#fff',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const DASHBOARD_API_URL =
  'https://supabase.com/dashboard/project/qnazrzvwvkwhkfbqsbmr/settings/api';

export default function ConfigurarSupabasePage() {
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(null);

  useEffect(() => {
    fetch('/api/admin/configure-service-role')
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d.configured)))
      .catch(() => setConfigured(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/configure-service-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRoleKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'No se pudo guardar la clave.', { duration: 12000 });
        return;
      }
      toast.success(data.message || 'Clave configurada.');
      setServiceRoleKey('');
      setConfigured(true);
    } catch {
      toast.error('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={mainStyle}>
      <h1 style={{ marginBottom: 8 }}>Configurar Supabase (admin local)</h1>
      <p style={{ color: '#555', lineHeight: 1.5, marginBottom: 16 }}>
        Para <strong>crear usuarios</strong> desde el panel hace falta la clave{' '}
        <strong>service_role</strong> del proyecto. No la compartas ni la subas a Git.
      </p>

      {configured === true && (
        <p style={{ background: '#ecfdf5', padding: 12, borderRadius: 6, marginBottom: 20, lineHeight: 1.5 }}>
          Ya hay una clave configurada en este entorno. Puedes pegar otra para sustituirla.
        </p>
      )}

      <ol style={{ marginBottom: 24, paddingLeft: 20, lineHeight: 1.6 }}>
        <li>
          Abre{' '}
          <a href={DASHBOARD_API_URL} target="_blank" rel="noreferrer">
            Supabase → API Keys
          </a>{' '}
          (proyecto qnazrzvwvkwhkfbqsbmr).
        </li>
        <li>
          En <strong>Project API keys</strong>, copia <strong>service_role</strong> (secret).
        </li>
        <li>Pégala abajo y guarda. Se almacena en <code>secrets/</code> (ignorado por git).</li>
      </ol>

      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <label style={labelStyle}>service_role key</label>
        <textarea
          value={serviceRoleKey}
          onChange={(e) => setServiceRoleKey(e.target.value.trim())}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows={4}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13 }}
          required
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Comprobando…' : 'Guardar y comprobar conexión'}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
        Alternativa en terminal: <code>npm run supabase:service-role-setup</code>
      </p>

      <p style={{ marginTop: 16 }}>
        <Link href="/admin" style={{ color: '#0070f3' }}>
          ← Volver al panel de administración
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PanelPageHeader from '@/components/PanelPageHeader';

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
    <div className="admin-module admin-config-page">
      <PanelPageHeader
        title="Configurar Supabase"
        subtitle="Entorno local de administración"
        mascotVariant={5}
        mascotWidth={88}
      />

      <div className="admin-section">
        <div className="admin-section__body">
          <p>
            Para <strong>crear usuarios</strong> desde el panel hace falta la clave{' '}
            <strong>service_role</strong> del proyecto. No la compartas ni la subas a Git.
          </p>

          {configured === true ? (
            <p className="admin-config-notice admin-config-notice--ok">
              Ya hay una clave configurada en este entorno. Puedes pegar otra para sustituirla.
            </p>
          ) : null}

          <ol>
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

          <form onSubmit={handleSubmit}>
            <div className="admin-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="service-role-key">service_role key</label>
              <textarea
                id="service-role-key"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value.trim())}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={4}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem' }}
                required
              />
            </div>

            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              {loading ? 'Comprobando…' : 'Guardar y comprobar conexión'}
            </button>
          </form>

          <p className="admin-meta" style={{ marginTop: '1.25rem' }}>
            Alternativa en terminal: <code>npm run supabase:service-role-setup</code>
          </p>

          <p style={{ marginTop: '1rem' }}>
            <Link href="/admin">← Volver al panel de administración</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

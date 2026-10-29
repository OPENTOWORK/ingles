'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './MarketingAudiencePanel.module.css';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'yes', label: 'Aceptan' },
  { id: 'no', label: 'No aceptan' },
];

const requestedAtFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Madrid',
});

function formatRequestedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return requestedAtFormat.format(date);
}

function ConsentMark({ accepted }) {
  const label = accepted ? 'Acepta envíos comerciales' : 'No acepta envíos comerciales';
  return (
    <span className={`${styles.mark} ${accepted ? styles.yes : styles.no}`} role="img" aria-label={label} title={label}>
      {accepted ? '✓' : '✕'}
    </span>
  );
}

export default function GuideRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch('/api/admin/marketing/guide-requests/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'No se pudo cargar el listado.');
          setRequests([]);
          return;
        }
        setRequests(Array.isArray(json.requests) ? json.requests : []);
      } catch (err) {
        console.error('[GuideRequestsPanel]', err);
        if (!cancelled) setError('No se pudo cargar el listado.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter((row) => {
      if (filter === 'yes' && !row.marketingAccepted) return false;
      if (filter === 'no' && row.marketingAccepted) return false;
      if (!needle) return true;
      return String(row.email || '').toLowerCase().includes(needle);
    });
  }, [requests, query, filter]);

  const acceptedCount = requests.filter((row) => row.marketingAccepted).length;

  return (
    <details className={styles.card}>
      <summary className={styles.toggle}>
        <h2 id="guide-requests-heading" className={styles.heading}>
          Guía gratuita
        </h2>
      </summary>
      <div className={styles.body}>
        <p className={styles.lead}>
          Correos que dejan el formulario de la guía del B2 First.
        </p>

        {loading ? <RouteLoadingMascot label="Cargando correos de la guía…" variant={5} /> : null}

        {!loading && error ? <p className={styles.error}>{error}</p> : null}

        {!loading ? (
          <>
            <div className={styles.toolbar}>
              <input
                className={styles.search}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar correo"
                aria-label="Buscar correo de la guía"
              />
              <div className={styles.filters} role="group" aria-label="Filtrar por envíos comerciales">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.filter} ${filter === item.id ? styles.filterActive : ''}`}
                    aria-pressed={filter === item.id}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={styles.summary}>
              {filtered.length} {filtered.length === 1 ? 'correo' : 'correos'}
              {filter === 'all' && requests.length
                ? ` · ${acceptedCount} aceptan envíos · ${requests.length - acceptedCount} no aceptan`
                : ''}
            </p>

            {filtered.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Correo</th>
                      <th scope="col">Pedido</th>
                      <th scope="col" className={styles.consentCol}>
                        Envíos comerciales
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id || row.email}>
                        <td className={styles.email}>{row.email}</td>
                        <td>
                          <time dateTime={row.lastRequestedAt}>{formatRequestedAt(row.lastRequestedAt)}</time>
                          {row.requestCount > 1 ? ` · ${row.requestCount} veces` : ''}
                        </td>
                        <td className={styles.consentCol}>
                          <ConsentMark accepted={Boolean(row.marketingAccepted)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>
                {error
                  ? 'No hay correos para mostrar.'
                  : query || filter !== 'all'
                    ? 'Ningún correo coincide con la búsqueda.'
                    : 'Todavía no ha llegado ningún correo de la guía.'}
              </p>
            )}
          </>
        ) : null}
      </div>
    </details>
  );
}

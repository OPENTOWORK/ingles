'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './MarketingAudiencePanel.module.css';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'active', label: 'Apuntados' },
  { id: 'unsubscribed', label: 'Bajas' },
];

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Madrid',
});

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormat.format(date);
}

function whenFor(row) {
  if (row.status === 'active') return row.confirmedAt || row.updatedAt;
  if (row.status === 'unsubscribed') return row.unsubscribedAt || row.updatedAt;
  return row.createdAt || row.updatedAt;
}

export default function NewsletterSubscribersPanel() {
  const [rows, setRows] = useState([]);
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
        const res = await fetch('/api/admin/marketing/newsletter/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'No se pudo cargar la newsletter.');
          setRows([]);
          return;
        }
        setRows(Array.isArray(json.subscribers) ? json.subscribers : []);
      } catch (err) {
        console.error('[NewsletterSubscribersPanel]', err);
        if (!cancelled) setError('No se pudo cargar la newsletter.');
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
    return rows.filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false;
      if (!needle) return true;
      return String(row.email || '').toLowerCase().includes(needle);
    });
  }, [rows, query, filter]);

  const activeCount = rows.filter((row) => row.status === 'active').length;

  return (
    <details className={styles.card}>
      <summary className={styles.toggle}>
        <h2 id="newsletter-subscribers-heading" className={styles.heading}>
          Newsletter
        </h2>
      </summary>
      <div className={styles.body}>
        <p className={styles.lead}>
          Correos que piden la newsletter. Solo los confirmados están apuntados.
        </p>

        {loading ? <RouteLoadingMascot label="Cargando la newsletter…" variant={5} /> : null}
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
                aria-label="Buscar correo de la newsletter"
              />
              <div className={styles.filters} role="group" aria-label="Filtrar por estado">
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
              {filter === 'all' && rows.length ? ` · ${activeCount} apuntados` : ''}
            </p>

            {filtered.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Correo</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const when = whenFor(row);
                      return (
                        <tr key={row.id || row.email}>
                          <td className={styles.email}>{row.email}</td>
                          <td>{row.statusLabel}</td>
                          <td>{when ? <time dateTime={when}>{formatWhen(when)}</time> : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>
                {query || filter !== 'all'
                  ? 'Ningún correo coincide con la búsqueda.'
                  : 'Todavía no hay altas de la newsletter.'}
              </p>
            )}
          </>
        ) : null}
      </div>
    </details>
  );
}

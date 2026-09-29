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

function ConsentMark({ accepted }) {
  const label = accepted ? 'Acepta envíos comerciales' : 'No acepta envíos comerciales';
  return (
    <span className={`${styles.mark} ${accepted ? styles.yes : styles.no}`} role="img" aria-label={label} title={label}>
      {accepted ? '✓' : '✕'}
    </span>
  );
}

export default function MarketingAudiencePanel() {
  const [users, setUsers] = useState([]);
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
        const res = await fetch('/api/admin/marketing/audience/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'No se pudo cargar el listado.');
          setUsers([]);
          return;
        }
        setUsers(Array.isArray(json.users) ? json.users : []);
      } catch (err) {
        console.error('[MarketingAudiencePanel]', err);
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
    return users.filter((user) => {
      if (filter === 'yes' && !user.marketingAccepted) return false;
      if (filter === 'no' && user.marketingAccepted) return false;
      if (!needle) return true;
      return String(user.email || '').toLowerCase().includes(needle);
    });
  }, [users, query, filter]);

  const acceptedCount = users.filter((user) => user.marketingAccepted).length;

  if (loading) {
    return <RouteLoadingMascot label="Cargando correos…" variant={5} />;
  }

  return (
    <section className={styles.card} aria-labelledby="marketing-audience-heading">
      <h2 id="marketing-audience-heading" className="sr-only">
        Correos de los usuarios
      </h2>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar correo"
          aria-label="Buscar correo"
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
        {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
        {filter === 'all' && users.length
          ? ` · ${acceptedCount} aceptan envíos · ${users.length - acceptedCount} no aceptan`
          : ''}
      </p>

      {filtered.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Correo</th>
                <th scope="col">Plan</th>
                <th scope="col" className={styles.consentCol}>
                  Envíos comerciales
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id || user.email}>
                  <td className={styles.email}>{user.email}</td>
                  <td>{user.planLabel}</td>
                  <td className={styles.consentCol}>
                    <ConsentMark accepted={Boolean(user.marketingAccepted)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>
          {error ? 'No hay correos para mostrar.' : 'Ningún usuario coincide con la búsqueda.'}
        </p>
      )}
    </section>
  );
}

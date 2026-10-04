'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import AdminFoldableSection from './AdminFoldableSection';
import styles from './AdminOrgBlocks.module.css';

async function adminHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionData?.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

const FIELD_LABELS = {
  rol: 'Rol',
  activo: 'Estado',
  plan_id: 'Plan',
  nombre: 'Nombre',
  url: 'URL',
  para_que: 'Para qué sirve',
  conectado_con: 'Conectado con',
  usuario: 'Usuario',
  correo: 'Correo',
  contrasena: 'Contraseña',
  registro: 'Registro',
};

export default function AdminChangeHistory() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tipo, setTipo] = useState('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [query, setQuery] = useState({ tipo: 'todos', desde: '', hasta: '', page: 1 });

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    (async () => {
      setState('loading');
      setError('');
      const params = new URLSearchParams({
        tipo: query.tipo,
        page: String(query.page),
      });
      if (query.desde) params.set('desde', query.desde);
      if (query.hasta) params.set('hasta', query.hasta);
      try {
        const res = await fetch(`/api/admin/cambios/?${params.toString()}`, {
          credentials: 'include',
          headers: await adminHeaders(),
        });
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState('error');
          setError(body.error || 'No se pudo leer el historial.');
          setRows([]);
          return;
        }
        setRows(body.rows || []);
        setTotal(body.total || 0);
        setPage(body.page || 1);
        setState('ready');
      } catch (err) {
        if (!cancelled) {
          setState('error');
          setError(err.message || 'No se pudo leer el historial.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminFoldableSection
      id="admin-change-history"
      title="Historial de cambios"
      open={open}
      onToggle={() => setOpen((current) => !current)}
    >
      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          setQuery({ tipo, desde, hasta, page: 1 });
        }}
      >
        <label className={styles.field}>
          Desde
          <input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
        </label>
        <label className={styles.field}>
          Hasta
          <input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
        </label>
        <label className={styles.field}>
          Tipo
          <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
            <option value="todos">Todos</option>
            <option value="configuracion">Configuración</option>
            <option value="rol">Rol</option>
            <option value="estado">Estado</option>
            <option value="plan">Plan</option>
            <option value="accesos">Accesos web</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.muted}>Aplicar</span>
          <button type="submit">Filtrar</button>
        </label>
      </form>

      {state === 'loading' ? <p className={styles.status}>Cargando historial…</p> : null}
      {state === 'error' ? <p className={styles.error}>{error}</p> : null}
      {state === 'ready' && rows.length === 0 ? (
        <p className={styles.status}>
          Aún no hay cambios registrados con este filtro. El historial solo muestra operaciones que ya se confirmaron.
        </p>
      ) : null}
      {state === 'ready' && rows.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Elemento</th>
                <th>Campo</th>
                <th>Antes</th>
                <th>Después</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatWhen(row.at)}</td>
                  <td>{row.actor}</td>
                  <td className={styles.wrap}>{row.element}</td>
                  <td>{FIELD_LABELS[row.field] || row.field}</td>
                  <td className={styles.wrap}>{row.before || '—'}</td>
                  <td className={styles.wrap}>{row.after || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {state === 'ready' && total > pageSize ? (
        <div className={styles.pager}>
          <span className={styles.muted}>
            Página {page} de {pages}
          </span>
          <span>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
            >
              Anterior
            </button>{' '}
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
            >
              Siguiente
            </button>
          </span>
        </div>
      ) : null}
    </AdminFoldableSection>
  );
}

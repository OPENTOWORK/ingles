'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from './AdminPlanObjetivosPanel.module.css';

async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function formatAnsweredAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function questionColumns(rows) {
  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    for (const answer of row.respuestas || []) {
      const key = answer.pregunta_id || answer.pregunta;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      columns.push({ key, label: answer.pregunta || 'Pregunta' });
    }
  }
  return columns;
}

function answerText(row, key) {
  const answer = (row.respuestas || []).find((item) => (item.pregunta_id || item.pregunta) === key);
  return answer?.texto || '—';
}

function dayKey(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function AdminFormularioRespuestas({
  forms,
  formularioId = '',
  userId = '',
  onFiltersChange,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formFilter, setFormFilter] = useState(formularioId);
  const [personQuery, setPersonQuery] = useState('');
  const [dataQuery, setDataQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [onlyUserId, setOnlyUserId] = useState(userId);
  const [viewMode, setViewMode] = useState('lista');

  useEffect(() => {
    setFormFilter(formularioId || '');
    setOnlyUserId(userId || '');
  }, [formularioId, userId]);

  useEffect(() => {
    document.body.classList.add('admin-responses-full');
    return () => document.body.classList.remove('admin-responses-full');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const headers = await getAdminFetchHeaders();
        const res = await fetch('/api/admin/formularios/respuestas/', { headers });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'No se pudieron cargar las respuestas.');
        if (!cancelled) setRows(json.respuestas || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'No se pudieron cargar las respuestas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pinnedUser = rows.find((row) => row.user_id === onlyUserId) || null;

  const filtered = useMemo(() => {
    const person = personQuery.trim().toLowerCase();
    const data = dataQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (onlyUserId && row.user_id !== onlyUserId) return false;
      if (formFilter && row.formulario_id !== formFilter) return false;
      if (person) {
        const who = `${row.nombre || ''} ${row.email || ''}`.toLowerCase();
        if (!who.includes(person)) return false;
      }
      if (data) {
        const blob = (row.respuestas || [])
          .map((answer) => `${answer.pregunta || ''} ${answer.texto || ''}`)
          .join(' ')
          .toLowerCase();
        if (!blob.includes(data)) return false;
      }
      const answeredDay = dayKey(row.completado_en);
      if (fromDate && answeredDay && answeredDay < fromDate) return false;
      if (toDate && answeredDay && answeredDay > toDate) return false;
      return true;
    });
  }, [rows, onlyUserId, formFilter, personQuery, dataQuery, fromDate, toDate]);

  const columns = useMemo(() => questionColumns(filtered), [filtered]);

  const publishFilters = (nextForm, nextUser) => {
    onFiltersChange?.({ formularioId: nextForm, userId: nextUser });
  };

  const clearFilters = () => {
    setFormFilter('');
    setPersonQuery('');
    setDataQuery('');
    setFromDate('');
    setToDate('');
    setOnlyUserId('');
    publishFilters('', '');
  };

  const filtersActive =
    Boolean(formFilter || personQuery.trim() || dataQuery.trim() || fromDate || toDate || onlyUserId);

  return (
    <section className={styles.responses} aria-label="Respuestas de formularios">
      <div className={styles.responseFilters}>
        <label className={styles.label}>
          Formulario
          <select
            className={styles.fieldInput}
            value={formFilter}
            onChange={(event) => {
              const value = event.target.value;
              setFormFilter(value);
              publishFilters(value, onlyUserId);
            }}
          >
            <option value="">Todos</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Quién ha contestado
          <input
            className={styles.fieldInput}
            value={personQuery}
            onChange={(event) => setPersonQuery(event.target.value)}
            placeholder="Nombre o correo"
          />
        </label>
        <label className={styles.label}>
          Datos de la respuesta
          <input
            className={styles.fieldInput}
            value={dataQuery}
            onChange={(event) => setDataQuery(event.target.value)}
            placeholder="Pregunta o respuesta"
          />
        </label>
        <label className={styles.label}>
          Desde
          <input
            className={styles.fieldInput}
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label className={styles.label}>
          Hasta
          <input
            className={styles.fieldInput}
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
      </div>

      <div className={styles.responseSummary}>
        <p className={styles.responseCount}>
          {loading ? 'Cargando respuestas…' : `${filtered.length} ${filtered.length === 1 ? 'respuesta' : 'respuestas'}`}
        </p>
        {onlyUserId ? (
          <p className={styles.responseChip}>
            Persona: {pinnedUser?.email || pinnedUser?.nombre || 'la ficha abierta'}
          </p>
        ) : null}
        {filtersActive ? (
          <button type="button" className={styles.restart} onClick={clearFilters}>
            Quitar filtros
          </button>
        ) : null}
        <div className={styles.viewToggle} role="group" aria-label="Vista de respuestas">
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'lista' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('lista')}
          >
            Lista
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'cuadricula' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('cuadricula')}
          >
            Cuadrícula
          </button>
        </div>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className={styles.empty}>No hay respuestas con estos filtros.</p>
      ) : null}

      {viewMode === 'lista' ? (
        <div className={styles.responseTableWrap}>
          <table className={styles.responseTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Formulario</th>
                <th>Fecha</th>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.nombre || 'Sin nombre'}</td>
                  <td>{row.email || '—'}</td>
                  <td>{row.formulario_titulo || 'Formulario'}</td>
                  <td>{formatAnsweredAt(row.completado_en)}</td>
                  {columns.map((column) => (
                    <td key={column.key}>{answerText(row, column.key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.responseGrid}>
          {filtered.map((row) => (
            <article key={row.id} className={styles.responseCard}>
              <header className={styles.responseHead}>
                <div>
                  <h3 className={styles.responseName}>{row.nombre || 'Sin nombre'}</h3>
                  <p className={styles.responseEmail}>{row.email || 'Cuenta sin correo'}</p>
                </div>
                <div className={styles.responseMeta}>
                  <span>{row.formulario_titulo || 'Formulario'}</span>
                  <span>{formatAnsweredAt(row.completado_en)}</span>
                </div>
              </header>
              {row.respuestas.length ? (
                <dl className={styles.responseAnswers}>
                  {row.respuestas.map((answer) => (
                    <div key={answer.pregunta_id || answer.pregunta} className={styles.responseAnswer}>
                      <dt>{answer.pregunta}</dt>
                      <dd>{answer.texto || '—'}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={styles.empty}>Visto, sin preguntas que responder.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

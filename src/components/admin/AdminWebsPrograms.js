'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import AdminFoldableSection from './AdminFoldableSection';
import styles from './AdminOrgBlocks.module.css';

const EMPTY_FORM = {
  nombre: '',
  url: '',
  paraQue: '',
  conectadoCon: '',
  usuario: '',
  correo: '',
  contrasena: '',
};

async function adminHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionData?.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function hrefFor(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return '';
}

export default function AdminWebsPrograms() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [revealed, setRevealed] = useState({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const load = async () => {
    setState('loading');
    setError('');
    const res = await fetch('/api/admin/accesos-web/', {
      credentials: 'include',
      cache: 'no-store',
      headers: await adminHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState('error');
      setError(body.error || 'No se pudieron leer los accesos.');
      return;
    }
    setRows(body.rows || []);
    setState('ready');
  };

  useEffect(() => {
    if (!open || state !== 'idle') return undefined;
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) {
        setState('error');
        setError(err.message || 'No se pudieron leer los accesos.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, state]);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      nombre: row.nombre,
      url: row.url,
      paraQue: row.paraQue,
      conectadoCon: row.conectadoCon,
      usuario: row.usuario,
      correo: row.correo,
      contrasena: '',
    });
    setSaveError('');
    setShowFormPassword(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setShowFormPassword(false);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(
        editingId ? `/api/admin/accesos-web/${editingId}/` : '/api/admin/accesos-web/',
        {
          method: editingId ? 'PATCH' : 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: await adminHeaders(),
          body: JSON.stringify(form),
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'No se pudo guardar.');
      setRows(body.rows || []);
      setState('ready');
      cancelEdit();
    } catch (err) {
      setSaveError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`¿Quitar ${row.nombre}?`)) return;
    setSaveError('');
    const res = await fetch(`/api/admin/accesos-web/${row.id}/`, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
      headers: await adminHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaveError(body.error || 'No se pudo quitar.');
      return;
    }
    if (editingId === row.id) cancelEdit();
    setRows(body.rows || []);
  };

  return (
    <AdminFoldableSection
      id="admin-webs-programs"
      title="Webs, programas y contraseñas"
      count={state === 'ready' ? rows.length : null}
      open={open}
      onToggle={() => setOpen((current) => !current)}
    >
      {state === 'loading' ? <p className={styles.status}>Cargando accesos…</p> : null}
      {state === 'error' ? <p className={styles.error}>{error}</p> : null}
      {state === 'ready' ? (
        <>
          {rows.length === 0 ? <p className={styles.status}>Todavía no hay ninguna web guardada.</p> : null}
          {rows.length > 0 ? (
            <div className={styles.entries}>
              {rows.map((row) => {
                const href = hrefFor(row.url);
                const visible = revealed[row.id];
                return (
                  <article key={row.id} className={styles.entry}>
                    <h3>{row.nombre}</h3>
                    <dl className={styles.facts}>
                      {row.url ? (
                        <>
                          <dt>URL</dt>
                          <dd>
                            {href ? (
                              <a href={href} target="_blank" rel="noreferrer">
                                {row.url}
                              </a>
                            ) : (
                              row.url
                            )}
                          </dd>
                        </>
                      ) : null}
                      {row.paraQue ? (
                        <>
                          <dt>Para qué sirve</dt>
                          <dd>{row.paraQue}</dd>
                        </>
                      ) : null}
                      {row.conectadoCon ? (
                        <>
                          <dt>Conectado con</dt>
                          <dd>{row.conectadoCon}</dd>
                        </>
                      ) : null}
                      {row.usuario ? (
                        <>
                          <dt>Usuario</dt>
                          <dd>{row.usuario}</dd>
                        </>
                      ) : null}
                      {row.correo ? (
                        <>
                          <dt>Correo</dt>
                          <dd>{row.correo}</dd>
                        </>
                      ) : null}
                      {row.contrasena ? (
                        <>
                          <dt>Contraseña</dt>
                          <dd>
                            <span className={styles.secret}>
                              {visible ? <code>{row.contrasena}</code> : <span>••••••••</span>}
                              <button
                                type="button"
                                className={styles.inlineButton}
                                onClick={() =>
                                  setRevealed((current) => ({ ...current, [row.id]: !current[row.id] }))
                                }
                              >
                                {visible ? 'Ocultar' : 'Mostrar'}
                              </button>
                            </span>
                          </dd>
                        </>
                      ) : null}
                    </dl>
                    <div className={styles.actions}>
                      <button type="button" onClick={() => startEdit(row)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => remove(row)}>
                        Quitar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          <form className={styles.group} autoComplete="off" onSubmit={save}>
            <h3>{editingId ? 'Editar acceso' : 'Añadir acceso'}</h3>
            <label>
              Nombre
              <input value={form.nombre} onChange={setField('nombre')} maxLength={120} required />
            </label>
            <label>
              URL
              <input value={form.url} onChange={setField('url')} maxLength={500} inputMode="url" autoComplete="off" />
            </label>
            <label>
              Para qué sirve
              <input value={form.paraQue} onChange={setField('paraQue')} maxLength={500} />
            </label>
            <label>
              Con qué está conectado
              <input value={form.conectadoCon} onChange={setField('conectadoCon')} maxLength={500} />
            </label>
            <label>
              Usuario
              <input value={form.usuario} onChange={setField('usuario')} maxLength={160} autoComplete="off" />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={form.correo}
                onChange={setField('correo')}
                maxLength={160}
                autoComplete="off"
              />
            </label>
            <label>
              Contraseña
              <input
                type={showFormPassword ? 'text' : 'password'}
                value={form.contrasena}
                onChange={setField('contrasena')}
                maxLength={500}
                autoComplete="new-password"
              />
            </label>
            <button
              type="button"
              className={styles.inlineButton}
              onClick={() => setShowFormPassword((current) => !current)}
            >
              {showFormPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            </button>
            {editingId ? <p className={styles.hint}>Si dejas la contraseña vacía, se conserva la que ya está guardada.</p> : null}
            {saveError ? <p className={styles.error}>{saveError}</p> : null}
            <div className={styles.actions}>
              <button type="submit" className={styles.primary} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              {editingId ? (
                <button type="button" onClick={cancelEdit} disabled={saving}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </>
      ) : null}
    </AdminFoldableSection>
  );
}

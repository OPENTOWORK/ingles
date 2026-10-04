'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { validateOrgSettingValue } from '@/lib/orgSettings';
import AdminFoldableSection from './AdminFoldableSection';
import styles from './AdminOrgBlocks.module.css';

async function adminHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionData?.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function snapshot(fields = []) {
  return Object.fromEntries(fields.map((field) => [field.key, field.value || '']));
}

export default function AdminGeneralSettings() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [fields, setFields] = useState([]);
  const [draft, setDraft] = useState({});
  const [savedDraft, setSavedDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');

  const load = async () => {
    setState('loading');
    setError('');
    const res = await fetch('/api/admin/configuracion-general/', {
      credentials: 'include',
      headers: await adminHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState('error');
      setError(body.error || 'No se pudo leer la configuración.');
      return;
    }
    const next = snapshot(body.fields || []);
    setGroups(body.groups || []);
    setFields(body.fields || []);
    setDraft(next);
    setSavedDraft(next);
    setState('ready');
  };

  useEffect(() => {
    if (!open || state !== 'idle') return undefined;
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) {
        setState('error');
        setError(err.message || 'No se pudo leer la configuración.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, state]);

  const validationError = useMemo(() => {
    for (const field of fields) {
      const checked = validateOrgSettingValue(field.key, draft[field.key]);
      if (!checked.ok) return checked.error;
    }
    return '';
  }, [draft, fields]);

  const dirty = fields.some((field) => (draft[field.key] || '') !== (savedDraft[field.key] || ''));

  const save = async () => {
    if (!dirty || validationError || saving) return;
    setSaving(true);
    setNotice('');
    setSaveError('');
    try {
      const res = await fetch('/api/admin/configuracion-general/', {
        method: 'PUT',
        credentials: 'include',
        headers: await adminHeaders(),
        body: JSON.stringify({ values: draft }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'No se pudo guardar.');
      const next = snapshot(body.fields || []);
      setFields(body.fields || []);
      setDraft(next);
      setSavedDraft(next);
      setNotice('Configuración guardada.');
      toast.success('Configuración guardada.');
    } catch (err) {
      setNotice('');
      setSaveError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFoldableSection
      id="admin-general-settings"
      title="Configuración general"
      open={open}
      onToggle={() => setOpen((current) => !current)}
    >
      {state === 'loading' ? <p className={styles.status}>Cargando configuración…</p> : null}
      {state === 'error' ? <p className={styles.error}>{error}</p> : null}
      {state === 'ready' ? (
        <>
          <div className={styles.groups}>
            {groups.map((group) => (
              <section key={group.id} className={styles.group}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                {fields
                  .filter((field) => field.group === group.id)
                  .map((field) => (
                    <label key={field.key}>
                      {field.label}
                      <input
                        type={field.type === 'email' ? 'email' : 'text'}
                        value={draft[field.key] || ''}
                        maxLength={field.maxLength}
                        onChange={(event) => {
                          setNotice('');
                          setSaveError('');
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }));
                        }}
                      />
                      <span className={styles.hint}>
                        {field.scope}
                        {field.persisted ? '' : ' Todavía no está guardado: sigue vigente el texto fijo del código.'}
                        {field.duplicate ? ' Hay registros duplicados y no se puede guardar hasta dejar la clave única.' : ''}
                      </span>
                    </label>
                  ))}
              </section>
            ))}
          </div>
          {validationError && dirty ? <p className={styles.error}>{validationError}</p> : null}
          {saveError ? <p className={styles.error} role="alert">{saveError}</p> : null}
          {notice ? <p className={styles.saved}>{notice}</p> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!dirty || Boolean(validationError) || saving || fields.some((field) => field.duplicate)}
              onClick={save}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => {
                setDraft(savedDraft);
                setNotice('');
                setSaveError('');
              }}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : null}
    </AdminFoldableSection>
  );
}

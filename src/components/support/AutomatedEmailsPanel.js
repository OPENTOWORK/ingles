'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import {
  AUTOMATED_EMAIL_TRIGGER_OPTIONS,
  formatScheduleLabel,
  getTriggerLabel,
} from '@/lib/automatedEmailTriggers';

const VARIABLE_HINTS = [
  '{{nombre}} — nombre del destinatario (con espacio previo en saludo)',
  '{{email}} — email del usuario',
  '{{login_url}} — enlace de acceso (se convierte en botón)',
  '{{app_url}} — URL de la plataforma (invitaciones)',
  '{{sender_name}} — quien envía la invitación',
  '{{invite_message}} — mensaje personal del invitador (opcional)',
  '{{ticket_subject}} — asunto del ticket',
  '{{temporary_password}} — contraseña temporal (cuenta admin)',
  '{{message}} — cuerpo de respuesta de soporte',
  '{{agent_name}} — nombre del agente de soporte',
  '{{support_email}} — email de contacto soporte',
];

async function apiFetch(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Sesión expirada');

  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la petición');
  return data;
}

const EMPTY_FORM = {
  nombre: '',
  trigger_event: AUTOMATED_EMAIL_TRIGGER_OPTIONS[0]?.value || 'user_registered',
  trigger_reason: '',
  asunto: '',
  cuerpo: '',
  activo: true,
  delay_minutos: 0,
};

export default function AutomatedEmailsPanel() {
  const [templates, setTemplates] = useState([]);
  const [triggers, setTriggers] = useState(AUTOMATED_EMAIL_TRIGGER_OPTIONS);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [setupHint, setSetupHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId],
  );

  const loadTemplates = useCallback(async () => {
    try {
      const data = await apiFetch('/api/support/automated-emails');
      setTemplates(data.templates || []);
      setTriggers(data.triggers || AUTOMATED_EMAIL_TRIGGER_OPTIONS);
      setUsingDefaults(Boolean(data.usingDefaults));
      setSetupHint(data.setupHint || '');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!selected) {
      setForm(null);
      return;
    }
    setForm({
      nombre: selected.nombre,
      trigger_event: selected.trigger_event,
      trigger_reason: selected.trigger_reason || '',
      asunto: selected.asunto,
      cuerpo: selected.cuerpo,
      activo: selected.activo !== false,
      delay_minutos: Number(selected.delay_minutos) || 0,
    });
    setCreating(false);
  }, [selected]);

  const startCreate = () => {
    setSelectedId(null);
    setCreating(true);
    setForm({ ...EMPTY_FORM });
  };

  const saveTemplate = async () => {
    if (!form) return;
    setSaving(true);
    try {
      if (creating) {
        const data = await apiFetch('/api/support/automated-emails', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        toast.success('Plantilla creada');
        await loadTemplates();
        setSelectedId(data.template?.id || null);
        setCreating(false);
      } else if (selectedId) {
        await apiFetch(`/api/support/automated-emails/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        toast.success('Plantilla actualizada');
        await loadTemplates();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async () => {
    if (!selectedId || creating) return;
    if (!window.confirm('¿Eliminar esta plantilla de correo automático?')) return;
    try {
      await apiFetch(`/api/support/automated-emails/${selectedId}`, { method: 'DELETE' });
      toast.success('Plantilla eliminada');
      setSelectedId(null);
      await loadTemplates();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (template) => {
    if (usingDefaults || String(template.id).startsWith('default-')) {
      toast.error('Ejecuta la migración SQL en Supabase para activar/desactivar plantillas.');
      return;
    }
    try {
      await apiFetch(`/api/support/automated-emails/${template.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !template.activo }),
      });
      await loadTemplates();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="auto-emails-panel">
      {usingDefaults && setupHint ? (
        <p className="auto-emails-panel__hint" role="status">
          {setupHint}
        </p>
      ) : null}

      <header className="auto-emails-panel__header">
        <div>
          <h2 className="auto-emails-panel__title">Correos automáticos</h2>
          <p className="auto-emails-panel__subtitle">
            Tipos de correo que la plataforma envía sola, cuándo se disparan y su contenido.
            Puedes crear plantillas nuevas, editarlas, programar el retraso y desactivarlas.
          </p>
        </div>
        <button type="button" className="auto-emails-panel__create" onClick={startCreate}>
          + Nueva plantilla
        </button>
      </header>

      <div className="auto-emails-panel__grid">
        <section className="auto-emails-list">
          {loading ? (
            <p className="auto-emails-muted">Cargando plantillas…</p>
          ) : templates.length === 0 ? (
            <p className="auto-emails-muted">No hay plantillas configuradas.</p>
          ) : (
            <ul className="auto-emails-list__items">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`auto-emails-row${selectedId === t.id && !creating ? ' is-selected' : ''}${
                      !t.activo ? ' is-off' : ''
                    }`}
                    onClick={() => {
                      setCreating(false);
                      setSelectedId(t.id);
                    }}
                  >
                    <span className="auto-emails-row__name">{t.nombre}</span>
                    <span className="auto-emails-row__trigger">{getTriggerLabel(t.trigger_event)}</span>
                    <span className="auto-emails-row__schedule">
                      {formatScheduleLabel(t.delay_minutos)}
                    </span>
                    <span className="auto-emails-row__status">
                      {t.activo ? 'Activo' : 'Desactivado'}
                      {t.es_sistema ? ' · Sistema' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="auto-emails-editor">
          {!form ? (
            <p className="auto-emails-muted auto-emails-editor__empty">
              Selecciona una plantilla o crea una nueva para ver y editar su contenido.
            </p>
          ) : (
            <>
              <h3>{creating ? 'Nueva plantilla' : selected?.nombre}</h3>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-nombre">Nombre interno</label>
                <input
                  id="ae-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-trigger">Cuándo se envía (evento)</label>
                <select
                  id="ae-trigger"
                  value={form.trigger_event}
                  onChange={(e) => setForm((f) => ({ ...f, trigger_event: e.target.value }))}
                >
                  {triggers.map((tr) => (
                    <option key={tr.value} value={tr.value}>
                      {tr.label}
                    </option>
                  ))}
                </select>
                <p className="auto-emails-muted">
                  {triggers.find((tr) => tr.value === form.trigger_event)?.description}
                </p>
              </div>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-reason">Motivo / descripción para soporte</label>
                <textarea
                  id="ae-reason"
                  rows={2}
                  value={form.trigger_reason}
                  onChange={(e) => setForm((f) => ({ ...f, trigger_reason: e.target.value }))}
                  placeholder="Explica por qué existe este correo y en qué situación se envía."
                />
              </div>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-delay">Programación (minutos tras el evento)</label>
                <input
                  id="ae-delay"
                  type="number"
                  min={0}
                  step={1}
                  value={form.delay_minutos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, delay_minutos: Math.max(0, Number(e.target.value) || 0) }))
                  }
                />
                <p className="auto-emails-muted">{formatScheduleLabel(form.delay_minutos)}</p>
                {form.delay_minutos > 0 ? (
                  <p className="auto-emails-muted">
                    Los envíos programados requieren el cron{' '}
                    <code>/api/cron/automated-emails</code> (variable CRON_SECRET).
                  </p>
                ) : null}
              </div>

              <div className="auto-emails-editor__field auto-emails-editor__field--inline">
                <label>
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                  />{' '}
                  Plantilla activa
                </label>
              </div>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-asunto">Asunto del correo</label>
                <input
                  id="ae-asunto"
                  value={form.asunto}
                  onChange={(e) => setForm((f) => ({ ...f, asunto: e.target.value }))}
                />
              </div>

              <div className="auto-emails-editor__field">
                <label htmlFor="ae-cuerpo">Contenido (texto plano)</label>
                <textarea
                  id="ae-cuerpo"
                  rows={12}
                  value={form.cuerpo}
                  onChange={(e) => setForm((f) => ({ ...f, cuerpo: e.target.value }))}
                />
                <p className="auto-emails-muted" style={{ marginTop: '0.35rem' }}>
                  Al enviar, el texto se convierte automáticamente en un correo HTML con marca Dralo.
                  Usa líneas «Acceso: https://…» o «Únete aquí: https://…» para generar un botón CTA.
                </p>
              </div>

              <details className="auto-emails-vars">
                <summary>Variables disponibles</summary>
                <ul>
                  {VARIABLE_HINTS.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </details>

              <div className="auto-emails-editor__actions">
                <button
                  type="button"
                  className="primary"
                  disabled={saving}
                  onClick={() => void saveTemplate()}
                >
                  {saving ? 'Guardando…' : creating ? 'Crear plantilla' : 'Guardar cambios'}
                </button>
                {!creating && selected && !usingDefaults ? (
                  <>
                    <button type="button" onClick={() => void toggleActive(selected)}>
                      {selected.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    {!selected.es_sistema ? (
                      <button type="button" className="danger" onClick={() => void deleteTemplate()}>
                        Eliminar
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .auto-emails-panel__hint {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          color: #92400e;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .auto-emails-panel__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .auto-emails-panel__title {
          margin: 0 0 0.35rem;
          font-size: 1.35rem;
        }
        .auto-emails-panel__subtitle {
          margin: 0;
          color: #555;
          max-width: 42rem;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        .auto-emails-panel__create {
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .auto-emails-panel__grid {
          display: grid;
          grid-template-columns: minmax(280px, 360px) 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .auto-emails-panel__grid {
            grid-template-columns: 1fr;
          }
        }
        .auto-emails-list,
        .auto-emails-editor {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          min-height: 480px;
        }
        .auto-emails-list__items {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .auto-emails-row {
          width: 100%;
          text-align: left;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: #fafafa;
          cursor: pointer;
        }
        .auto-emails-row.is-selected {
          border-color: #0070f3;
          background: #eff6ff;
        }
        .auto-emails-row.is-off {
          opacity: 0.72;
        }
        .auto-emails-row__name {
          display: block;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .auto-emails-row__trigger,
        .auto-emails-row__schedule,
        .auto-emails-row__status {
          display: block;
          font-size: 0.8rem;
          color: #666;
        }
        .auto-emails-muted {
          color: #888;
          font-size: 0.88rem;
        }
        .auto-emails-editor__empty {
          margin-top: 2rem;
          text-align: center;
        }
        .auto-emails-editor h3 {
          margin: 0 0 1rem;
        }
        .auto-emails-editor__field {
          margin-bottom: 0.85rem;
        }
        .auto-emails-editor__field label {
          display: block;
          font-weight: 600;
          font-size: 0.88rem;
          margin-bottom: 0.3rem;
        }
        .auto-emails-editor__field input,
        .auto-emails-editor__field select,
        .auto-emails-editor__field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.55rem 0.65rem;
          font-family: inherit;
          font-size: 0.9rem;
        }
        .auto-emails-editor__field--inline label {
          font-weight: 500;
        }
        .auto-emails-vars {
          margin: 0.75rem 0 1rem;
          font-size: 0.85rem;
        }
        .auto-emails-vars ul {
          margin: 0.5rem 0 0;
          padding-left: 1.2rem;
          color: #555;
        }
        .auto-emails-editor__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .auto-emails-editor__actions button {
          border: 1px solid #ccc;
          background: #f9fafb;
          padding: 0.45rem 0.9rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.88rem;
        }
        .auto-emails-editor__actions .primary {
          background: #0070f3;
          color: #fff;
          border-color: #0070f3;
          font-weight: 600;
        }
        .auto-emails-editor__actions .danger {
          color: #b91c1c;
          border-color: #fecaca;
          background: #fef2f2;
        }
        .auto-emails-editor__actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

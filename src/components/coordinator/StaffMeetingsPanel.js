'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  EMPTY_MEETING_FORM,
  formatMeetingDate,
  STAFF_DEPARTMENTS,
} from '@/lib/staffMeetingsConstants';
import { shouldShowSchemaSetupHint } from '@/lib/staffTasksPermissions';

async function meetingsFetch(path, options = {}, { soft = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    if (soft) return { error: 'Sesión no válida.' };
    throw new Error('Sesión no válida.');
  }
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (soft) return { ...payload, error: payload?.error || 'Error en la petición.' };
    throw new Error(payload?.error || 'Error en la petición.');
  }
  return payload;
}

function MeetingFormModal({ open, onClose, form, onChange, onSave, saving, title }) {
  if (!open) return null;

  const toggleDepartment = (label) => {
    const set = new Set(form.departamentos || []);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    onChange({ ...form, departamentos: [...set] });
  };

  const updatePunto = (index, text) => {
    const puntos = [...(form.puntos_dia || [{ text: '' }])];
    puntos[index] = { text };
    onChange({ ...form, puntos_dia: puntos });
  };

  const addPunto = () => {
    onChange({ ...form, puntos_dia: [...(form.puntos_dia || []), { text: '' }] });
  };

  const removePunto = (index) => {
    const puntos = (form.puntos_dia || []).filter((_, i) => i !== index);
    onChange({ ...form, puntos_dia: puntos.length ? puntos : [{ text: '' }] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <form
          className="p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
            <input
              value={form.titulo}
              onChange={(e) => onChange({ ...form, titulo: e.target.value })}
              placeholder="Ej. Reunión semanal de coordinación"
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => onChange({ ...form, fecha: e.target.value })}
                required
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => onChange({ ...form, hora: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamentos implicados *</label>
            <div className="flex flex-wrap gap-2">
              {STAFF_DEPARTMENTS.map((dept) => {
                const selected = (form.departamentos || []).includes(dept.label);
                return (
                  <button
                    key={dept.value}
                    type="button"
                    onClick={() => toggleDepartment(dept.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-violet-300'
                    }`}
                  >
                    {dept.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Puntos del día *</label>
            <div className="space-y-2">
              {(form.puntos_dia || [{ text: '' }]).map((punto, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-xs text-gray-500 pt-2.5 w-5 shrink-0">{index + 1}.</span>
                  <input
                    value={punto.text}
                    onChange={(e) => updatePunto(index, e.target.value)}
                    placeholder="Punto del orden del día"
                    className="border rounded-lg px-3 py-2 text-sm flex-1"
                  />
                  {(form.puntos_dia || []).length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removePunto(index)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-2"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPunto}
              className="mt-2 text-sm text-violet-600 hover:underline"
            >
              + Añadir punto
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => onChange({ ...form, notas: e.target.value })}
              rows={2}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar reunión'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function meetingToForm(meeting) {
  if (!meeting) return { ...EMPTY_MEETING_FORM, puntos_dia: [{ text: '' }] };
  return {
    titulo: meeting.titulo || '',
    fecha: meeting.fecha || '',
    hora: meeting.hora || '',
    departamentos: meeting.departamentos || [],
    puntos_dia: meeting.puntos_dia?.length
      ? meeting.puntos_dia.map((p) => ({ text: p.text }))
      : [{ text: '' }],
    notas: meeting.notas || '',
  };
}

export default function StaffMeetingsPanel() {
  const [meetings, setMeetings] = useState([]);
  const [notionStatus, setNotionStatus] = useState(null);
  const [tablesReady, setTablesReady] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_MEETING_FORM, puntos_dia: [{ text: '' }] });

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await meetingsFetch('/api/coordinator/meetings', {}, { soft: true });
      if (data.error) return;
      setMeetings(data.meetings || []);
      if (data.notion) setNotionStatus(data.notion);
      if (typeof data.tablesReady === 'boolean') setTablesReady(data.tablesReady);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_MEETING_FORM, puntos_dia: [{ text: '' }] });
    setModalOpen(true);
  };

  const openEdit = (meeting) => {
    setEditingId(meeting.id);
    setForm(meetingToForm(meeting));
    setModalOpen(true);
  };

  const saveMeeting = async () => {
    setSaving(true);
    try {
      const result = await meetingsFetch('/api/coordinator/meetings', {
        method: 'POST',
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          id: editingId || undefined,
          ...form,
        }),
      });
      setModalOpen(false);
      await loadMeetings();
      if (!editingId && result.buzonNotified === false && result.buzonError) {
        alert(`Reunión guardada, pero no se pudo avisar en el buzón: ${result.buzonError}`);
      }
      if (result.notionSync?.error) {
        alert(`Reunión guardada en Dralo, pero Notion no se actualizó: ${result.notionSync.error}`);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMeeting = async (meeting) => {
    if (!window.confirm('¿Eliminar esta reunión?')) return;
    setSaving(true);
    try {
      await meetingsFetch('/api/coordinator/meetings', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: meeting.id }),
      });
      await loadMeetings();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const schemaHint = shouldShowSchemaSetupHint(tablesReady);

  const notionPageUrl = (pageId) =>
    pageId ? `https://www.notion.so/${String(pageId).replace(/-/g, '')}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reuniones</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Planifica reuniones del equipo: fecha, departamentos implicados y orden del día. Al crear
            una reunión se avisa a todo el staff en el buzón (grupo «Reuniones del equipo»).
            {notionStatus?.configured && notionStatus?.ok
              ? ' Las reuniones se sincronizan automáticamente con Notion.'
              : null}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={saving || tablesReady === false}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 shrink-0"
        >
          + Nueva reunión
        </button>
      </div>

      {schemaHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          [Dev] Ejecuta <code className="bg-amber-100 px-1 rounded">scripts/staff_reuniones.sql</code> en
          Supabase.
        </div>
      )}

      {notionStatus && !notionStatus.configured ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span aria-hidden>📓</span> Conectar Notion
          </p>
          <p className="mt-2">
            Puedes sincronizar las reuniones con una base de datos de Notion. Añade en el servidor
            (Vercel / <code className="bg-white px-1 rounded">.env.local</code>):
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs font-mono text-gray-600">
            <li>NOTION_API_KEY</li>
            <li>NOTION_MEETINGS_DATABASE_ID</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Crea una integración en notion.so/my-integrations, comparte la base de datos con ella y
            copia el ID de la base (32 caracteres en la URL). Opcional:{' '}
            <code className="bg-white px-1 rounded">scripts/staff_reuniones_notion.sql</code> en
            Supabase.
          </p>
        </div>
      ) : null}

      {notionStatus?.configured && !notionStatus?.ok ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Notion configurado pero no conectado: {notionStatus.error || 'revisa la API key y el ID de la base.'}
        </div>
      ) : null}

      {notionStatus?.configured && notionStatus?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong>Notion conectado</strong>
            {notionStatus.databaseId ? ` · base ${notionStatus.databaseId}` : null}
          </span>
          <span className="text-xs text-emerald-700">Nuevas reuniones se publican en Notion al guardar.</span>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Cargando reuniones…</p>
      ) : meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/30 px-6 py-16 text-center">
          <p className="text-gray-600">Todavía no hay reuniones planificadas.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-3 text-sm text-violet-600 hover:underline font-medium"
          >
            + Crear la primera reunión
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {meetings.map((meeting) => (
            <article
              key={meeting.id}
              className="rounded-xl border bg-white p-5 shadow-sm hover:border-violet-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                    {formatMeetingDate(meeting.fecha, meeting.hora)}
                  </p>
                  <h3 className="font-semibold text-gray-900 mt-1">
                    {meeting.titulo || 'Reunión de equipo'}
                  </h3>
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  {meeting.notion_page_id ? (
                    <a
                      href={notionPageUrl(meeting.notion_page_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-2 py-1 bg-gray-50"
                    >
                      Notion ↗
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openEdit(meeting)}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMeeting(meeting)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {meeting.departamentos.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex rounded-full bg-violet-100 text-violet-800 px-2.5 py-0.5 text-xs font-medium"
                  >
                    {dept}
                  </span>
                ))}
              </div>
              <ol className="mt-4 space-y-1.5 list-decimal list-inside text-sm text-gray-700">
                {meeting.puntos_dia.map((punto, i) => (
                  <li key={i} className="leading-snug">
                    {punto.text}
                  </li>
                ))}
              </ol>
              {meeting.notas ? (
                <p className="mt-3 text-xs text-gray-500 border-t pt-3">{meeting.notas}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <MeetingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onChange={setForm}
        onSave={saveMeeting}
        saving={saving}
        title={editingId ? 'Editar reunión' : 'Nueva reunión'}
      />
    </div>
  );
}

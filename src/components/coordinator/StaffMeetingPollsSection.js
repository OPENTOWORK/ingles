'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  EMPTY_POLL_FORM,
  normalizePollOptions,
  pickBestPollOption,
  POLL_VOTE_LABELS,
} from '@/lib/staffMeetingPolls';
import {
  EMPTY_MEETING_FORM,
  formatMeetingDate,
  STAFF_DEPARTMENTS,
} from '@/lib/staffMeetingsConstants';
import { shouldShowSchemaSetupHint } from '@/lib/staffTasksPermissions';

async function pollsFetch(path, options = {}, { soft = false } = {}) {
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

function PollFormModal({ open, onClose, form, onChange, onSave, saving }) {
  if (!open) return null;

  const toggleDepartment = (label) => {
    const set = new Set(form.departamentos || []);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    onChange({ ...form, departamentos: [...set] });
  };

  const updateOption = (index, field, value) => {
    const options = [...(form.options || [{ fecha: '', hora: '' }])];
    options[index] = { ...options[index], [field]: value };
    onChange({ ...form, options });
  };

  const addOption = () => {
    onChange({ ...form, options: [...(form.options || []), { fecha: '', hora: '' }] });
  };

  const removeOption = (index) => {
    const options = (form.options || []).filter((_, i) => i !== index);
    onChange({ ...form, options: options.length ? options : [{ fecha: '', hora: '' }] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Nueva encuesta de fechas</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => onChange({ ...form, titulo: e.target.value })}
              placeholder="Ej. ¿Cuándo hacemos la reunión de marzo?"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamentos *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fechas propuestas * (mínimo 2)
            </label>
            <div className="space-y-2">
              {(form.options || [{ fecha: '', hora: '' }]).map((option, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="date"
                    value={option.fecha}
                    onChange={(e) => updateOption(index, 'fecha', e.target.value)}
                    required={index < 2}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={option.hora}
                    onChange={(e) => updateOption(index, 'hora', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  {(form.options || []).length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      ×
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption} className="mt-2 text-sm text-violet-600 hover:underline">
              + Añadir otra fecha
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
              {saving ? 'Publicando…' : 'Publicar encuesta'}
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

function ConfirmMeetingModal({ open, poll, onClose, onConfirm, saving }) {
  const [form, setForm] = useState({ ...EMPTY_MEETING_FORM, puntos_dia: [{ text: '' }] });
  const [selectedOptionId, setSelectedOptionId] = useState('');

  useEffect(() => {
    if (!open || !poll) return;
    const best = pickBestPollOption(poll.options);
    setSelectedOptionId(best?.id || poll.options[0]?.id || '');
    setForm({
      titulo: poll.titulo || '',
      fecha: '',
      hora: '',
      departamentos: poll.departamentos || [],
      puntos_dia: [{ text: '' }],
      notas: poll.notas || '',
    });
  }, [open, poll]);

  if (!open || !poll) return null;

  const updatePunto = (index, text) => {
    const puntos = [...(form.puntos_dia || [{ text: '' }])];
    puntos[index] = { text };
    setForm({ ...form, puntos_dia: puntos });
  };

  const addPunto = () => {
    setForm({ ...form, puntos_dia: [...(form.puntos_dia || []), { text: '' }] });
  };

  const removePunto = (index) => {
    const puntos = (form.puntos_dia || []).filter((_, i) => i !== index);
    setForm({ ...form, puntos_dia: puntos.length ? puntos : [{ text: '' }] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Confirmar reunión</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onConfirm({
              optionId: selectedOptionId,
              titulo: form.titulo,
              puntos_dia: form.puntos_dia,
            });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha elegida *</label>
            <select
              value={selectedOptionId}
              onChange={(e) => setSelectedOptionId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
              required
            >
              {poll.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {formatMeetingDate(option.fecha, option.hora)} · {option.votes.yes} sí,{' '}
                  {option.votes.maybe} quizás, {option.votes.no} no
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la reunión</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
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
            <button type="button" onClick={addPunto} className="mt-2 text-sm text-violet-600 hover:underline">
              + Añadir punto
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Creando…' : 'Crear reunión'}
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

function VoteBar({ votes }) {
  const total = Math.max(votes.total, 1);
  const yesPct = Math.round((votes.yes / total) * 100);
  const maybePct = Math.round((votes.maybe / total) * 100);
  const noPct = Math.max(0, 100 - yesPct - maybePct);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
        {votes.yes > 0 ? (
          <span className="bg-emerald-500" style={{ width: `${yesPct}%` }} title={`${votes.yes} sí`} />
        ) : null}
        {votes.maybe > 0 ? (
          <span className="bg-amber-400" style={{ width: `${maybePct}%` }} title={`${votes.maybe} quizás`} />
        ) : null}
        {votes.no > 0 ? (
          <span className="bg-red-400" style={{ width: `${noPct}%` }} title={`${votes.no} no`} />
        ) : null}
      </div>
      <p className="text-xs text-gray-500">
        {votes.yes} sí · {votes.maybe} quizás · {votes.no} no
        {votes.total ? ` · ${votes.total} respuesta${votes.total === 1 ? '' : 's'}` : ''}
      </p>
    </div>
  );
}

function PollCard({ poll, onVote, onClose, onDelete, onConfirm, saving }) {
  const isOpen = poll.status === 'open';

  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isOpen ? 'Abierta' : 'Cerrada'}
            </span>
            {poll.meeting_id ? (
              <span className="inline-flex rounded-full bg-violet-100 text-violet-800 px-2.5 py-0.5 text-xs font-medium">
                Reunión creada
              </span>
            ) : null}
          </div>
          <h3 className="font-semibold text-gray-900 mt-2">{poll.titulo}</h3>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {isOpen && !poll.meeting_id ? (
            <>
              <button
                type="button"
                onClick={() => onConfirm(poll)}
                className="text-xs text-violet-700 hover:underline font-medium"
              >
                Confirmar fecha
              </button>
              <button
                type="button"
                onClick={() => void onClose(poll)}
                className="text-xs text-gray-600 hover:underline"
              >
                Cerrar
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void onDelete(poll)}
            className="text-xs text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {poll.departamentos.map((dept) => (
          <span
            key={dept}
            className="inline-flex rounded-full bg-violet-100 text-violet-800 px-2.5 py-0.5 text-xs font-medium"
          >
            {dept}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {poll.options.map((option) => {
          const myVote = poll.myVotes?.[option.id] || null;
          return (
            <div key={option.id} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
              <p className="text-sm font-medium text-gray-900">
                {formatMeetingDate(option.fecha, option.hora)}
              </p>
              <VoteBar votes={option.votes} />
              {isOpen ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(POLL_VOTE_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      disabled={saving}
                      onClick={() => void onVote(poll.id, option.id, value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                        myVote === value
                          ? value === 'yes'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : value === 'maybe'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-violet-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {poll.notas ? <p className="mt-3 text-xs text-gray-500 border-t pt-3">{poll.notas}</p> : null}
    </article>
  );
}

export default function StaffMeetingPollsSection({ onMeetingCreated }) {
  const [polls, setPolls] = useState([]);
  const [tablesReady, setTablesReady] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmPoll, setConfirmPoll] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_POLL_FORM, options: [{ fecha: '', hora: '' }] });

  const loadPolls = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pollsFetch('/api/coordinator/meeting-polls', {}, { soft: true });
      if (typeof data.tablesReady === 'boolean') setTablesReady(data.tablesReady);
      if (data.error) {
        setPolls([]);
        return;
      }
      setPolls(data.polls || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolls();
  }, [loadPolls]);

  const createPoll = async () => {
    if (!(form.departamentos || []).length) {
      alert('Selecciona al menos un departamento.');
      return;
    }
    const options = normalizePollOptions(form.options);
    if (options.length < 2) {
      alert('Añade al menos dos fechas posibles.');
      return;
    }
    if (!form.titulo?.trim()) {
      alert('Escribe un título para la encuesta.');
      return;
    }
    setSaving(true);
    try {
      const result = await pollsFetch('/api/coordinator/meeting-polls', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', ...form, options }),
      });
      setModalOpen(false);
      setForm({ ...EMPTY_POLL_FORM, options: [{ fecha: '', hora: '' }] });
      await loadPolls();
      if (result.buzonNotified === false && result.buzonError) {
        alert(`Encuesta publicada, pero no se pudo avisar en el buzón: ${result.buzonError}`);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const votePoll = async (pollId, optionId, vote) => {
    setSaving(true);
    try {
      await pollsFetch('/api/coordinator/meeting-polls', {
        method: 'POST',
        body: JSON.stringify({ action: 'vote', id: pollId, optionId, vote }),
      });
      await loadPolls();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const closePoll = async (poll) => {
    if (!window.confirm('¿Cerrar esta encuesta sin crear reunión?')) return;
    setSaving(true);
    try {
      await pollsFetch('/api/coordinator/meeting-polls', {
        method: 'POST',
        body: JSON.stringify({ action: 'close', id: poll.id }),
      });
      await loadPolls();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePoll = async (poll) => {
    if (!window.confirm('¿Eliminar esta encuesta?')) return;
    setSaving(true);
    try {
      await pollsFetch('/api/coordinator/meeting-polls', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: poll.id }),
      });
      await loadPolls();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmMeeting = async ({ optionId, titulo, puntos_dia }) => {
    if (!confirmPoll) return;
    setSaving(true);
    try {
      const result = await pollsFetch('/api/coordinator/meeting-polls', {
        method: 'POST',
        body: JSON.stringify({
          action: 'confirm',
          id: confirmPoll.id,
          optionId,
          titulo,
          puntos_dia,
        }),
      });
      setConfirmPoll(null);
      await loadPolls();
      onMeetingCreated?.();
      if (result.buzonNotified === false && result.buzonError) {
        alert(`Reunión creada, pero no se pudo avisar en el buzón: ${result.buzonError}`);
      }
      if (result.notionSync?.error) {
        alert(`Reunión creada, pero Notion no se actualizó: ${result.notionSync.error}`);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const schemaHint = shouldShowSchemaSetupHint(tablesReady);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Encuestas de fecha</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Propón varias fechas y deja que el equipo vote disponibilidad (sí, quizás, no). Cuando
            haya consenso, confirma la fecha y crea la reunión.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={saving}
          className="px-4 py-2 border border-violet-300 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 disabled:opacity-50 shrink-0"
        >
          + Nueva encuesta
        </button>
      </div>

      {schemaHint ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Las tablas de encuestas aún no están disponibles en Supabase. Si acabas de aplicar la
          migración, espera un minuto y recarga esta página. Script:{' '}
          <code className="bg-amber-100 px-1 rounded">scripts/staff_reuniones_encuestas.sql</code>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500 py-4">Cargando encuestas…</p>
      ) : polls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-10 text-center">
          <p className="text-sm text-gray-600">No hay encuestas abiertas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={votePoll}
              onClose={closePoll}
              onDelete={deletePoll}
              onConfirm={setConfirmPoll}
              saving={saving}
            />
          ))}
        </div>
      )}

      <PollFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onChange={setForm}
        onSave={createPoll}
        saving={saving}
      />

      <ConfirmMeetingModal
        open={Boolean(confirmPoll)}
        poll={confirmPoll}
        onClose={() => setConfirmPoll(null)}
        onConfirm={confirmMeeting}
        saving={saving}
      />
    </section>
  );
}

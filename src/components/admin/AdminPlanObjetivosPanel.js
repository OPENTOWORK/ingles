'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessPlanObjetivosAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import FormularioRunner from '@/components/formularios/FormularioRunner';
import { WELCOME_FORM_MOMENT } from '@/lib/formularioRespuestas';
import styles from './AdminPlanObjetivosPanel.module.css';

const QUESTION_TYPES = [
  { id: 'varias', label: 'Varias opciones' },
  { id: 'una', label: 'Una opción' },
  { id: 'texto', label: 'Texto libre' },
  { id: 'fecha', label: 'Fecha' },
  { id: 'info', label: 'Texto informativo' },
];

const TYPE_LABEL = Object.fromEntries(QUESTION_TYPES.map((type) => [type.id, type.label]));

function blankQuestion() {
  return {
    titulo: '',
    ayuda: '',
    tipo: 'varias',
    obligatoria: false,
    opciones: [{ id: '', label: '', hint: '' }],
  };
}

function questionToDraft(question) {
  return {
    titulo: question.titulo || '',
    ayuda: question.ayuda || '',
    tipo: question.tipo || 'varias',
    obligatoria: Boolean(question.obligatoria),
    opciones: question.opciones?.length
      ? question.opciones.map((option) => ({
          id: option.id || '',
          label: option.label || '',
          hint: option.hint || '',
        }))
      : [{ id: '', label: '', hint: '' }],
  };
}

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
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function needsOptions(tipo) {
  return tipo === 'varias' || tipo === 'una';
}

function FormularioPreview({ form }) {
  const [done, setDone] = useState(false);

  if (!form.preguntas?.length) {
    return <p className={styles.empty}>Este formulario no tiene preguntas.</p>;
  }

  if (done) {
    return (
      <article className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>Vista previa terminada</h2>
        <p className={styles.welcomeText}>Las respuestas de esta prueba no se han guardado.</p>
      </article>
    );
  }

  return (
    <FormularioRunner form={form} showHeader finishLabel="Terminar" onFinish={() => setDone(true)} />
  );
}

export default function AdminPlanObjetivosPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('edit');
  const [previewKey, setPreviewKey] = useState(0);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftMoment, setDraftMoment] = useState('');
  const [creatingForm, setCreatingForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [questionEditor, setQuestionEditor] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(blankQuestion);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const selected = forms.find((form) => form.id === selectedId) || null;

  const loadForms = useCallback(async () => {
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/formularios/', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los formularios.');
    const nextForms = json.forms || [];
    setForms(nextForms);
    setSelectedId((current) => {
      if (current && nextForms.some((form) => form.id === current)) return current;
      return nextForms[0]?.id || '';
    });
    return nextForms;
  }, []);

  const mutate = useCallback(
    async (payload) => {
      setBusy(true);
      setError('');
      try {
        const headers = await getAdminFetchHeaders();
        const res = await fetch('/api/admin/formularios/', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'No se ha podido guardar.');
        const nextForms = json.forms || [];
        setForms(nextForms);
        return nextForms;
      } catch (err) {
        setError(err.message || 'No se ha podido guardar.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessPlanObjetivosAdminPanel(role)) {
        router.push('/perfil');
        return;
      }

      try {
        await loadForms();
      } catch (err) {
        if (!cancelled) setError(err.message || 'No se pudieron cargar los formularios.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, loadForms]);

  useEffect(() => {
    setDraftTitle(selected?.titulo || '');
    setDraftDescription(selected?.descripcion || '');
    setDraftMoment(selected?.momento || '');
    setQuestionEditor(null);
    setMode('edit');
  }, [selected?.id]);

  const openQuestionEditor = (question) => {
    setMode('edit');
    if (question) {
      setQuestionEditor(question.id);
      setQuestionDraft(questionToDraft(question));
      return;
    }
    setQuestionEditor('new');
    setQuestionDraft(blankQuestion());
  };

  const saveForm = async () => {
    if (!selected) return;
    const next = await mutate({
      action: 'update-form',
      id: selected.id,
      titulo: draftTitle,
      descripcion: draftDescription,
      momento: draftMoment || null,
    });
    if (next) toast.success('Formulario guardado');
  };

  const createForm = async () => {
    const next = await mutate({ action: 'create-form', titulo: newTitle });
    if (!next) return;
    const created = [...next].reverse().find((form) => form.titulo.trim() === newTitle.trim());
    if (created) setSelectedId(created.id);
    setNewTitle('');
    setCreatingForm(false);
    toast.success('Formulario creado');
  };

  const deleteForm = () => {
    if (!selected) return;
    setConfirmDelete({ kind: 'form', id: selected.id, titulo: selected.titulo });
  };

  const saveQuestion = async () => {
    if (!selected) return;
    const payload = {
      action: questionEditor === 'new' ? 'create-question' : 'update-question',
      formularioId: selected.id,
      id: questionEditor === 'new' ? undefined : questionEditor,
      ...questionDraft,
    };
    const next = await mutate(payload);
    if (!next) return;
    setQuestionEditor(null);
    toast.success(questionEditor === 'new' ? 'Pregunta creada' : 'Pregunta guardada');
  };

  const deleteQuestion = (question) => {
    setConfirmDelete({ kind: 'question', id: question.id, titulo: question.titulo });
  };

  const runConfirmedDelete = async () => {
    if (!confirmDelete) return;
    const pending = confirmDelete;
    setConfirmDelete(null);
    if (pending.kind === 'form') {
      const next = await mutate({ action: 'delete-form', id: pending.id });
      if (next) toast.success('Formulario borrado');
      return;
    }
    const next = await mutate({ action: 'delete-question', id: pending.id });
    if (next) {
      if (questionEditor === pending.id) setQuestionEditor(null);
      toast.success('Pregunta borrada');
    }
  };

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setConfirmDelete(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmDelete]);

  if (loading) {
    return <RouteLoadingMascot label="Cargando formularios…" variant={5} width={120} />;
  }

  return (
    <div className="admin-module admin-module--narrow">
      <PanelPageHeader
        title="Formularios"
        subtitle="Crea, edita o borra formularios y sus preguntas. La vista previa no guarda respuestas."
        mascotVariant={8}
      />

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Formularios">
          {forms.map((form) => (
            <button
              key={form.id}
              type="button"
              role="tab"
              aria-selected={form.id === selectedId}
              className={`${styles.tab} ${form.id === selectedId ? styles.tabActive : ''}`}
              onClick={() => setSelectedId(form.id)}
            >
              {form.titulo}
            </button>
          ))}
          <button type="button" className={styles.restart} onClick={() => setCreatingForm(true)}>
            Nuevo formulario
          </button>
        </div>
        {selected && mode === 'preview' && (
          <button type="button" className={styles.restart} onClick={() => setPreviewKey((key) => key + 1)}>
            Reiniciar
          </button>
        )}
      </div>

      {creatingForm && (
        <div className={styles.editor}>
          <label className={styles.label}>
            Nombre del formulario
            <input
              className={styles.fieldInput}
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Por ejemplo, Encuesta de satisfacción"
            />
          </label>
          <div className={styles.rowActions}>
            <button type="button" className={styles.primary} disabled={busy || !newTitle.trim()} onClick={createForm}>
              Crear
            </button>
            <button type="button" className={styles.restart} onClick={() => setCreatingForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!selected && !creatingForm && (
        <p className={styles.empty}>No hay formularios. Crea el primero con «Nuevo formulario».</p>
      )}

      {selected && (
        <>
          <div className={styles.editor}>
            <label className={styles.label}>
              Nombre
              <input
                className={styles.fieldInput}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
              />
            </label>
            <label className={styles.label}>
              Descripción
              <textarea
                className={styles.fieldInput}
                rows={2}
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
              />
            </label>
            <label className={styles.label}>
              Cuándo se muestra
              <select
                className={styles.fieldInput}
                value={draftMoment}
                onChange={(event) => setDraftMoment(event.target.value)}
              >
                <option value="">Solo en la vista previa</option>
                <option value={WELCOME_FORM_MOMENT}>
                  Al alumno, al entrar por primera vez con el correo confirmado
                </option>
              </select>
            </label>
            {draftMoment === WELCOME_FORM_MOMENT && (
              <p className={styles.momentNote}>
                Se muestra una sola vez a cada alumno y no puede cerrarlo sin enviarlo. Sus respuestas
                aparecen en su ficha de Administración, en «Formularios».
              </p>
            )}
            <div className={styles.rowActions}>
              <button type="button" className={styles.primary} disabled={busy} onClick={saveForm}>
                Guardar formulario
              </button>
              <button type="button" className={styles.danger} disabled={busy} onClick={deleteForm}>
                Borrar formulario
              </button>
              <button
                type="button"
                className={mode === 'preview' ? styles.primary : styles.restart}
                onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
              >
                {mode === 'preview' ? 'Editar preguntas' : 'Vista previa'}
              </button>
            </div>
          </div>

          {mode === 'preview' ? (
            <FormularioPreview key={`${selected.id}-${previewKey}`} form={selected} />
          ) : (
            <div className={styles.questionList}>
              <div className={styles.rowActions}>
                <button type="button" className={styles.primary} onClick={() => openQuestionEditor(null)}>
                  Nueva pregunta
                </button>
              </div>

              {questionEditor === 'new' && (
                <QuestionEditor
                  draft={questionDraft}
                  setDraft={setQuestionDraft}
                  busy={busy}
                  onSave={saveQuestion}
                  onCancel={() => setQuestionEditor(null)}
                />
              )}

              {selected.preguntas.map((question, index) => (
                <article key={question.id} className={styles.questionCard}>
                  {questionEditor === question.id ? (
                    <QuestionEditor
                      draft={questionDraft}
                      setDraft={setQuestionDraft}
                      busy={busy}
                      onSave={saveQuestion}
                      onCancel={() => setQuestionEditor(null)}
                    />
                  ) : (
                    <>
                      <div>
                        <h3 className={styles.questionTitle}>{question.titulo}</h3>
                        <p className={styles.questionMeta}>
                          {TYPE_LABEL[question.tipo] || question.tipo}
                          {question.obligatoria ? ' · Obligatoria' : ''}
                          {question.opciones?.length ? ` · ${question.opciones.length} opciones` : ''}
                        </p>
                      </div>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.restart}
                          disabled={busy || index === 0}
                          onClick={() => mutate({ action: 'move-question', id: question.id, direction: 'up' })}
                        >
                          Subir
                        </button>
                        <button
                          type="button"
                          className={styles.restart}
                          disabled={busy || index === selected.preguntas.length - 1}
                          onClick={() => mutate({ action: 'move-question', id: question.id, direction: 'down' })}
                        >
                          Bajar
                        </button>
                        <button type="button" className={styles.restart} onClick={() => openQuestionEditor(question)}>
                          Editar
                        </button>
                        <button type="button" className={styles.danger} disabled={busy} onClick={() => deleteQuestion(question)}>
                          Borrar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}

              {selected.preguntas.length === 0 && questionEditor !== 'new' && (
                <p className={styles.empty}>Este formulario todavía no tiene preguntas.</p>
              )}
            </div>
          )}
        </>
      )}

      {confirmDelete && (
        <div className={styles.overlay} role="presentation" onClick={() => setConfirmDelete(null)}>
          <div
            className={styles.confirm}
            role="dialog"
            aria-modal="true"
            aria-labelledby="formulario-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="formulario-confirm-title" className={styles.confirmTitle}>
              {confirmDelete.kind === 'form' ? 'Borrar formulario' : 'Borrar pregunta'}
            </h2>
            <p className={styles.confirmText}>
              {confirmDelete.kind === 'form'
                ? `Se eliminará «${confirmDelete.titulo}» y todas sus preguntas. Esta acción no se puede deshacer.`
                : `Se eliminará la pregunta «${confirmDelete.titulo}». Esta acción no se puede deshacer.`}
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.restart} onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button type="button" className={styles.confirmDanger} disabled={busy} onClick={runConfirmedDelete}>
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionEditor({ draft, setDraft, busy, onSave, onCancel }) {
  const updateOption = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      opciones: current.opciones.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  return (
    <div className={styles.questionEditor}>
      <label className={styles.label}>
        Pregunta
        <input
          className={styles.fieldInput}
          value={draft.titulo}
          onChange={(event) => setDraft((current) => ({ ...current, titulo: event.target.value }))}
        />
      </label>
      <label className={styles.label}>
        Ayuda
        <input
          className={styles.fieldInput}
          value={draft.ayuda}
          onChange={(event) => setDraft((current) => ({ ...current, ayuda: event.target.value }))}
          placeholder="Texto corto bajo la pregunta"
        />
      </label>
      <label className={styles.label}>
        Tipo
        <select
          className={styles.fieldInput}
          value={draft.tipo}
          onChange={(event) => setDraft((current) => ({ ...current, tipo: event.target.value }))}
        >
          {QUESTION_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      {draft.tipo !== 'info' && (
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={draft.obligatoria}
            onChange={(event) => setDraft((current) => ({ ...current, obligatoria: event.target.checked }))}
          />
          Obligatoria
        </label>
      )}
      {needsOptions(draft.tipo) && (
        <div className={styles.optionsEditor}>
          <span className={styles.label}>Opciones</span>
          {draft.opciones.map((option, index) => (
            <div key={`${option.id}-${index}`} className={styles.optionRow}>
              <input
                className={styles.fieldInput}
                value={option.label}
                placeholder="Opción"
                onChange={(event) => updateOption(index, 'label', event.target.value)}
              />
              <input
                className={styles.fieldInput}
                value={option.hint}
                placeholder="Aclaración"
                onChange={(event) => updateOption(index, 'hint', event.target.value)}
              />
              <button
                type="button"
                className={styles.danger}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    opciones: current.opciones.filter((_, optionIndex) => optionIndex !== index),
                  }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.restart}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                opciones: [...current.opciones, { id: '', label: '', hint: '' }],
              }))
            }
          >
            Añadir opción
          </button>
        </div>
      )}
      <div className={styles.rowActions}>
        <button type="button" className={styles.primary} disabled={busy || !draft.titulo.trim()} onClick={onSave}>
          Guardar pregunta
        </button>
        <button type="button" className={styles.restart} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

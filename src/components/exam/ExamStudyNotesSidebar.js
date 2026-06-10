'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { buildStudyNotesContextKey, formatStudyNoteDate } from '@/lib/studyNotes';

export default function ExamStudyNotesSidebar({
  context = null,
  contextLabel = '',
  lang = 'en',
  overlayContainerRef = null,
}) {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const { userId, notes, ready, addNote, updateNote, saveNoteNow, deleteNote, getOrCreateScratchNote } =
    useStudyNotes();

  const contextKey = useMemo(() => (context ? buildStudyNotesContextKey(context) : null), [context]);

  const scratchNote = useMemo(
    () => (contextKey ? notes.find((n) => n.contextKey === contextKey) : null),
    [notes, contextKey],
  );

  const extraSessionNotes = useMemo(() => {
    if (!contextKey) return notes.filter((n) => !n.contextKey && n.id !== scratchNote?.id);
    return notes.filter((n) => n.contextKey === contextKey && n.id !== scratchNote?.id);
  }, [contextKey, notes, scratchNote?.id]);

  const overlayRoot = overlayContainerRef?.current || null;

  useEffect(() => {
    if (!userId || !context || !open) return;
    getOrCreateScratchNote(context, contextLabel);
  }, [userId, context, contextLabel, open, getOrCreateScratchNote]);

  useEffect(() => {
    setDraft(scratchNote?.content || '');
  }, [scratchNote?.id, scratchNote?.content]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const labels = {
    toggle: en ? 'Notes' : 'Notas',
    title: en ? 'Study notes' : 'Notas de estudio',
    hint: en
      ? 'Jot down ideas while you practise. Saved to Profile → Tools.'
      : 'Apunta ideas mientras practicas. Se guardan en Perfil → Tools.',
    session: en ? 'This session' : 'Esta sesión',
    save: en ? 'Save note' : 'Guardar nota',
    saving: en ? 'Saving…' : 'Guardando…',
    saved: en ? 'Saved' : 'Guardada',
    newNote: en ? '+ New note' : '+ Nueva nota',
    signIn: en ? 'Sign in to save notes to your profile.' : 'Inicia sesión para guardar notas en tu perfil.',
    profile: en ? 'Open in Profile → Tools' : 'Abrir en Perfil → Tools',
    placeholder: en ? 'Write your ideas here…' : 'Escribe tus ideas aquí…',
    titlePh: en ? 'Note title' : 'Título',
    close: en ? 'Close' : 'Cerrar',
  };

  const handleSave = async () => {
    if (!scratchNote || saving) return;
    setSaving(true);
    await saveNoteNow(scratchNote.id, { content: draft });
    setSaving(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const panelContent = (
    <div className="exam-notes-popover__panel">
      <header className="exam-notes-popover__head">
        <div>
          <h2 className="exam-notes-popover__title">{labels.title}</h2>
          <p className="exam-notes-popover__hint">{labels.hint}</p>
        </div>
        <button
          type="button"
          className="exam-notes-popover__close"
          onClick={() => setOpen(false)}
          aria-label={labels.close}
        >
          ×
        </button>
      </header>

      {!userId ? (
        <p className="exam-notes-popover__signin">{labels.signIn}</p>
      ) : !ready ? (
        <p className="exam-notes-popover__loading">{en ? 'Loading…' : 'Cargando…'}</p>
      ) : (
        <>
          <div className="exam-notes-popover__scratch">
            <label className="exam-notes-popover__label" htmlFor="exam-notes-scratch">
              {labels.session}
              {contextLabel ? ` · ${contextLabel}` : ''}
            </label>
            <textarea
              id="exam-notes-scratch"
              className="exam-notes-popover__textarea"
              rows={6}
              value={draft}
              placeholder={labels.placeholder}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          <div className="exam-notes-popover__toolbar">
            <button
              type="button"
              className="exam-notes-popover__save"
              onClick={handleSave}
              disabled={!scratchNote || saving || !draft.trim()}
            >
              {saving ? labels.saving : savedFlash ? labels.saved : labels.save}
            </button>
            <button
              type="button"
              className="exam-notes-popover__new"
              onClick={() =>
                addNote({
                  title: en ? 'New note' : 'Nueva nota',
                  content: '',
                  tags: ['exam-practice'],
                  context: context ? { ...context, contextKey } : null,
                })
              }
            >
              {labels.newNote}
            </button>
          </div>

          {extraSessionNotes.length > 0 ? (
            <ul className="exam-notes-popover__list">
              {extraSessionNotes.map((note) => (
                <li key={note.id} className="exam-notes-popover__item">
                  <div className="exam-notes-popover__item-head">
                    <input
                      type="text"
                      className="exam-notes-popover__title-input"
                      value={note.title}
                      placeholder={labels.titlePh}
                      onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    />
                    <button
                      type="button"
                      className="exam-notes-popover__delete"
                      onClick={() => deleteNote(note.id)}
                      aria-label={en ? 'Delete note' : 'Eliminar nota'}
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    className="exam-notes-popover__textarea exam-notes-popover__textarea--compact"
                    rows={3}
                    value={note.content}
                    placeholder={labels.placeholder}
                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                  />
                  <span className="exam-notes-popover__date">
                    {formatStudyNoteDate(note.updatedAt || note.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <Link href="/perfil?tab=study-tools" className="exam-notes-popover__profile-link">
            {labels.profile} →
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className={`exam-notes-popover${open ? ' exam-notes-popover--open' : ''}`}>
      <button
        type="button"
        className="exam-notes-popover__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="exam-notes-popover__trigger-icon" aria-hidden>
          📝
        </span>
        <span className="exam-notes-popover__trigger-label">{labels.toggle}</span>
      </button>

      {open && overlayRoot
        ? createPortal(
            <div className="exam-notes-popover__layer" role="presentation">
              <button
                type="button"
                className="exam-notes-popover__backdrop"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
              />
              {panelContent}
            </div>,
            overlayRoot,
          )
        : null}
    </div>
  );
}

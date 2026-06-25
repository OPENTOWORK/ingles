'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { buildStudyNotePracticeHref, formatStudyNoteDate } from '@/lib/studyNotes';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';

function hasNoteContent(note) {
  return Boolean((note?.content || '').trim());
}

export default function ProfileStudyNotesPanel({ lang = 'en' }) {
  const en = lang === 'en';
  const { userId, notes, ready, saveNoteNow, deleteNote } = useStudyNotes();
  const [editingId, setEditingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const savedNotes = useMemo(() => notes.filter(hasNoteContent), [notes]);

  const labels = {
    section: en ? 'My study notes' : 'Mis notas de estudio',
    context: en ? 'From exam practice' : 'Desde práctica de examen',
    empty: en
      ? 'No notes yet. Use the Notes panel during exam or skill practice to capture your ideas.'
      : 'Aún no hay notas. Usa el panel de notas durante la práctica de examen o skill.',
    signIn: en ? 'Sign in to see your study notes.' : 'Inicia sesión para ver tus notas.',
    loading: en ? 'Loading notes…' : 'Cargando notas…',
    open: en ? 'Open test' : 'Abrir test',
    edit: en ? 'Edit note' : 'Editar nota',
    save: en ? 'Save changes' : 'Guardar cambios',
    cancel: en ? 'Cancel' : 'Cancelar',
    remove: en ? 'Remove from profile' : 'Quitar del perfil',
    saving: en ? 'Saving…' : 'Guardando…',
    titlePh: en ? 'Note title' : 'Título de la nota',
    contentPh: en ? 'Write your note…' : 'Escribe tu nota…',
    untitled: en ? 'Untitled' : 'Sin título',
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setDrafts((prev) => ({
      ...prev,
      [note.id]: {
        title: note.title || '',
        content: note.content || '',
      },
    }));
  };

  const cancelEditing = (noteId) => {
    setEditingId((current) => (current === noteId ? null : current));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
  };

  const handleSave = async (noteId) => {
    const draft = drafts[noteId];
    if (!draft || savingId) return;

    setSavingId(noteId);
    try {
      await saveNoteNow(noteId, {
        title: draft.title.trim() || labels.untitled,
        content: draft.content,
      });
      cancelEditing(noteId);
    } finally {
      setSavingId(null);
    }
  };

  const handleRemove = async (noteId) => {
    if (!noteId || removingId) return;
    setRemovingId(noteId);
    try {
      if (editingId === noteId) cancelEditing(noteId);
      await deleteNote(noteId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <ProfileCollapsibleSection title={labels.section}>
      {!userId ? (
        <p className="profile-notes-empty">{labels.signIn}</p>
      ) : !ready ? (
        <p className="profile-notes-empty">{labels.loading}</p>
      ) : savedNotes.length === 0 ? (
        <p className="profile-notes-empty">{labels.empty}</p>
      ) : (
        <div className="notes-grid">
          {savedNotes.map((note) => {
            const href = buildStudyNotePracticeHref(note.context);
            const isEditing = editingId === note.id;
            const draft = drafts[note.id] || {
              title: note.title || '',
              content: note.content || '',
            };

            return (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  {isEditing ? (
                    <input
                      type="text"
                      className="note-title-input"
                      value={draft.title}
                      placeholder={labels.titlePh}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [note.id]: { ...draft, title: e.target.value },
                        }))
                      }
                    />
                  ) : (
                    <h3 className="note-title-display">
                      {note.title || labels.untitled}
                    </h3>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    className="note-content-input"
                    rows={5}
                    value={draft.content}
                    placeholder={labels.contentPh}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [note.id]: { ...draft, content: e.target.value },
                      }))
                    }
                  />
                ) : (
                  <p className="note-content-display">{note.content}</p>
                )}

                <div className="note-footer">
                  <div className="note-date">
                    {formatStudyNoteDate(note.updatedAt || note.createdAt)}
                  </div>
                  <div className="note-tags">
                    {(note.tags || []).map((tag) => (
                      <span key={tag} className="note-tag">
                        {tag}
                      </span>
                    ))}
                    {note.contextKey || note.context?.contextKey ? (
                      <span className="note-tag note-tag--context">{labels.context}</span>
                    ) : null}
                  </div>
                </div>

                <div className="note-actions">
                  {href && !isEditing ? (
                    <Link href={href} className="favorite-open-link">
                      {labels.open}
                    </Link>
                  ) : null}

                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="note-save-btn"
                        onClick={() => void handleSave(note.id)}
                        disabled={savingId === note.id || !draft.content.trim()}
                      >
                        {savingId === note.id ? labels.saving : labels.save}
                      </button>
                      <button
                        type="button"
                        className="note-cancel-btn"
                        onClick={() => cancelEditing(note.id)}
                        disabled={savingId === note.id}
                      >
                        {labels.cancel}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="note-edit-btn"
                      onClick={() => startEditing(note)}
                    >
                      {labels.edit}
                    </button>
                  )}

                  <button
                    type="button"
                    className="remove-favorite-btn"
                    onClick={() => void handleRemove(note.id)}
                    disabled={removingId === note.id || savingId === note.id}
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .profile-notes-empty {
          margin: 0;
          padding: 1rem 0;
          color: #64748b;
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .note-title-display {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .note-content-display {
          margin: 0.5rem 0 0;
          white-space: pre-wrap;
          font-size: 0.92rem;
          line-height: 1.55;
          color: #334155;
        }
        .note-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-top: 12px;
        }
        .note-edit-btn,
        .note-save-btn,
        .note-cancel-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #334155;
        }
        .note-save-btn {
          background: #0070f3;
          border-color: #0070f3;
          color: #fff;
        }
        .note-save-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .note-edit-btn:hover,
        .note-cancel-btn:hover {
          background: #f8fafc;
        }
        .note-save-btn:hover:not(:disabled) {
          background: #0059c9;
        }
      `}</style>
    </ProfileCollapsibleSection>
  );
}

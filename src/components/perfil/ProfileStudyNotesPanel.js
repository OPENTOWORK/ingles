'use client';

import { useMemo } from 'react';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { formatStudyNoteDate } from '@/lib/studyNotes';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';

function hasNoteContent(note) {
  return Boolean((note?.content || '').trim());
}

export default function ProfileStudyNotesPanel({ lang = 'en' }) {
  const en = lang === 'en';
  const { userId, notes, ready } = useStudyNotes();

  const savedNotes = useMemo(() => notes.filter(hasNoteContent), [notes]);

  const labels = {
    section: en ? 'My study notes' : 'Mis notas de estudio',
    context: en ? 'From exam practice' : 'Desde práctica de examen',
    empty: en
      ? 'No notes yet. Use the Notes panel during exam or skill practice to capture your ideas.'
      : 'Aún no hay notas. Usa el panel de notas durante la práctica de examen o skill.',
    signIn: en ? 'Sign in to see your study notes.' : 'Inicia sesión para ver tus notas.',
    loading: en ? 'Loading notes…' : 'Cargando notas…',
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
        {savedNotes.map((note) => (
          <div key={note.id} className="note-card note-card--readonly">
            <div className="note-header">
              <h3 className="note-title-display">{note.title || (en ? 'Untitled' : 'Sin título')}</h3>
            </div>
            <p className="note-content-display">{note.content}</p>
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
          </div>
        ))}
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
        .note-card--readonly .note-title-display {
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
      `}</style>
    </ProfileCollapsibleSection>
  );
}

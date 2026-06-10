const STORAGE_PREFIX = 'dralo_study_notes_';
export const STUDY_NOTES_UPDATED_EVENT = 'dralo-study-notes-updated';

export function studyNotesStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export function loadStudyNotes(userId) {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(studyNotesStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudyNotes(userId, notes) {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(studyNotesStorageKey(userId), JSON.stringify(notes));
  window.dispatchEvent(new CustomEvent(STUDY_NOTES_UPDATED_EVENT, { detail: { userId } }));
}

export function createStudyNote({
  title = 'New note',
  content = '',
  tags = [],
  context = null,
  contextKey = null,
} = {}) {
  const now = new Date().toISOString();
  const resolvedContextKey =
    contextKey || context?.contextKey || (context ? buildStudyNotesContextKey(context) : null);
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
    context: context || null,
    contextKey: resolvedContextKey || null,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildStudyNotesContextKey(context = {}) {
  const slug = context.slug || 'exam';
  const skill = context.skillRoute || context.skill || 'general';
  const mode = context.examMode ? 'exam-mode' : 'skill';
  const part = context.partNumber ?? 0;
  const slot = context.examSlot ?? 0;
  return `${slug}:${skill}:${mode}:p${part}:e${slot}`;
}

export function formatStudyNoteDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getScratchNoteId(contextKey) {
  return `scratch:${contextKey}`;
}

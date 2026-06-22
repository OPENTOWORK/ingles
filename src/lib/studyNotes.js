import { applyExamSlotToHref, getLevelSkillPracticeHref } from '@/data/nivelesLevelHub';
import { buildExamModePracticeHref } from '@/utils/examModeSession';

const STORAGE_PREFIX = 'dralo_study_notes_';
export const STUDY_NOTES_UPDATED_EVENT = 'dralo-study-notes-updated';

export function studyNotesStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export function loadStudyNotes(userId) {
  if (typeof window === 'undefined') return [];
  const key = userId || 'guest';
  try {
    const raw = localStorage.getItem(studyNotesStorageKey(key));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudyNotes(userId, notes) {
  if (typeof window === 'undefined') return;
  const key = userId || 'guest';
  localStorage.setItem(studyNotesStorageKey(key), JSON.stringify(notes));
  window.dispatchEvent(new CustomEvent(STUDY_NOTES_UPDATED_EVENT, { detail: { userId: key } }));
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

/** @param {Record<string, unknown> | null | undefined} context */
export function buildStudyNotePracticeHref(context) {
  if (!context || typeof context !== 'object') return null;

  const levelSlug = String(context.slug || context.levelSlug || 'b2').toLowerCase();
  const skillRoute = context.skillRoute || context.skill || null;
  const partNumber = Number(context.partNumber);
  const examSlot = Number(context.examSlot) || 1;

  let base =
    (skillRoute && getLevelSkillPracticeHref(levelSlug, skillRoute)) ||
    `/niveles/${levelSlug}`;

  if (context.examMode) {
    return buildExamModePracticeHref(base, examSlot, {
      part: Number.isFinite(partNumber) && partNumber > 0 ? partNumber : undefined,
    });
  }

  if (Number.isFinite(partNumber) && partNumber > 0) {
    const sep = base.includes('?') ? '&' : '?';
    base = `${base}${sep}part=${partNumber}`;
  }

  if (Number.isFinite(examSlot) && examSlot > 1) {
    base = applyExamSlotToHref(base, levelSlug, examSlot);
  } else if (examSlot === 1) {
    const sep = base.includes('?') ? '&' : '?';
    if (!base.includes('examen=')) base = `${base}${sep}examen=1`;
  }

  return base;
}

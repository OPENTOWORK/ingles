import { mergeExamModeStatsRows } from '@/utils/examModeStatsRows';
import { computeExamModeStats } from '@/utils/examModeStats';

export const EXAM_MODE_ATTEMPT_HISTORY_VERSION = 1;
const MAX_ATTEMPTS = 30;
const HISTORY_SERVER_SLOT_OFFSET = 9000;

function storageKey(slug, examSlot, userId = '') {
  const uid = userId ? `${userId}_` : '';
  return `dralo_exam_mode_attempts_v${EXAM_MODE_ATTEMPT_HISTORY_VERSION}_${uid}${slug}_${examSlot}`;
}

export function examModeAttemptHistoryServerSlot(examSlot) {
  return HISTORY_SERVER_SLOT_OFFSET + Number(examSlot || 1);
}

export function loadExamModeAttemptHistoryLocal(slug, examSlot, userId = '') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(slug, examSlot, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.attempts)) return [];
    return parsed.attempts;
  } catch {
    return [];
  }
}

export function saveExamModeAttemptHistoryLocal(slug, examSlot, userId = '', attempts = []) {
  if (typeof window === 'undefined') return attempts;
  const trimmed = attempts.slice(0, MAX_ATTEMPTS);
  try {
    localStorage.setItem(
      storageKey(slug, examSlot, userId),
      JSON.stringify({
        version: EXAM_MODE_ATTEMPT_HISTORY_VERSION,
        slug,
        examSlot,
        attempts: trimmed,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore quota */
  }
  return trimmed;
}

export function sessionHasArchivableProgress(session) {
  if (!session?.sections?.length) return false;
  if (session.status === 'completed') return true;
  if (session.sections.some((s) => s.status === 'completed')) return true;
  return session.sections.some((s) => s.sectionDraft?.scorePreview);
}

export function buildExamModeAttemptSnapshot(session, slug) {
  const { rows } = mergeExamModeStatsRows({
    slug,
    session,
    puntuacionesRows: [],
    estadisticasRows: [],
  });
  const summary = computeExamModeStats(rows);
  const sectionSummaries = rows.map((row) => ({
    key: row.key,
    title: row.title,
    status: row.status,
    pct: row.pct,
    correct: row.scores?.pointsEarned ?? row.scores?.correct ?? 0,
    total: row.scores?.maxPoints ?? row.scores?.total ?? 0,
  }));

  return {
    id: `${session.updatedAt || Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    archivedAt: new Date().toISOString(),
    startedAt: session.createdAt || null,
    finishedAt: session.status === 'completed' ? session.updatedAt || null : null,
    summary: {
      correct: summary.correct,
      total: summary.total,
      maxTotal: summary.maxTotal,
      displayTotal: summary.displayTotal,
      pct: summary.pct,
      sectionsCompleted: summary.sectionsCompleted,
      sectionsCount: summary.sectionsCount,
      sectionsPassed: summary.sectionsPassed,
      allComplete: summary.allComplete,
      examPassed: summary.examPassed,
    },
    sections: sectionSummaries,
  };
}

export function appendExamModeAttempt(attempts, snapshot) {
  if (!snapshot) return attempts;
  return [snapshot, ...(attempts || [])].slice(0, MAX_ATTEMPTS);
}

/** Aggregated stats across all archived exam-mode attempts for this test slot. */
export function aggregateExamModeAttemptHistory(attempts = []) {
  if (!attempts.length) {
    return {
      totalAttempts: 0,
      bestPct: 0,
      averagePct: 0,
      lastPct: 0,
      totalCorrect: 0,
      totalEvaluated: 0,
      completedAttempts: 0,
    };
  }

  let totalCorrect = 0;
  let totalEvaluated = 0;
  let bestPct = 0;
  let sumPct = 0;
  let completedAttempts = 0;

  for (const attempt of attempts) {
    const s = attempt.summary || {};
    totalCorrect += Number(s.correct) || 0;
    totalEvaluated += Number(s.displayTotal ?? s.total) || 0;
    const pct = Number(s.pct) || 0;
    bestPct = Math.max(bestPct, pct);
    sumPct += pct;
    if (s.allComplete) completedAttempts += 1;
  }

  return {
    totalAttempts: attempts.length,
    bestPct,
    averagePct: Math.round(sumPct / attempts.length),
    lastPct: attempts[0]?.summary?.pct ?? 0,
    totalCorrect,
    totalEvaluated,
    completedAttempts,
  };
}

export async function fetchExamModeAttemptHistoryFromServer({ slug, examSlot, userId }) {
  if (!userId) return null;
  try {
    const serverSlot = examModeAttemptHistoryServerSlot(examSlot);
    const res = await fetch(
      `/api/levels/exam-mode-attempt-history?slug=${encodeURIComponent(slug)}&examen=${serverSlot}&userId=${encodeURIComponent(userId)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const attempts = data?.history?.attempts;
    return Array.isArray(attempts) ? attempts : null;
  } catch {
    return null;
  }
}

export async function syncExamModeAttemptHistoryToServer({ slug, examSlot, userId, attempts }) {
  if (!userId) return;
  try {
    const serverSlot = examModeAttemptHistoryServerSlot(examSlot);
    await fetch('/api/levels/exam-mode-attempt-history', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        history: {
          version: EXAM_MODE_ATTEMPT_HISTORY_VERSION,
          slug,
          examSlot: serverSlot,
          attempts,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  } catch {
    /* localStorage remains source of truth */
  }
}

export async function loadExamModeAttemptHistory(slug, examSlot, userId = '') {
  const local = loadExamModeAttemptHistoryLocal(slug, examSlot, userId);
  if (!userId) return local;

  const remote = await fetchExamModeAttemptHistoryFromServer({ slug, examSlot, userId });
  if (!remote?.length) return local;
  if (remote.length > local.length) {
    saveExamModeAttemptHistoryLocal(slug, examSlot, userId, remote);
    return remote;
  }
  return local;
}

export async function archiveExamModeAttempt({ slug, examSlot, userId = '', session }) {
  if (!sessionHasArchivableProgress(session)) return loadExamModeAttemptHistory(slug, examSlot, userId);

  const snapshot = buildExamModeAttemptSnapshot(session, slug);
  const existing = await loadExamModeAttemptHistory(slug, examSlot, userId);
  const next = appendExamModeAttempt(existing, snapshot);
  saveExamModeAttemptHistoryLocal(slug, examSlot, userId, next);
  await syncExamModeAttemptHistoryToServer({ slug, examSlot, userId, attempts: next });
  return next;
}

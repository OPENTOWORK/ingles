import { supabase } from '@/utils/supabaseClient';
import { getLevelFullExamSections } from '@/data/nivelesLevelHub';
import { getCachedB2Level } from '@/utils/b2LevelCache';
import { resolveB2ExamenId, fetchB2PreguntasByExamen } from '@/utils/b2ResolveExam';
import { scoreExamModeDrafts, isExamModePartDraftAttempted } from '@/utils/examModeGradeAnswers';
import { attachScoringVersionToExamModeScores } from '@/lib/b2ScoringV2FeatureFlag';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { buildExamModeSkillPartSnapshots } from '@/utils/buildExamModeSkillPartSnapshots';
import {
  scoreExamModeWritingParts,
  isExamModeWritingPartAttempted,
  mergeWritingPartScoresWithSubmittedEssays,
} from '@/utils/examModeWritingScore';

/**
 * Minimal parts payload for silent exam-mode rescoring from saved drafts.
 * @param {number} examSlot
 * @param {number} partMin
 * @param {number} partMax
 */
export async function loadB2ExamModePartsDataForRange(examSlot, partMin, partMax) {
  const { data: levelData, error: levelError } = await getCachedB2Level(supabase);
  if (levelError || !levelData) return [];

  const { examenId, error: examResolveError } = await resolveB2ExamenId(supabase, levelData.id, {
    slot: examSlot,
  });
  if (examResolveError || !examenId) return [];

  const { data: questionsData, error: questionsError } = await fetchB2PreguntasByExamen(supabase, {
    examenId,
    levelId: levelData.id,
  });
  if (questionsError || !questionsData?.length) return [];

  const partIds = [...new Set(questionsData.map((q) => q.parte_id).filter(Boolean))];
  const questionIds = questionsData.map((q) => q.id);

  const [partsRes, answersRes, openAnswersRes] = await Promise.all([
    supabase.from('levels_partes').select('*').in('id', partIds),
    supabase
      .from('levels_respuestas')
      .select('id, pregunta_id, respuesta, correcta')
      .in('pregunta_id', questionIds),
    supabase
      .from('levels_respuestas_abiertas')
      .select('id, pregunta_id_abierta, respuesta_texto, grading_metadata')
      .in('pregunta_id_abierta', questionIds),
  ]);

  if (partsRes.error || answersRes.error) return [];

  const answersByQuestion = (answersRes.data || []).reduce((acc, a) => {
    if (!acc[a.pregunta_id]) acc[a.pregunta_id] = [];
    acc[a.pregunta_id].push(a);
    return acc;
  }, {});

  const openAnswersByQuestion = (openAnswersRes.data || []).reduce((acc, a) => {
    if (!acc[a.pregunta_id_abierta]) acc[a.pregunta_id_abierta] = [];
    acc[a.pregunta_id_abierta].push(a);
    return acc;
  }, {});

  const partsById = (partsRes.data || []).reduce((acc, part) => {
    acc[part.id] = part;
    return acc;
  }, {});

  const partDescription = (row) => row?.['Descripción'] ?? row?.Descripción ?? '';

  const groupedByPart = questionsData.reduce((acc, question) => {
    const tablePart = partsById[question.parte_id];
    const partName = formatLevelsPartDisplayName(tablePart?.nombre_parte || 'Parte sin nombre');
    const partNumber = Number(partName.match(/\d+/)?.[0] || 0);
    if (partNumber < partMin || partNumber > partMax) return acc;

    if (!acc[question.parte_id]) {
      acc[question.parte_id] = {
        id: question.parte_id,
        nombre: partName,
        descripcion: partDescription(tablePart),
        questions: [],
      };
    }

    acc[question.parte_id].questions.push({
      preguntaId: question.id,
      enunciado: question.enunciado || '',
      respuestas: answersByQuestion[question.id] || [],
      respuestasAbiertas: openAnswersByQuestion[question.id] || [],
    });

    return acc;
  }, {});

  return Object.values(groupedByPart).sort((a, b) => {
    const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
    const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
    return aNumber - bNumber;
  });
}

function resolvePartNumberFromNombre(part) {
  return Number(part?.nombre?.match(/\d+/)?.[0] || 0);
}

async function rescoreDraftMcqSection(meta, sec, examSlot, patch, snapshotsOut) {
  const draftByPart = sec.answers?.draftByPart;
  if (!draftByPart || !Object.keys(draftByPart).some((p) => isExamModePartDraftAttempted(draftByPart[p]))) {
    return;
  }

  const partsData = await loadB2ExamModePartsDataForRange(examSlot, meta.partMin, meta.partMax);
  if (!partsData.length) return;

  const { scores, partSnapshots } = scoreExamModeDrafts({
    partMin: meta.partMin,
    partMax: meta.partMax,
    partsData,
    draftByPart,
  });

  patch[sec.key] = attachScoringVersionToExamModeScores(scores);
  if (snapshotsOut) snapshotsOut[sec.key] = partSnapshots;
}

function resolveExistingWritingPartScore(sec, partNumber) {
  const fromAnswers = sec.answers?.writingByPart?.[partNumber];
  const fromScores = sec.scores?.byPart?.[partNumber];
  const saved = fromAnswers || fromScores;
  if (!saved || (saved.correct ?? 0) <= 0) return null;
  return {
    correct: saved.correct,
    total: saved.total,
    preguntaId: saved.preguntaId,
  };
}

async function rescoreWritingSection(meta, sec, examSlot, patch, snapshotsOut) {
  const partsData = await loadB2ExamModePartsDataForRange(examSlot, meta.partMin, meta.partMax);
  if (!partsData.length) return;

  const writingParts = [];
  for (const part of partsData) {
    const partNumber = resolvePartNumberFromNombre(part);
    for (const question of part.questions || []) {
      writingParts.push({
        partNumber,
        preguntaId: question.preguntaId,
        partId: part.id,
        enunciado: question.enunciado,
      });
    }
  }

  const hasEssay = writingParts.some((p) =>
    isExamModeWritingPartAttempted(p.preguntaId, p.partId),
  );
  if (!hasEssay) return;

  /** @type {Record<number, { correct: number, total: number, preguntaId?: string }>} */
  const partScores = {};
  const partsNeedingAi = [];

  for (const part of writingParts) {
    const existing = resolveExistingWritingPartScore(sec, part.partNumber);
    if (existing) {
      partScores[part.partNumber] = existing;
      continue;
    }
    if (isExamModeWritingPartAttempted(part.preguntaId, part.partId)) {
      partsNeedingAi.push(part);
    }
  }

  if (partsNeedingAi.length) {
    const aiScores = await scoreExamModeWritingParts(partsNeedingAi);
    Object.assign(partScores, aiScores);
  }

  const mergedScores = mergeWritingPartScoresWithSubmittedEssays(partScores, writingParts);
  if (!Object.keys(mergedScores).some((p) => mergedScores[p]?.correct > 0 || mergedScores[p]?.essaySubmitted)) {
    return;
  }

  const { scores, partSnapshots } = buildExamModeSkillPartSnapshots({
    partMin: meta.partMin,
    partMax: meta.partMax,
    partsData,
    examModePartScores: mergedScores,
    resolvePartNumber: resolvePartNumberFromNombre,
  });

  patch[sec.key] = attachScoringVersionToExamModeScores(scores);
  if (snapshotsOut) snapshotsOut[sec.key] = partSnapshots;
}

/**
 * Re-score completed sections from saved drafts (fixes legacy MCQ scoring in stats).
 * @returns {{ patch: Record<string, object>|null, snapshotsBySection: Record<string, object> }}
 */
export async function rescoreExamModeSessionFromDrafts(session, slug, examSlot) {
  if (!session?.sections?.length || String(slug || '').toLowerCase() !== 'b2') {
    return { patch: null, snapshotsBySection: {} };
  }

  const sectionDefs = getLevelFullExamSections(slug);
  /** @type {Record<string, object>} */
  const patch = {};
  /** @type {Record<string, object>} */
  const snapshotsBySection = {};

  await Promise.all(
    session.sections.map(async (sec) => {
      const meta = sectionDefs.find((s) => s.key === sec.key);
      if (!meta) return;

      if (meta.partMin >= 8 && meta.partMax <= 9) {
        await rescoreWritingSection(meta, sec, examSlot, patch, snapshotsBySection);
        return;
      }

      await rescoreDraftMcqSection(meta, sec, examSlot, patch, snapshotsBySection);
    }),
  );

  return {
    patch: Object.keys(patch).length ? patch : null,
    snapshotsBySection,
  };
}

/** @param {import('@/utils/examModeSession').ExamModeSession} session */
export function applyExamModeSessionScorePatch(session, patch) {
  if (!session || !patch) return session;

  return {
    ...session,
    sections: session.sections.map((sec) =>
      patch[sec.key] ? { ...sec, scores: patch[sec.key] } : sec,
    ),
  };
}

function scoresPatchDiffersFromSession(session, patch) {
  if (!session || !patch) return false;
  for (const [key, nextScores] of Object.entries(patch)) {
    const sec = session.sections.find((s) => s.key === key);
    const prev = sec?.scores;
    if (!prev) return true;
    if ((prev.correct ?? 0) !== (nextScores.correct ?? 0)) return true;
    for (const [partNum, partScore] of Object.entries(nextScores.byPart || {})) {
      const prevPart = prev.byPart?.[partNum];
      if ((prevPart?.correct ?? 0) !== (partScore?.correct ?? 0)) return true;
      if (Boolean(prevPart?.complete) !== Boolean(partScore?.complete)) return true;
      if (Boolean(prevPart?.essaySubmitted) !== Boolean(partScore?.essaySubmitted)) return true;
    }
  }
  return false;
}

/**
 * Stable key for when draft/answer content changes — excludes score-only session updates
 * so rescoring is not cancelled mid-flight when scores are persisted.
 */
export function buildExamModeRescoreTrigger(session) {
  if (!session?.sections?.length) return '';
  return session.sections
    .map((sec) => {
      const draftKeys = Object.keys(sec.answers?.draftByPart || {})
        .filter((pn) => isExamModePartDraftAttempted(sec.answers.draftByPart[pn]))
        .sort((a, b) => Number(a) - Number(b))
        .join(',');
      const writingKeys = Object.keys(sec.answers?.writingByPart || {})
        .sort((a, b) => Number(a) - Number(b))
        .join(',');
      return [
        sec.key,
        sec.status || '',
        sec.finishedAt || '',
        sec.answers?.writingCompleted ? 'wc' : '',
        draftKeys ? `d:${draftKeys}` : '',
        writingKeys ? `w:${writingKeys}` : '',
        sec.redoPart ?? '',
      ].join(':');
    })
    .join('|');
}

/** Persist rescored part snapshots to levels_puntuaciones / levels_estadisticas / levels_stars. */
export async function persistRescoredExamModeSnapshots(userId, slug, examSlot, snapshotsBySection = {}) {
  if (!userId || String(slug || '').toLowerCase() !== 'b2') return;

  const entries = Object.values(snapshotsBySection).filter(
    (snap) => snap && Object.keys(snap).length > 0,
  );
  if (!entries.length) return;

  const { data: levelData } = await getCachedB2Level(supabase);
  if (!levelData?.id) return;

  const { examenId } = await resolveB2ExamenId(supabase, levelData.id, { slot: examSlot });
  if (!examenId) return;

  const { persistExamModeSectionScores } = await import('@/utils/persistExamModeSectionScores');
  await Promise.all(
    entries.map((partSnapshots) =>
      persistExamModeSectionScores({ userId, examenId, partSnapshots }),
    ),
  );
}

export { scoresPatchDiffersFromSession };

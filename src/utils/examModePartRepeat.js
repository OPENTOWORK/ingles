import { buildEmptySectionScores } from '@/utils/examModeStatsRows';
import { attachScoringVersionToExamModeScores } from '@/lib/b2ScoringV2FeatureFlag';
import { getExamModeSection } from '@/utils/examModeSession';
import { mergeExamModeDraftSources, cloneExamModeDraftByPart } from '@/utils/examModeSectionDraft';

function sumSectionScoresFromByPart(byPart, partMin, partMax, slug, incomingMeta = {}) {
  const v2 =
    incomingMeta.scoringVersion === 2 ||
    Object.values(byPart || {}).some((p) => p?.scoringVersion === 2);
  let correct = 0;
  let total = 0;

  for (let p = partMin; p <= partMax; p += 1) {
    const part = byPart?.[p];
    if (!part) continue;
    const partCorrect = v2
      ? Math.max(0, Number(part.pointsEarned ?? part.correct) || 0)
      : Math.max(0, Number(part.correct) || 0);
    const partTotal = v2
      ? Math.max(0, Number(part.maxPoints ?? part.total) || 0)
      : Math.max(0, Number(part.total) || 0);
    correct += partCorrect;
    total += partTotal;
  }

  return {
    correct,
    total,
    byPart,
    scoringVersion: v2 ? 2 : 1,
    ...(v2
      ? {
          pointsEarned: correct,
          maxPoints: total,
          reading: incomingMeta.reading,
          useOfEnglish: incomingMeta.useOfEnglish,
        }
      : {}),
  };
}

/**
 * Reset one part inside a completed section; keep other parts unchanged.
 * @param {import('@/utils/examModeSession').ExamModeSession} session
 */
export function prepareExamModePartRepeat(session, sectionKey, partNumber, slug = 'b2') {
  const section = getExamModeSection(session, sectionKey);
  const pn = Number(partNumber);
  if (!section || !Number.isFinite(pn) || pn < section.partMin || pn > section.partMax) {
    return session;
  }

  const empty = buildEmptySectionScores(slug, section.partMin, section.partMax);
  const byPart = { ...empty.byPart, ...(section.scores?.byPart || {}) };
  byPart[pn] = { ...empty.byPart[pn] };

  const draftByPart = cloneExamModeDraftByPart(section.answers?.draftByPart || {});
  delete draftByPart[pn];

  const writingByPart = { ...(section.answers?.writingByPart || {}) };
  delete writingByPart[pn];

  const scores = attachScoringVersionToExamModeScores(
    sumSectionScoresFromByPart(byPart, section.partMin, section.partMax, slug, section.scores || {}),
  );

  const now = new Date().toISOString();
  const sections = session.sections.map((s) => {
    if (s.key !== sectionKey) return s;
    return {
      ...s,
      status: /** @type {'completed'} */ ('completed'),
      redoPart: pn,
      answers: {
        ...(s.answers || {}),
        draftByPart,
        writingByPart,
      },
      scores,
    };
  });

  return { ...session, sections, updatedAt: now };
}

/**
 * Merge a re-attempted part back into a completed section.
 * @param {import('@/utils/examModeSession').ExamModeSession} session
 */
export function mergeExamModePartRepeat(session, sectionKey, partNumber, answersSnapshot, partScores, slug = 'b2') {
  const section = getExamModeSection(session, sectionKey);
  const pn = Number(partNumber);
  if (!section || !Number.isFinite(pn)) return session;

  const empty = buildEmptySectionScores(slug, section.partMin, section.partMax);
  const byPart = { ...empty.byPart, ...(section.scores?.byPart || {}) };
  const incomingPart = partScores?.byPart?.[pn];
  if (incomingPart) {
    byPart[pn] = { ...empty.byPart[pn], ...incomingPart };
  }

  const scores = attachScoringVersionToExamModeScores(
    sumSectionScoresFromByPart(byPart, section.partMin, section.partMax, slug, partScores || {}),
  );

  const now = new Date().toISOString();
  const sections = session.sections.map((s) => {
    if (s.key !== sectionKey) return s;
    return {
      ...s,
      status: /** @type {'completed'} */ ('completed'),
      redoPart: null,
      answers: {
        ...(s.answers || {}),
        ...(answersSnapshot || {}),
        draftByPart: {
          ...(s.answers?.draftByPart || {}),
          ...(answersSnapshot?.draftByPart || {}),
        },
        writingByPart: {
          ...(s.answers?.writingByPart || {}),
          ...(answersSnapshot?.writingByPart || {}),
        },
      },
      scores,
    };
  });

  return { ...session, sections, updatedAt: now };
}

/** Score + answers payload when finishing a single-part repeat vs a full section. */
export function buildExamModeFinishPayload({
  examSection,
  partMin,
  partMax,
  examDraftRef,
  answersExtras = null,
}) {
  const redoPn = examSection?.redoPart;
  const mergedDraftByPart = mergeExamModeDraftSources(examSection, examDraftRef);

  if (redoPn == null) {
    return {
      isPartRepeat: false,
      scorePartMin: partMin,
      scorePartMax: partMax,
      draftByPartForScore: mergedDraftByPart,
      answersSnapshot: answersExtras ?? {
        ...(examSection?.answers || {}),
        draftByPart: mergedDraftByPart,
      },
      persistPartNumbers: null,
    };
  }

  return {
    isPartRepeat: true,
    scorePartMin: redoPn,
    scorePartMax: redoPn,
    draftByPartForScore: { [redoPn]: mergedDraftByPart[redoPn] },
    answersSnapshot: {
      ...(examSection?.answers || {}),
      ...(answersExtras || {}),
      draftByPart: mergedDraftByPart,
    },
    persistPartNumbers: [redoPn],
  };
}

export function clearExamModeWritingPartStorage(preguntaId, partId) {
  if (typeof window === 'undefined') return;
  for (const key of [
    preguntaId ? `b2-exam-writing-${preguntaId}` : null,
    partId ? `b2-exam-writing-${partId}` : null,
    preguntaId ? `b2-writing-p2-choice-${preguntaId}` : null,
    partId ? `b2-writing-p2-choice-${partId}` : null,
  ]) {
    if (!key) continue;
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

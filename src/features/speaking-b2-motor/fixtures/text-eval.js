import { isSpeakingB2MetaIssueCode } from '../domain/error-taxonomy.js';
import { runSpeakingB2Complete } from '../services/evaluation/run-complete.js';
import { getSpeakingB2TextCase, listSpeakingB2TextCases } from './text-bank.js';

function looksSpanish(text) {
  return /[áéíóúñü]|has |esta |el candidato|el alumno|corrección|recomend|orientativ|evidencia|fortalez|gramática|vocabulario|respuesta/i.test(
    String(text || ''),
  );
}

export function judgeSpeakingB2TextCase({ caseItem, report, technicalOk }) {
  const expected = [...(caseItem?.expectedIssueCodes || [])];
  const detected = (report?.issues || []).map((issue) => issue.code).filter(Boolean);
  const classified = detected.filter((code) => !isSpeakingB2MetaIssueCode(code));
  const missed = expected.filter((code) => !classified.includes(code));
  const falsePositives = classified.filter((code) => !expected.includes(code));
  const reviewRequired = detected.filter((code) => isSpeakingB2MetaIssueCode(code));
  const detectionOk =
    expected.length === 0
      ? classified.length === 0
      : expected.some((code) => classified.includes(code)) || reviewRequired.length > 0;
  const scores = report?.scores || {};
  const illegalScore =
    scores.pronunciation != null ||
    scores.interactiveCommunication != null ||
    scores.globalAchievement != null;
  const explanations = (report?.issues || []).filter((issue) => String(issue.explanation || '').trim());
  const feedbackOk = looksSpanish(report?.summaryEs) && !/nota oficial de Cambridge/i.test(report?.summaryEs || '');
  const evaluatorSilent =
    Boolean(report?.evidence?.hasCandidateSpeech) &&
    scores.grammarVocabulary == null &&
    scores.discourseManagement == null &&
    detected.length === 0;

  let status = 'PASS';
  let feedbackQuality = 'adequate';
  if (!technicalOk || !report || illegalScore) {
    status = 'FAIL';
    feedbackQuality = 'failed';
  } else if (evaluatorSilent && expected.length) {
    status = 'FAIL';
    feedbackQuality = 'evaluator-silent';
  } else if (evaluatorSilent && !feedbackOk) {
    status = 'REVIEW';
    feedbackQuality = 'evaluator-silent';
  } else if (expected.length && missed.length === expected.length && !reviewRequired.length) {
    status = 'FAIL';
    feedbackQuality = feedbackOk ? 'review' : 'weak';
  } else if (expected.length && missed.length === expected.length && reviewRequired.length) {
    status = 'REVIEW';
    feedbackQuality = 'review_required';
  } else if (missed.length || falsePositives.length || !feedbackOk) {
    status = 'REVIEW';
    feedbackQuality = feedbackOk ? 'review' : 'weak';
  } else if (detected.length && explanations.length < detected.length) {
    status = 'REVIEW';
    feedbackQuality = 'incomplete-explanations';
  }

  return {
    id: caseItem?.id,
    set: caseItem?.set,
    question: caseItem?.question,
    candidateText: caseItem?.candidateText,
    referenceTranscript: caseItem?.referenceTranscript || caseItem?.candidateText,
    pedagogicalNotes: caseItem?.notes || '',
    expectedIssueCodes: expected,
    detectedIssueCodes: detected,
    missed,
    falsePositives,
    falsePositiveCount: falsePositives.length,
    missedCount: missed.length,
    reviewRequired,
    detectionOk,
    classificationOk: expected.length ? missed.length === 0 && falsePositives.length === 0 : classified.length === 0,
    feedbackQuality,
    scores,
    summaryEs: report?.summaryEs || '',
    status,
    technicalOk: Boolean(technicalOk && report),
  };
}

export function buildSpeakingB2TextSession(caseItem) {
  const companions = (caseItem.companionTurns || []).map((turn) => ({
    role: 'candidate',
    questionId: turn.questionId,
    transcript: turn.transcript,
    source: 'TYPED',
    hasAudio: false,
    uncertain: false,
  }));
  return {
    id: `text-${caseItem.id}`,
    examCode: 'SP-EX001',
    persisted: false,
    fixtureMode: true,
    turns: [
      { role: 'examiner', questionId: caseItem.questionId, transcript: caseItem.question, source: 'SCRIPT' },
      ...companions,
      {
        role: 'candidate',
        questionId: caseItem.questionId,
        transcript: caseItem.candidateText,
        source: 'TYPED',
        hasAudio: false,
        uncertain: false,
      },
    ],
  };
}

export async function evaluateSpeakingB2TextCase(caseItem, { evaluate } = {}) {
  const session = buildSpeakingB2TextSession(caseItem);
  try {
    const report = await (evaluate || ((current) => runSpeakingB2Complete({ session: current, persist: false })))(
      session,
    );
    return judgeSpeakingB2TextCase({ caseItem, report, technicalOk: true });
  } catch (error) {
    return judgeSpeakingB2TextCase({
      caseItem,
      report: null,
      technicalOk: false,
    });
  }
}

export async function evaluateSpeakingB2TextSet(set = 'validate', options = {}) {
  const cases =
    set === 'all'
      ? [
          ...listSpeakingB2TextCases('develop'),
          ...listSpeakingB2TextCases('regression'),
          ...listSpeakingB2TextCases('validate'),
        ]
      : listSpeakingB2TextCases(set);
  const items = [];
  for (const caseItem of cases) {
    items.push(await evaluateSpeakingB2TextCase(caseItem, options));
  }
  return items;
}

export function getSpeakingB2TextCaseOrThrow(id) {
  const found = getSpeakingB2TextCase(id);
  if (!found) throw new Error(`Unknown text case: ${id}`);
  return found;
}

/**
 * V1.6 cause of GR-VT overuse (documented before the fix):
 * 1. The rubric JSON example used only `"code":"GR-VT"`.
 * 2. Unknown codes were dropped, so the model copied the example to survive the filter.
 * 3. The rater did not receive the examiner question, so relevance was invisible.
 * 4. There was no evidence check that the excerpt supported the assigned code.
 * The application did not remap other codes to GR-VT; the bias was in the schema/example.
 */
import { isKnownSpeakingB2ErrorCode, isSpeakingB2MetaIssueCode } from './error-taxonomy.js';
import {
  excerptAppearsIn,
  evidenceFlagsForIssue,
  isThinAnswer,
} from './issue-evidence.js';

const DISCOURSE_CODES = new Set(['DM-RV', 'DM-EL', 'DM-OR', 'VC-RP']);
const LOW_CONFIDENCE = 0.55;

function pickSupportedCode(flags, assigned) {
  const grammar = [];
  if (flags.article) grammar.push('GR-AR');
  if (flags.tense) grammar.push('GR-VT');
  if (flags.preposition) grammar.push('GR-PR');
  if (flags.collocation) grammar.push('VC-CO');
  if (flags.wordChoice) grammar.push('VC-WW');
  if (flags.repetition) grammar.push('VC-RP');
  const discourse = [];
  if (!flags.relevant) discourse.push('DM-RV');
  else if (!flags.developed) discourse.push('DM-EL');
  const supported = [...grammar, ...discourse];

  if (assigned && supported.includes(assigned)) return assigned;
  if (grammar.length === 1) return grammar[0];
  if (supported.length === 1) return supported[0];
  return 'review_required';
}

export function validateSpeakingB2Issue(issue, { answer = '', question = '' } = {}) {
  const excerpt = String(issue?.excerpt || issue?.originalText || '').trim();
  const assigned = String(issue?.code || '').trim();
  const confidence = Number(issue?.confidence ?? 0.7);
  const flags = evidenceFlagsForIssue({ excerpt, answer, question });

  if (!excerpt && !DISCOURSE_CODES.has(assigned)) {
    return null;
  }

  const excerptOk =
    !excerpt ||
    excerptAppearsIn(answer, excerpt) ||
    DISCOURSE_CODES.has(assigned);

  if (!excerptOk) return null;

  if (assigned === 'DM-RV' && flags.relevant) return null;
  if (assigned === 'DM-EL' && flags.developed) return null;
  if (assigned === 'GR-VT' && !flags.tense) {
    const next = pickSupportedCode(flags, '');
    return {
      ...issue,
      excerpt,
      originalCode: assigned,
      code: next === 'GR-VT' ? 'review_required' : next,
      reviewRequired: next === 'review_required' || next !== assigned,
      evidenceCheck: 'rejected-default-verb-tense',
    };
  }

  if (assigned && !isKnownSpeakingB2ErrorCode(assigned) && !isSpeakingB2MetaIssueCode(assigned)) {
    return {
      ...issue,
      excerpt,
      originalCode: assigned,
      code: 'review_required',
      reviewRequired: true,
      evidenceCheck: 'unknown-code',
    };
  }

  if (assigned === 'review_required' || assigned === 'unclassified') {
    const resolved = pickSupportedCode(flags, '');
    if (resolved !== 'review_required') {
      return {
        ...issue,
        excerpt,
        originalCode: assigned,
        code: resolved,
        reviewRequired: false,
        evidenceCheck: 'resolved-from-evidence',
      };
    }
    return { ...issue, excerpt, code: assigned, reviewRequired: true, evidenceCheck: 'model-uncertain' };
  }

  const supported = pickSupportedCode(flags, assigned);
  if (confidence < LOW_CONFIDENCE && supported !== assigned) {
    return {
      ...issue,
      excerpt,
      originalCode: assigned,
      code: 'review_required',
      reviewRequired: true,
      evidenceCheck: 'low-confidence',
    };
  }

  if (assigned && supported !== assigned && supported === 'review_required') {
    return {
      ...issue,
      excerpt,
      originalCode: assigned,
      code: 'review_required',
      reviewRequired: true,
      evidenceCheck: 'code-not-justified',
    };
  }

  if (assigned && supported !== assigned) {
    return {
      ...issue,
      excerpt,
      originalCode: assigned,
      code: supported,
      reviewRequired: false,
      evidenceCheck: 'reclassified',
    };
  }

  return {
    ...issue,
    excerpt,
    code: assigned || supported,
    reviewRequired: assigned === 'review_required',
    evidenceCheck: 'accepted',
  };
}

export function validateSpeakingB2Issues(issues, context) {
  const seen = new Set();
  const next = [];
  for (const issue of issues || []) {
    const validated = validateSpeakingB2Issue(issue, context);
    if (!validated) continue;
    const key = `${validated.code}:${normalizeKey(validated.excerpt || validated.originalText || '')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(validated);
  }
  return dedupeRelatedIssues(next);
}

function dedupeRelatedIssues(issues) {
  const kept = [];
  for (const issue of issues) {
    const clash = kept.find(
      (item) =>
        normalizeKey(item.excerpt) === normalizeKey(issue.excerpt) &&
        item.code !== issue.code &&
        ((item.code === 'GR-PR' && issue.code === 'VC-CO') ||
          (item.code === 'VC-CO' && issue.code === 'GR-PR') ||
          (item.code === 'VC-CO' && issue.code === 'VC-WW') ||
          (item.code === 'VC-WW' && issue.code === 'VC-CO')),
    );
    if (!clash) {
      kept.push(issue);
      continue;
    }
    const preferPrep = clash.code === 'GR-PR' || issue.code === 'GR-PR';
    if (preferPrep) {
      const winner = issue.code === 'GR-PR' ? issue : clash;
      kept[kept.indexOf(clash)] = winner;
    }
  }
  return kept;
}

export function ensureSpeakingB2DiscourseIssues(issues, { answer = '', question = '', questionId = '' } = {}) {
  const flags = evidenceFlagsForIssue({ excerpt: answer, answer, question });
  const hasDm = (issues || []).some((issue) => issue.code === 'DM-EL' || issue.code === 'DM-RV');
  if (hasDm || flags.developed || !flags.relevant || !isThinAnswer(answer)) return issues || [];
  return [
    ...(issues || []),
    {
      questionId,
      code: 'DM-EL',
      excerpt: String(answer || '').trim(),
      suggestion: 'Add a reason or a short example so the examiner can follow the idea.',
      evidence: 'The answer does not develop the question.',
      confidence: 0.8,
      evidenceCheck: 'discourse-thin-answer',
    },
  ];
}

function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function bindSpeakingB2IssueToTurn(issue, pairedTurns = []) {
  const turns = Array.isArray(pairedTurns) ? pairedTurns : [];
  const requested = String(issue?.questionId || '').trim();
  const excerpt = String(issue?.excerpt || issue?.originalText || '').trim();
  const byId = requested ? turns.find((turn) => turn?.questionId === requested) : null;

  if (byId && (!excerpt || excerptAppearsIn(byId.transcript, excerpt) || DISCOURSE_CODES.has(issue?.code))) {
    return { turn: byId, questionId: byId.questionId, bound: 'id' };
  }

  if (excerpt) {
    const matches = turns.filter((turn) => excerptAppearsIn(turn?.transcript, excerpt));
    if (matches.length === 1) {
      return {
        turn: matches[0],
        questionId: matches[0].questionId || '',
        bound: 'excerpt',
        reviewRequired: Boolean(requested && requested !== matches[0].questionId),
      };
    }
    if (matches.length > 1) {
      return { turn: null, questionId: '', bound: 'ambiguous', reviewRequired: true };
    }
  }

  return { turn: null, questionId: '', bound: 'unbound', reviewRequired: true };
}

export function attachSpeakingB2IssuesToTurns(issues, pairedTurns = []) {
  const next = [];
  const seen = new Set();
  for (const issue of issues || []) {
    const binding = bindSpeakingB2IssueToTurn(issue, pairedTurns);
    if (!binding.turn) {
      const attached = {
        ...issue,
        questionId: '',
        code: 'review_required',
        reviewRequired: true,
        evidenceCheck: binding.bound === 'ambiguous' ? 'question-ambiguous' : 'question-unbound',
      };
      const key = `${attached.code}:${normalizeKey(attached.excerpt || attached.originalText || '')}:unbound`;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(attached);
      continue;
    }
    const validated = validateSpeakingB2Issues(
      [{ ...issue, questionId: binding.questionId }],
      { answer: binding.turn.transcript || '', question: binding.turn.question || '' },
    );
    for (const item of validated) {
      const attached = {
        ...item,
        questionId: binding.questionId,
        reviewRequired: Boolean(item.reviewRequired || binding.reviewRequired),
      };
      const key = `${attached.code}:${normalizeKey(attached.excerpt || attached.originalText || '')}:${attached.questionId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(attached);
    }
  }
  return next;
}

export function pairSpeakingB2Answers(turns = [], getQuestion) {
  const questions = new Map();
  for (const turn of turns) {
    if (turn?.role === 'examiner' && turn.questionId) {
      questions.set(turn.questionId, turn.transcript);
    }
  }
  return (turns || [])
    .filter((turn) => turn?.role === 'candidate')
    .map((turn) => ({
      ...turn,
      question:
        questions.get(turn.questionId) ||
        getQuestion?.(turn.questionId)?.question ||
        '',
    }));
}

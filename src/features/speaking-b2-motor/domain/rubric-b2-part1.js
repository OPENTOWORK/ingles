import { isAdequatelyDeveloped } from './issue-evidence.js';

export const SPEAKING_B2_CRITERIA = [
  'grammarVocabulary',
  'discourseManagement',
  'pronunciation',
  'interactiveCommunication',
  'globalAchievement',
];

export const SPEAKING_B2_SCORE_DISCLAIMER =
  'Puntuación orientativa de Dralo. No es una nota oficial de Cambridge.';

export function emptySpeakingB2Scores() {
  return {
    grammarVocabulary: null,
    discourseManagement: null,
    pronunciation: null,
    interactiveCommunication: null,
    globalAchievement: null,
  };
}

export function evidenceFlagsFromSession({
  candidateTurns = [],
  hasAudio = false,
  acoustic = null,
} = {}) {
  const spokenTurns = candidateTurns.filter((turn) => String(turn.transcript || '').trim());
  const wordCount = spokenTurns.reduce(
    (sum, turn) => sum + String(turn.transcript || '').trim().split(/\s+/).filter(Boolean).length,
    0,
  );
  const grammarVocabulary = wordCount >= 12;
  const multiTurnDiscourse = spokenTurns.length >= 2 && wordCount >= 20;
  const singleTurnDiscourse =
    spokenTurns.length === 1 &&
    wordCount >= 16 &&
    isAdequatelyDeveloped(spokenTurns[0].transcript);
  const discourseManagement = multiTurnDiscourse || singleTurnDiscourse;
  return {
    hasCandidateSpeech: spokenTurns.length > 0,
    spokenTurnCount: spokenTurns.length,
    wordCount,
    hasAudio,
    grammarVocabulary,
    discourseManagement,
    // STT existence is not acoustic analysis. Do not score pronunciation without it.
    pronunciation: Boolean(acoustic?.hasAcousticAnalysis),
    // Solo Part 1 has no partner. Interactive Communication stays insufficient.
    interactiveCommunication: false,
    // A short isolated Part 1 is not enough for a global band.
    globalAchievement: false,
    insufficientEvidence: {
      pronunciation: 'no_acoustic_analysis',
      interactiveCommunication: 'solo_part1',
      globalAchievement: 'isolated_part1',
    },
  };
}

export function applyInsufficientEvidence(scores, flags) {
  const next = { ...emptySpeakingB2Scores(), ...scores };
  for (const key of SPEAKING_B2_CRITERIA) {
    if (!flags[key]) next[key] = null;
  }
  return next;
}

export function clampSpeakingBand(value) {
  return readSpeakingBand(value);
}

export function readSpeakingBand(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') {
    return readSpeakingBand(value.score ?? value.value ?? value.band);
  }
  const raw = String(value)
    .replace(',', '.')
    .replace(/\/\s*5/g, '')
    .trim();
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  const rounded = Math.round(n * 2) / 2;
  return Math.min(5, Math.max(0, rounded));
}

export function readSpeakingB2Scores(model) {
  const nested = model?.scores && typeof model.scores === 'object' ? model.scores : {};
  const src = { ...nested, ...model };
  return {
    grammarVocabulary: readSpeakingBand(src.grammarVocabulary ?? src.grammar_vocabulary ?? src.gv),
    discourseManagement: readSpeakingBand(src.discourseManagement ?? src.discourse_management ?? src.dm),
    pronunciation: readSpeakingBand(src.pronunciation),
    interactiveCommunication: readSpeakingBand(
      src.interactiveCommunication ?? src.interactive_communication,
    ),
    globalAchievement: readSpeakingBand(src.globalAchievement ?? src.global_achievement),
  };
}

export function describeScoreAbstention(flags, scores) {
  const reasons = {};
  for (const key of ['grammarVocabulary', 'discourseManagement']) {
    if (scores?.[key] == null) {
      reasons[key] = flags?.[key] ? 'model_withheld' : 'insufficient_evidence';
    }
  }
  return reasons;
}

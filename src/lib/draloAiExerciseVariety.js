const UOE_TOPICS = [
  'travel and holidays',
  'work and careers',
  'education and study',
  'health and lifestyle',
  'technology and social media',
  'environment and climate',
  'food and cooking',
  'sport and fitness',
  'family and relationships',
  'money and shopping',
  'culture and entertainment',
  'city life and transport',
];

export function pickRandomTopic(seed = Date.now()) {
  const n = Math.abs(seed) % UOE_TOPICS.length;
  return UOE_TOPICS[n];
}

export function getUoeExerciseFingerprint(exercise, activity) {
  if (!exercise) return '';
  if (exercise.passage || exercise.title) {
    return `${exercise.title || ''}|${String(exercise.passage || '').slice(0, 120)}`
      .toLowerCase()
      .trim();
  }
  if (activity === 'multiple-choice-cloze') {
    return `${exercise.textBefore || ''}|${exercise.textAfter || ''}|${(exercise.options || []).join(',')}`
      .toLowerCase()
      .trim();
  }
  if (activity === 'key-word') {
    return `${exercise.sentence1 || ''}|${exercise.keyword || ''}`.toLowerCase().trim();
  }
  if (activity === 'word-formation') {
    return `${exercise.textBefore || ''}|${exercise.stem || ''}|${exercise.textAfter || ''}`
      .toLowerCase()
      .trim();
  }
  return `${exercise.textBefore || ''}|${exercise.textAfter || ''}|${exercise.modelAnswer || ''}`
    .toLowerCase()
    .trim();
}

const STORAGE_PREFIX = 'dralo_ai_recent_';
const MAX_RECENT = 12;

export function getRecentFingerprints(mode, activity, level) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${mode}_${activity}_${level}`);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function rememberExerciseFingerprint(mode, activity, level, fingerprint) {
  if (typeof window === 'undefined' || !fingerprint) return;
  const key = `${STORAGE_PREFIX}${mode}_${activity}_${level}`;
  const prev = getRecentFingerprints(mode, activity, level);
  const next = [fingerprint, ...prev.filter((f) => f !== fingerprint)].slice(0, MAX_RECENT);
  sessionStorage.setItem(key, JSON.stringify(next));
}

export function normalizeRlCheckResult(result, exercise, questionId) {
  const correct = Boolean(result?.correct);
  const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
  const official =
    modelAnswers.find((m) => m.id === questionId)?.answer ||
    result?.correctAnswer ||
    '';
  let feedback = String(result?.feedback || '').trim();
  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. See the correct answer below.';
  }
  return {
    correct,
    feedback,
    correctAnswer: correct ? '' : String(official).trim(),
  };
}

export function normalizeUoeCheckResult(result, exercise, questionId) {
  const correct = Boolean(result?.correct);
  const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
  const modelAnswer = String(
    result?.modelAnswer ||
      modelAnswers.find((m) => m.id === questionId)?.answer ||
      exercise?.modelAnswer ||
      '',
  ).trim();
  const tip = String(exercise?.briefTip || '').trim();
  let feedback = String(result?.feedback || '').trim();

  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. Compare your answer with the model answer below.';
  }
  if (tip && !feedback.toLowerCase().includes(tip.toLowerCase().slice(0, 12))) {
    feedback = `${feedback} ${tip}`;
  }

  return {
    correct,
    scorePercent:
      typeof result?.scorePercent === 'number'
        ? result.scorePercent
        : correct
          ? 100
          : 0,
    feedback,
    modelAnswer: correct ? '' : modelAnswer,
  };
}

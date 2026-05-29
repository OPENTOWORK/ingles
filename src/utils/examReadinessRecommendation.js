/**
 * Indicative recommendation on when to take a Cambridge exam.
 * @param {object} params
 * @param {string} [params.levelEstimate] — A2, B1, B2, C1…
 * @param {number} [params.completedExams]
 * @param {number} [params.studyStreak]
 * @param {number} [params.totalStudyMinutes]
 */
export function getExamReadinessRecommendation({
  levelEstimate = 'B1',
  completedExams = 0,
  studyStreak = 0,
  totalStudyMinutes = 0,
} = {}) {
  const level = String(levelEstimate || 'B1').toUpperCase();
  const studyHours = Math.floor(Number(totalStudyMinutes) / 60);

  const prepMonthsByLevel = {
    A2: { minimum: 2, recommended: 4 },
    B1: { minimum: 3, recommended: 6 },
    B2: { minimum: 2, recommended: 4 },
    C1: { minimum: 3, recommended: 6 },
    C2: { minimum: 4, recommended: 8 },
  };

  const prep = prepMonthsByLevel[level] || prepMonthsByLevel.B1;

  let readiness = 'preparing';
  let readinessLabel = 'Keep preparing';
  let suggestedWindow = `In about ${prep.recommended} months`;
  let headline =
    'It is still worth consolidating the basics before booking a place. Focus on regular practice and full mock exams.';

  const activeLearner = studyStreak >= 5 || completedExams >= 2 || studyHours >= 10;

  if (activeLearner && (completedExams >= 5 || studyStreak >= 14) && studyHours >= 20) {
    readiness = 'ready';
    readinessLabel = 'Good time to register';
    suggestedWindow = 'Next available session (June, August or December)';
    headline =
      'Your consistency and practice suggest you can target the next exam session. Check dates in your city and book early (places often close 4–6 weeks ahead).';
  } else if (activeLearner && (completedExams >= 2 || studyStreak >= 7)) {
    readiness = 'almost';
    readinessLabel = 'Almost ready';
    suggestedWindow = `In ${Math.max(prep.minimum, 2)}–${prep.recommended} months`;
    headline =
      'You are on the right track. Complete at least one mock per skill and review Writing/Speaking with feedback before fixing your exam date.';
  } else {
    suggestedWindow = `In ${prep.recommended} months (minimum ${prep.minimum})`;
  }

  const tips = [
    'Only book your exam date once you have completed full mocks at your target level.',
    'Paper-based sessions (June, August, December) often sell out early — register soon if you feel ready.',
    'Computer-based exams offer more dates; check your local centre.',
    `Suggested target based on your estimated level (${level}): ${prep.recommended} months of steady preparation.`,
  ];

  return {
    level,
    readiness,
    readinessLabel,
    suggestedWindow,
    headline,
    tips,
    prepMonthsRecommended: prep.recommended,
  };
}

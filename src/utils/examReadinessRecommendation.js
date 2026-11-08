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
    prepMonthsMinimum: prep.minimum,
  };
}

const SKILL_PLAN = {
  A2: [
    { skill: 'Reading and Use of English', text: 'Short texts, signs and simple grammar: present and past, articles and common prepositions.' },
    { skill: 'Writing', text: 'A short message or email, about 35–45 words, with a clear opening and ending.' },
    { skill: 'Listening', text: 'Everyday conversations at slow speed. Note names, times, prices and places.' },
    { skill: 'Speaking', text: 'Talk about yourself, your routine and simple pictures in full sentences.' },
  ],
  B1: [
    { skill: 'Reading and Use of English', text: 'Longer notices and articles. Focus on tenses, modals and linking words.' },
    { skill: 'Writing', text: 'An email or story of about 100 words, with paragraphs and a clear purpose.' },
    { skill: 'Listening', text: 'Monologues and conversations. Practise catching the speaker’s opinion, not only facts.' },
    { skill: 'Speaking', text: 'Describe a photo, compare ideas and give a short reason for your opinion.' },
  ],
  B2: [
    { skill: 'Reading and Use of English', text: 'Parts 1–7: word formation, open cloze, key word transformations and long texts.' },
    { skill: 'Writing', text: 'A compulsory essay and a choice of article, letter, email or review, with a clear structure.' },
    { skill: 'Listening', text: 'Parts 1–4. Train for paraphrase: the answer is rarely the same words as the recording.' },
    { skill: 'Speaking', text: 'Compare photos, a collaborative task and a discussion. Aim for organised answers of about a minute.' },
  ],
  C1: [
    { skill: 'Reading and Use of English', text: 'Dense texts and precise grammar: inversion, cleft sentences and advanced collocations.' },
    { skill: 'Writing', text: 'An essay and a proposal, report, review or letter with a formal tone and developed arguments.' },
    { skill: 'Listening', text: 'Fast speech, implied attitude and multiple speakers. Summarise the point, not every word.' },
    { skill: 'Speaking', text: 'Develop abstract ideas, justify opinions and respond to the other candidate with precise language.' },
  ],
  C2: [
    { skill: 'Reading and Use of English', text: 'Nuance, idiom and structure under time pressure. Review every missed item, not only the score.' },
    { skill: 'Writing', text: 'Control of register and cohesion in long tasks. Cut repetition and make each paragraph do one job.' },
    { skill: 'Listening', text: 'Fine differences in attitude and emphasis. One full paper a week is more useful than short clips only.' },
    { skill: 'Speaking', text: 'Natural interaction, precise vocabulary and the ability to reformulate when you lack a word.' },
  ],
};

function formatCount(value, singular, plural) {
  const count = Math.max(0, Number(value) || 0);
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Informe escrito a partir de la actividad que ya usa la recomendación de fechas. */
export function buildExamPreparationReport({
  levelEstimate = 'B1',
  completedExams = 0,
  studyStreak = 0,
  totalStudyMinutes = 0,
} = {}) {
  const recommendation = getExamReadinessRecommendation({
    levelEstimate,
    completedExams,
    studyStreak,
    totalStudyMinutes,
  });
  const exams = Math.max(0, Number(completedExams) || 0);
  const streak = Math.max(0, Number(studyStreak) || 0);
  const minutes = Math.max(0, Number(totalStudyMinutes) || 0);
  const hours = Math.floor(minutes / 60);
  const level = recommendation.level;
  const skills = SKILL_PLAN[level] || SKILL_PLAN.B1;

  const activity = exams === 0 && streak === 0 && minutes === 0
    ? 'There is no completed exam practice on Dralo yet, so this report starts from the estimated level rather than from scored papers.'
    : `So far Dralo has ${formatCount(exams, 'completed exam activity', 'completed exam activities')}, a study streak of ${formatCount(streak, 'day', 'days')} and ${hours > 0 ? `${hours} h` : `${minutes} min`} of recorded study.`;

  const summary = `Estimated level ${level}. ${activity} The suggested window is ${recommendation.suggestedWindow.toLowerCase()}, with about ${recommendation.prepMonthsRecommended} months of steady preparation (${recommendation.prepMonthsMinimum} as a minimum). ${recommendation.headline}`;

  const nextSteps = [
    exams < 1
      ? `Complete one full ${level} practice paper, then read the correction before starting another.`
      : `Repeat the skill with the lowest result before booking. You already have ${formatCount(exams, 'recorded activity', 'recorded activities')}.`,
    'Use the city links below only after a full mock feels stable. Paper sessions in June, August and December fill up early.',
    `Keep a weekly rhythm: Reading and Use of English, Writing, Listening and Speaking, all at ${level}.`,
  ];

  return {
    title: 'Exam preparation report',
    summary,
    skills,
    nextSteps,
    facts: [
      { label: 'Estimated level', value: level },
      { label: 'Readiness', value: recommendation.readinessLabel },
      { label: 'Suggested window', value: recommendation.suggestedWindow },
      { label: 'Recorded study', value: hours > 0 ? `${hours} h` : `${minutes} min` },
    ],
  };
}

const WEAK_AREA_FALLBACKS = {
  1: 'Collocations',
  2: 'Prepositions',
  3: 'Verb patterns',
  4: 'Fixed phrases',
  5: 'Vocabulary meaning',
  6: 'Vocabulary meaning',
  7: 'Vocabulary meaning',
};

/** Weak-area label → /teoria topic the student should review. */
const WEAK_AREA_THEORY_HREFS = {
  collocations: '/teoria/collocations-phrasal-verbs',
  prepositions: '/teoria/5-Prepositions',
  'verb patterns': '/teoria/10-Infinitive-vs-Gerund',
  'fixed phrases': '/teoria/Idioms-and-Expressions',
  'vocabulary meaning': '/teoria/Vocabulary-in-Context',
  idioms: '/teoria/Idioms-and-Expressions',
  'phrasal verbs': '/teoria/collocations-phrasal-verbs',
  connectors: '/teoria/Linking-Words',
  linkers: '/teoria/Linking-Words',
  'word formation': '/teoria/Advanced-Word-Formation',
};

/** B2 RuOE / Reading part → default exam-theory page when the area label is generic. */
const PART_THEORY_HREFS = {
  1: '/teoria/Multiple-Choice-Cloze',
  2: '/teoria/Open-Cloze',
  3: '/teoria/Advanced-Word-Formation',
  4: '/teoria/Key-Word-Transformations',
  5: '/teoria/Multiple-Choice-Questions',
  6: '/teoria/Gapped-Text',
  7: '/teoria/Multiple-Matching',
};

export function getWeakAreaTheoryHref(areaName, partNumber) {
  const key = String(areaName || '').trim().toLowerCase();
  if (WEAK_AREA_THEORY_HREFS[key]) return WEAK_AREA_THEORY_HREFS[key];
  return PART_THEORY_HREFS[Number(partNumber)] || null;
}

/**
 * @param {object} params
 * @param {number} params.partNumber
 * @param {Array<{ questionKey: string, questionNumber: number, isCorrect?: boolean, isChecked?: boolean, category?: string }>} params.questions
 * @param {Record<string, boolean>} params.checkedQuestions
 * @param {Record<string, string>} params.selectedOptions
 * @param {Record<string, 'sure' | 'not_sure' | 'guess'>} params.confidenceByQuestion
 * @param {Array<{ questionNumber: number, options: Array<{ id: string, correcta?: boolean }> }>} params.groupedAnswers
 */
export function getWeakAreas({
  partNumber,
  questions = [],
  checkedQuestions = {},
  selectedOptions = {},
  confidenceByQuestion = {},
  groupedAnswers = [],
}) {
  const areaCounts = new Map();
  let wrongCount = 0;
  let guessWrongCount = 0;

  const groupByNumber = new Map(groupedAnswers.map((g) => [g.questionNumber, g]));

  for (const q of questions) {
    if (!checkedQuestions[q.questionKey]) continue;

    const group = groupByNumber.get(q.questionNumber);
    const selectedId = selectedOptions[q.questionKey];
    const selectedOption = group?.options?.find((o) => o.id === selectedId);
    const isCorrect = selectedOption ? !!selectedOption.correcta : q.isCorrect;

    if (isCorrect) continue;

    wrongCount += 1;
    const confidence = confidenceByQuestion[q.questionKey];
    if (confidence === 'guess') guessWrongCount += 1;

    const area = q.category || WEAK_AREA_FALLBACKS[partNumber] || 'Vocabulary meaning';
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
  }

  if (wrongCount === 0) {
    return {
      areas: [],
      wrongCount: 0,
      guessWrongCount: 0,
      message: 'Complete more questions to detect weak areas.',
    };
  }

  const areas = [...areaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  let message = `You got ${wrongCount} question${wrongCount === 1 ? '' : 's'} wrong`;
  if (guessWrongCount > 0) {
    message += `, but ${guessWrongCount} of them ${guessWrongCount === 1 ? 'was' : 'were'} guesses`;
  }
  if (areas.length) {
    message += `. Review ${areas.map((a) => a.name.toLowerCase()).join(' and ')}.`;
  }

  return { areas, wrongCount, guessWrongCount, message };
}

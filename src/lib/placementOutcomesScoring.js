/**
 * Outcomes Placement Test — scoring from official package (Heinle/Cengage).
 * @see Outcomes Placement Test.pdf — Test Administration, Scoring and Results
 */

/** Grammar & vocabulary (Placement Test): 50 items, 1 point each. */
export const OUTCOMES_GRAMMAR_MAX = 50;

/** Reading (online extension): 10 items, 1 point each — bands scaled from grammar chart. */
export const OUTCOMES_READING_MAX = 10;

/** Writing: 0–10 per Writing Assessment Guidelines. */
export const OUTCOMES_WRITING_MAX = 10;

/** Official bands for the 50-item Placement Test (grammar & vocabulary). */
export const OUTCOMES_GRAMMAR_BANDS = [
  {
    min: 0,
    max: 18,
    outcomesLevel: 'Outcomes Elementary',
    shortLevel: 'Elementary',
    cefr: 'A1',
  },
  {
    min: 19,
    max: 25,
    outcomesLevel: 'Outcomes Pre-Intermediate',
    shortLevel: 'Pre-Intermediate',
    cefr: 'A2',
  },
  {
    min: 26,
    max: 32,
    outcomesLevel: 'Outcomes Intermediate',
    shortLevel: 'Intermediate',
    cefr: 'B1',
  },
  {
    min: 33,
    max: 39,
    outcomesLevel: 'Outcomes Upper Intermediate',
    shortLevel: 'Upper Intermediate',
    cefr: 'B2',
  },
  {
    min: 40,
    max: 46,
    outcomesLevel: 'Outcomes Advanced',
    shortLevel: 'Advanced',
    cefr: 'C1',
  },
  {
    min: 47,
    max: 50,
    outcomesLevel: 'Higher level series recommended',
    shortLevel: 'Higher level',
    cefr: 'C2',
  },
];

/** Writing Placement Test (0–10). */
export const OUTCOMES_WRITING_BANDS = [
  { min: 0, max: 1, outcomesLevel: 'Outcomes Elementary', shortLevel: 'Elementary', cefr: 'A1' },
  { min: 2, max: 3, outcomesLevel: 'Outcomes Pre-Intermediate', shortLevel: 'Pre-Intermediate', cefr: 'A2' },
  { min: 4, max: 5, outcomesLevel: 'Outcomes Intermediate', shortLevel: 'Intermediate', cefr: 'B1' },
  { min: 6, max: 7, outcomesLevel: 'Outcomes Upper Intermediate', shortLevel: 'Upper Intermediate', cefr: 'B2' },
  { min: 8, max: 9, outcomesLevel: 'Outcomes Advanced', shortLevel: 'Advanced', cefr: 'C1' },
  { min: 10, max: 10, outcomesLevel: 'Higher level series recommended', shortLevel: 'Higher level', cefr: 'C2' },
];

function findBand(score, bands) {
  const s = Math.max(0, Number(score) || 0);
  return (
    bands.find((b) => s >= b.min && s <= b.max) ||
    bands[bands.length - 1]
  );
}

/** Level from official 50-item Placement Test score. */
export function outcomesLevelFromGrammarScore(score) {
  const s = Math.min(OUTCOMES_GRAMMAR_MAX, Math.max(0, Number(score) || 0));
  return { ...findBand(s, OUTCOMES_GRAMMAR_BANDS), score: s, max: OUTCOMES_GRAMMAR_MAX };
}

/** Reading: same thresholds as grammar, scaled to 10 items (1 point each). */
export function outcomesLevelFromReadingScore(score) {
  const s = Math.min(OUTCOMES_READING_MAX, Math.max(0, Number(score) || 0));
  const equivalentOn50 = Math.round((s / OUTCOMES_READING_MAX) * OUTCOMES_GRAMMAR_MAX);
  const band = findBand(equivalentOn50, OUTCOMES_GRAMMAR_BANDS);
  return { ...band, score: s, max: OUTCOMES_READING_MAX, equivalentOn50 };
}

/** Writing: 0–10 from examiner scale (or AI scorePercent / 10). */
export function outcomesLevelFromWritingScore(score0to10) {
  const s = Math.min(OUTCOMES_WRITING_MAX, Math.max(0, Math.round(Number(score0to10) || 0)));
  return { ...findBand(s, OUTCOMES_WRITING_BANDS), score: s, max: OUTCOMES_WRITING_MAX };
}

/** Map AI scorePercent (0–100) to Outcomes writing scale 0–10. */
export function writingPercentToOutcomesScore(scorePercent) {
  const pct = Math.min(100, Math.max(0, Number(scorePercent) || 0));
  return Math.min(10, Math.max(0, Math.round(pct / 10)));
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function cefrIndex(cefr) {
  const i = CEFR_ORDER.indexOf(cefr);
  return i >= 0 ? i : 0;
}

function indexToCefr(i) {
  return CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, Math.max(0, i))];
}

function isAnswerCorrect(q, answers, writingEval) {
  if (q.type === 'writing') {
    return Boolean(writingEval?.countsAsCorrect);
  }
  const user = String(answers[q.id] ?? '').trim();
  const key = String(q.answer ?? '').trim();
  return user.length > 0 && user === key;
}

/**
 * Full placement results (Outcomes method).
 * Primary recommended level = Grammar (official Placement Test), per publisher guidance.
 */
export function computeOutcomesPlacementResults({
  questions,
  answers,
  writingEval,
}) {
  const list = questions || [];
  const grammarQs = list.filter((q) => q.part === 1);
  const readingQs = list.filter((q) => q.part === 2);
  const writingQ = list.find((q) => q.type === 'writing');

  const countCorrect = (qs) =>
    qs.filter((q) => isAnswerCorrect(q, answers, writingEval)).length;

  const grammarCorrect = countCorrect(grammarQs);
  const readingCorrect = countCorrect(readingQs);
  const grammarTotal = grammarQs.length || OUTCOMES_GRAMMAR_MAX;
  const readingTotal = readingQs.length || OUTCOMES_READING_MAX;

  const grammarBand = outcomesLevelFromGrammarScore(
    grammarTotal === OUTCOMES_GRAMMAR_MAX
      ? grammarCorrect
      : Math.round((grammarCorrect / Math.max(1, grammarTotal)) * OUTCOMES_GRAMMAR_MAX),
  );

  const readingBand = outcomesLevelFromReadingScore(readingCorrect);

  let writingBand = null;
  let writingScore10 = null;
  if (writingQ && writingEval) {
    writingScore10 =
      writingEval.writingScore10 != null
        ? Number(writingEval.writingScore10)
        : writingPercentToOutcomesScore(writingEval.scorePercent);
    writingBand = outcomesLevelFromWritingScore(writingScore10);
  }

  const bands = [grammarBand, readingBand, writingBand].filter(Boolean);
  const indices = bands.map((b) => cefrIndex(b.cefr));
  const minIdx = Math.min(...indices);
  const maxIdx = Math.max(...indices);
  const spread = maxIdx - minIdx;

  const recommended = grammarBand;
  const conservativeCefr =
    spread >= 2 ? indexToCefr(minIdx) : recommended.cefr;

  const mcqTotal = grammarQs.length + readingQs.length;
  const mcqCorrect = grammarCorrect + readingCorrect;

  return {
    grammar: {
      correct: grammarCorrect,
      total: grammarTotal,
      band: grammarBand,
    },
    reading: {
      correct: readingCorrect,
      total: readingTotal,
      band: readingBand,
    },
    writing: writingBand
      ? {
          score10: writingScore10,
          band: writingBand,
          scorePercent: writingEval?.scorePercent ?? null,
        }
      : null,
    recommended,
    conservativeCefr,
    spread,
    mcqCorrect,
    mcqTotal,
    totalCorrect: mcqCorrect + (writingBand && writingEval?.countsAsCorrect ? 1 : 0),
    totalQuestions: list.length,
  };
}

/** CEFR label for training links (uses grammar-based recommendation). */
export function outcomesCefrForTraining(results) {
  if (!results?.recommended) return 'A1';
  return results.conservativeCefr || results.recommended.cefr;
}

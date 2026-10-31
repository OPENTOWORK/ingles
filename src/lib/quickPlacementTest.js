import {
  OUTCOMES_GRAMMAR_MAX,
  outcomesLevelFromGrammarScore,
} from '@/lib/placementOutcomesScoring';

/** Short grammar sample: about 30 seconds per item. */
export const QUICK_TEST_QUESTION_COUNT = 10;
export const QUICK_TEST_SECONDS = 5 * 60;

function isQuickTestItem(question) {
  if (!question || question.part !== 1) return false;
  if (question.type === 'writing' || question.type === 'cloze') return false;
  if (!String(question.text || '').trim()) return false;
  if (!String(question.answer || '').trim()) return false;
  return Array.isArray(question.options) && question.options.length >= 2;
}

export function pickQuickTestQuestions(questions, count = QUICK_TEST_QUESTION_COUNT) {
  const pool = (Array.isArray(questions) ? questions : []).filter(isQuickTestItem);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(0, count));
}

export function countQuickTestCorrect(questions, answers) {
  return (questions || []).reduce((sum, question) => {
    const given = String(answers?.[question.id] ?? '').trim();
    const expected = String(question.answer ?? '').trim();
    return given && given === expected ? sum + 1 : sum;
  }, 0);
}

/** Map a short sample onto the official 50-item Outcomes grammar bands. */
export function quickTestLevelFromScore(correct, total) {
  const safeTotal = Math.max(1, Number(total) || 0);
  const safeCorrect = Math.min(safeTotal, Math.max(0, Number(correct) || 0));
  const equivalentOn50 = Math.round((safeCorrect / safeTotal) * OUTCOMES_GRAMMAR_MAX);
  const band = outcomesLevelFromGrammarScore(equivalentOn50);
  return {
    ...band,
    correct: safeCorrect,
    total: Number(total) || 0,
    equivalentOn50,
  };
}

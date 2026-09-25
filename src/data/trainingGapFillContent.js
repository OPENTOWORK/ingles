/**
 * Training gap-fill items (student types the answer, no options).
 *
 * Pipeline behind each item, same philosophy as the RUOE motor:
 * blueprint → item content → mechanical validation → semantic validation →
 * answer + accepted variants → feedback → performance data (errorTag).
 *
 * Mechanical/semantic validation lives in `@/lib/trainingGapFillGrading` and runs
 * in `src/lib/__tests__/trainingGapFillGrading.test.js`, so a broken item fails the
 * test suite instead of reaching a student.
 *
 * Gaps are written as `{1}`, `{2}` inside `sentence`, in reading order.
 */

import { B2_BASIC_LEVELS_A } from './b2BasicTrainingBankA.js';
import { B2_BASIC_LEVELS_B } from './b2BasicTrainingBankB.js';
import { B2_BASIC_LEVELS_C } from './b2BasicTrainingBankC.js';
import { B2_BASIC_LEVELS_D } from './b2BasicTrainingBankD.js';
import { B2_BASIC_LEVELS_E } from './b2BasicTrainingBankE.js';
import { B2_BASIC_01_MIXED_ITEMS } from './trainingLevel1MixedItems.js';

/** B2 · Basic · Use of English · level 1 — present simple, mixed tasks. */
const B2_BASIC_01_PRESENT_SIMPLE = {
  exerciseId: 'b2-basic-01',
  cefr: 'B2',
  category: 'verb_tenses',
  grammarFocus: 'present_simple',
  title: 'Present simple',
  instruction: 'Each question tells you what to do. The grammar point is the present simple.',
  items: [
    {
      itemId: 'b2-basic-01-q01',
      subFocus: 'collective_subject_routine',
      sentence:
        'Most of the research team {1} from home on Fridays, unless an experiment requires them to be in the laboratory.',
      promptWord: 'WORK',
      gaps: [{ canonicalAnswer: 'works', acceptedAnswers: ['works'] }],
      explanation:
        '“Most of the research team” is treated here as a single team, and the sentence describes a regular arrangement, so the Present Simple is used: “works”.',
      errorTag: 'present_simple_third_person',
    },
    {
      itemId: 'b2-basic-01-q02',
      subFocus: 'timetabled_service',
      sentence:
        'This train {1} at every station between Oxford and Reading, so the journey takes slightly longer.',
      promptWord: 'STOP',
      gaps: [{ canonicalAnswer: 'stops', acceptedAnswers: ['stops'] }],
      explanation:
        'The Present Simple is used for timetabled or scheduled events such as train services: “stops”.',
      errorTag: 'present_simple_schedule',
    },
    {
      itemId: 'b2-basic-01-q03',
      subFocus: 'stative_verb_negative',
      sentence:
        'I {1} why some people prefer working under pressure; I find it incredibly distracting.',
      promptWord: 'NOT / UNDERSTAND',
      gaps: [
        {
          canonicalAnswer: "don't understand",
          acceptedAnswers: ["don't understand", 'do not understand'],
        },
      ],
      explanation:
        '“Understand” is normally a stative verb, so we use the Present Simple rather than a continuous form. With “I”, the negative is “don’t understand”.',
      errorTag: 'present_simple_negative',
    },
    {
      itemId: 'b2-basic-01-q04',
      subFocus: 'frequency_question_auxiliary',
      sentence: 'How often {1} your department {2} its cybersecurity procedures?',
      promptWord: 'REVIEW',
      gaps: [
        { canonicalAnswer: 'does', acceptedAnswers: ['does'] },
        { canonicalAnswer: 'review', acceptedAnswers: ['review'] },
      ],
      explanation:
        'Present Simple questions with a third-person singular subject use “does”, followed by the base form of the main verb.',
      errorTag: 'present_simple_question',
    },
    {
      itemId: 'b2-basic-01-q05',
      subFocus: 'automatic_process',
      sentence:
        'The software automatically {1} a backup copy whenever you close the application.',
      promptWord: 'CREATE',
      gaps: [{ canonicalAnswer: 'creates', acceptedAnswers: ['creates'] }],
      explanation:
        'The sentence describes what the software does every time a particular event occurs, so the Present Simple is appropriate: “creates”.',
      errorTag: 'present_simple_repeated_event',
    },
    {
      itemId: 'b2-basic-01-q06',
      subFocus: 'neither_agreement',
      sentence: 'Neither of these explanations {1} entirely convincing to me.',
      promptWord: 'SEEM',
      gaps: [{ canonicalAnswer: 'seems', acceptedAnswers: ['seems'] }],
      explanation:
        '“Neither” is singular in standard formal usage, so the verb takes the third-person singular form: “seems”.',
      errorTag: 'subject_verb_agreement',
    },
    {
      itemId: 'b2-basic-01-q07',
      subFocus: 'stative_verb_question',
      sentence:
        'Why {1} this particular model {2} so much more than the standard version?',
      promptWord: 'COST',
      gaps: [
        { canonicalAnswer: 'does', acceptedAnswers: ['does'] },
        { canonicalAnswer: 'cost', acceptedAnswers: ['cost'] },
      ],
      explanation:
        '“Cost” normally describes a state here. Present Simple questions use “does” with a third-person singular subject, followed by the base form “cost”.',
      errorTag: 'present_simple_stative',
    },
    {
      itemId: 'b2-basic-01-q08',
      subFocus: 'whenever_clause',
      sentence:
        'Whenever Marta {1} a presentation, she rehearses the opening several times beforehand.',
      promptWord: 'GIVE',
      gaps: [{ canonicalAnswer: 'gives', acceptedAnswers: ['gives'] }],
      explanation:
        '“Whenever” indicates something that happens repeatedly, so the Present Simple is used: “gives”.',
      errorTag: 'present_simple_third_person',
    },
    {
      itemId: 'b2-basic-01-q09',
      subFocus: 'plural_subject_negative',
      sentence:
        "The figures in this report {1} the results from last year's survey particularly closely.",
      promptWord: 'NOT / MATCH',
      gaps: [
        {
          canonicalAnswer: "don't match",
          acceptedAnswers: ["don't match", 'do not match'],
        },
      ],
      explanation:
        '“The figures” is plural, so the Present Simple negative uses “do not/don’t”, not “doesn’t”.',
      errorTag: 'present_simple_negative',
    },
    {
      itemId: 'b2-basic-01-q10',
      subFocus: 'meaning_question',
      sentence:
        'What {1} this abbreviation {2} in the final paragraph of the report?',
      promptWord: 'MEAN',
      gaps: [
        { canonicalAnswer: 'does', acceptedAnswers: ['does'] },
        { canonicalAnswer: 'mean', acceptedAnswers: ['mean'] },
      ],
      explanation:
        '“Mean” is stative in this context. With the singular subject “this abbreviation”, the question uses “does” + base verb.',
      errorTag: 'present_simple_question',
    },
    ...B2_BASIC_01_MIXED_ITEMS,
  ],
};

/** Key: `${cefr}|${skill}|${difficulty}|${levelNumber}`. */
const B2_BASIC_LEVELS = {
  1: B2_BASIC_01_PRESENT_SIMPLE,
  ...B2_BASIC_LEVELS_A,
  ...B2_BASIC_LEVELS_B,
  ...B2_BASIC_LEVELS_C,
  ...B2_BASIC_LEVELS_D,
  ...B2_BASIC_LEVELS_E,
};

const GAP_FILL_EXERCISES = Object.fromEntries(
  Object.entries(B2_BASIC_LEVELS).map(([level, exercise]) => [
    `b2|use-of-english|basico|${level}`,
    exercise,
  ]),
);

/**
 * @param {string} cefrLevel
 * @param {string} skill
 * @param {string} difficulty
 * @param {number|string} levelNumber
 * @returns {typeof B2_BASIC_01_PRESENT_SIMPLE | null}
 */
export function getGapFillExercise(cefrLevel, skill, difficulty, levelNumber) {
  const cefr = String(cefrLevel || '').toLowerCase();
  const skillKey = String(skill || '').toLowerCase().replace(/_/g, '-');
  const diff = String(difficulty || '').toLowerCase();
  const num = parseInt(String(levelNumber).replace(/\D/g, ''), 10);
  if (!num) return null;
  return GAP_FILL_EXERCISES[`${cefr}|${skillKey}|${diff}|${num}`] || null;
}

export { B2_BASIC_01_PRESENT_SIMPLE, GAP_FILL_EXERCISES };

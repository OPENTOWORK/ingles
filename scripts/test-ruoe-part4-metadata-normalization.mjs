/**
 * Part 4 metadata normalization regression tests (v1.1.2).
 */
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validatePart4Quality, validatePart4MetadataCoherence } from '../src/lib/ruoePart4Quality.js';
import {
  normalizePart4ItemMetadataFromCanonicalAnswer,
  normalizePart4MetadataFromCanonicalAnswer,
  validatePart4SlotKeywordAssignment,
} from '../src/lib/ruoePart4MetadataNormalization.js';
import {
  repairPart4ItemMarkingPoints,
  repairPart4MarkingPoints,
} from '../src/lib/ruoePart4MarkingPointRepair.js';

function assertPass(name, ok, detail = '') {
  if (!ok) {
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function meta(keyword, fullAnswers, mp1Label, mp1Acc, mp2Label, mp2Acc) {
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword,
    fullAnswers,
    markingPoints: [
      { id: 1, label: mp1Label, accepted: mp1Acc },
      { id: 2, label: mp2Label, accepted: mp2Acc },
    ],
  };
}

// valid pedagogical MP label with NEED → PASS
const needItem = {
  number: 27,
  keyword: 'NEED',
  sentence1: 'You did something unnecessary by bringing the documents.',
  sentence2Start: 'You __________________ the documents.',
  answer: 'need not have brought',
  target_structure: 'need not have + past participle',
  grading_metadata: meta(
    'NEED',
    ['need not have brought'],
    'modal perfect structure with need',
    ['need not have'],
    'past participle complement',
    ['brought'],
  ),
};
const needFindings = validatePart4MetadataCoherence(
  needItem,
  needItem.answer,
  needItem.grading_metadata,
);
assertPass(
  'valid pedagogical MP label with NEED → PASS',
  !needFindings.some((f) => f.rule_id === 'P4-MARKING-POINT-MISMATCH'),
);

// contradictory MP label → HARD
const badLabel = {
  number: 30,
  keyword: 'FEW',
  answer: 'very few',
  grading_metadata: meta('FEW', ['very few'], 'hardly any quantifier', ['hardly'], 'any', ['any']),
};
const badLabelFindings = validatePart4MetadataCoherence(
  badLabel,
  badLabel.answer,
  badLabel.grading_metadata,
);
assertPass(
  'contradictory MP label → HARD',
  badLabelFindings.some((f) => f.rule_id === 'P4-MARKING-POINT-MISMATCH'),
);

// valid pedagogical target_structure without literal token match → PASS
const sinceItem = {
  number: 28,
  keyword: 'SINCE',
  answer: 'since he left school',
  target_structure: 'present perfect + time period + since',
  grading_metadata: meta(
    'SINCE',
    ['since he left school'],
    'duration frame',
    ['since he'],
    'past event',
    ['left school'],
  ),
};
const sinceFindings = validatePart4MetadataCoherence(
  sinceItem,
  sinceItem.answer,
  sinceItem.grading_metadata,
);
assertPass(
  'valid pedagogical target_structure without literal token match → PASS',
  !sinceFindings.some((f) => f.rule_id === 'P4-METADATA-MISMATCH'),
);

// FEW canonical very few + target hardly any → HARD
const fewBad = {
  number: 30,
  keyword: 'FEW',
  answer: 'very few',
  target_structure: 'very few / hardly any equivalence',
};
const fewBadFindings = validatePart4MetadataCoherence(
  fewBad,
  fewBad.answer,
  meta('FEW', ['very few'], 'mp1', ['very'], 'mp2', ['few']),
);
assertPass(
  'FEW canonical very few + target hardly any → HARD',
  fewBadFindings.some((f) => f.rule_id === 'P4-METADATA-MISMATCH'),
);

// FEW canonical very few + target very few + plural noun → PASS (after normalization)
const fewNorm = normalizePart4ItemMetadataFromCanonicalAnswer({
  number: 30,
  keyword: 'FEW',
  answer: 'very few',
  target_structure: 'very few / hardly any equivalence',
  grading_metadata: meta('FEW', ['very few'], 'very few quantifier', ['very'], 'few', ['few']),
});
assertPass(
  'FEW normalized target_structure',
  fewNorm.question.target_structure === 'very few + plural noun',
);
const fewGoodFindings = validatePart4MetadataCoherence(
  fewNorm.question,
  fewNorm.question.answer,
  fewNorm.question.grading_metadata,
);
assertPass(
  'FEW canonical very few + target very few + plural noun → PASS',
  !fewGoodFindings.some((f) => f.severity === 'HARD_FAIL'),
);

// SINCE correct target descriptor → PASS
assertPass(
  'SINCE correct target descriptor → PASS',
  !sinceFindings.some((f) => f.severity === 'HARD_FAIL'),
);

// slot/family mismatch Q28/Q29 → HARD
const slotGen = {
  questions: [
    { number: 28, keyword: 'MIND', answer: 'made up her mind' },
    { number: 29, keyword: 'SINCE', answer: 'since he left' },
  ],
};
const blueprintSlots = [
  { question_number: 28, keyword_constraint: { keyword: 'SINCE' } },
  { question_number: 29, keyword_constraint: { keyword: 'MIND' } },
];
const slotFindings = validatePart4SlotKeywordAssignment(slotGen, blueprintSlots);
assertPass(
  'slot/family mismatch Q28/Q29 → HARD',
  slotFindings.length === 2 && slotFindings.every((f) => f.rule_id === 'P4-SLOT-KEYWORD-MISMATCH'),
);

// normalized metadata remains stable after marking-point repair
const repairBase = {
  number: 27,
  keyword: 'NEED',
  sentence1: 'Unnecessary call.',
  sentence2Start: 'You __________________ yesterday.',
  answer: 'need not have called',
  grading_metadata: meta(
    'NEED',
    ['need not have called'],
    'wrong label',
    ['need not'],
    'wrong label 2',
    ['have called'],
  ),
};
const repaired = repairPart4ItemMarkingPoints(repairBase);
const repairedGen = repairPart4MarkingPoints(
  { questions: [repaired.question], modelAnswers: [] },
  { normalizeMetadata: true },
);
const q27 = repairedGen.gen.questions[0];
const beforeS1 = repairBase.sentence1;
const beforeS2 = repairBase.sentence2Start;
const beforeKw = repairBase.keyword;
const beforeAns = repairBase.answer;
assertPass(
  'normalized metadata stable after marking-point repair — content unchanged',
  q27.sentence1 === beforeS1 &&
    q27.sentence2Start === beforeS2 &&
    q27.keyword === beforeKw &&
    q27.answer === beforeAns,
);
assertPass(
  'normalized metadata stable after marking-point repair — target aligned',
  q27.target_structure === 'need not have + past participle',
);

console.log('Part 4 metadata normalization tests completed.');

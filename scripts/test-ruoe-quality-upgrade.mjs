/**
 * Regression tests for DRALO RUOE System Quality Upgrade v1.1.1.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-ruoe-quality-upgrade.mjs
 */
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validateRuoeEditorialQuality } from '../src/lib/ruoeEditorialQuality.js';
import {
  findPart6OptionsDuplicatedInPassage,
  detectPart6Multifit,
  validatePart6HardRules,
} from '../src/lib/ruoePart6HardValidators.js';
import {
  analyzePart5Quality,
  checkPart5ReferenceIntegrity,
  countWords,
  detectPart3StemForcing,
  derivePart3TransformationFamily,
} from '../src/lib/b2RuoeExamQuality.js';
import { analyzePart6PoolDevelopment } from '../src/lib/ruoePart6HardValidators.js';
import { classifyTitlePatternFamily } from '../src/lib/ruoeStyleCardV11.js';

function collectMessages(result) {
  return [...result.errors, ...(result.qualityFails || []), ...result.warnings];
}

function assertQualityFail(name, fn, pattern) {
  const result = fn();
  const text = collectMessages(result).join('\n');
  if (pattern && !pattern.test(text)) {
    console.error(`FAIL ${name}: expected match ${pattern} in:\n${text}`);
    process.exitCode = 1;
    return;
  }
  if (!pattern && result.ok) {
    console.error(`FAIL ${name}: expected quality/hard failure but passed`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function assertHardFail(name, fn, pattern) {
  const result = fn();
  if (result.ok) {
    console.error(`FAIL ${name}: expected HARD fail (errors) but ok`);
    process.exitCode = 1;
    return;
  }
  const text = result.errors.join('\n');
  if (pattern && !pattern.test(text)) {
    console.error(`FAIL ${name}: expected HARD match ${pattern} in:\n${text}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function assertPass(name, fn) {
  const result = fn();
  if (!result.ok) {
    console.error(`FAIL ${name}: expected pass but got HARD errors:\n${result.errors.join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

// Minimal valid Part 3 skeleton (suffix variety, no prefix required)
function basePart3() {
  const stems = ['ADAPT', 'USE', 'CARE', 'ACT', 'KNOW', 'FRIEND', 'SUCCESS', 'POLITE'];
  let passage =
    'Many towns are changing how residents share public space and local services. People often find shared tools (0) ___ (USE) when borrowing equipment. ';
  for (let n = 17; n <= 24; n += 1) {
    passage += `Residents also notice issue (${n}) ___ (${stems[n - 17]}) in daily life around markets and schools. `;
  }
  while (passage.split(/\s+/).length < 170) {
    passage += 'Local councils weigh evidence carefully before funding any pilot scheme in shared streets. ';
  }
  return {
    title: 'Shared Streets',
    passage,
    example: { number: 0, stem: 'USE', answer: 'useful' },
    questions: stems.map((stem, i) => ({
      id: `q${i + 1}`,
      number: 17 + i,
      stem,
    })),
    modelAnswers: stems.map((stem, i) => ({
      id: `q${i + 1}`,
      number: 17 + i,
      answer:
        i === 0
          ? 'adaptable'
          : i === 1
            ? 'useful'
            : i === 2
              ? 'careful'
              : i === 3
                ? 'active'
                : i === 4
                  ? 'knowledge'
                  : i === 5
                    ? 'friendly'
                    : i === 6
                      ? 'successful'
                      : 'politely',
    })),
  };
}

// TEST-P3-NO-TRANSFORM (HARD)
assertHardFail(
  'TEST-P3-NO-TRANSFORM',
  () => {
    const g = basePart3();
    g.modelAnswers[0].answer = 'adapt';
    return validateGeneratedExamPart('b2', 3, g);
  },
  /P3-NO-TRANSFORM|identical to answer/i,
);

// TEST-P3-FORCED-NATURALNESS (QUALITY_FAIL deterministic)
assertQualityFail(
  'TEST-P3-FORCED-NATURALNESS',
  () => {
    const g = basePart3();
    g.passage = g.passage.replace(
      'issue (17) ___ (ADAPT)',
      'ADAPT (17) ___ (ADAPT)',
    );
    return validateGeneratedExamPart('b2', 3, g);
  },
  /TEST-P3-FORCED-NATURALNESS|forced next to gap/i,
);

// v1.1.2: canonical (N) ___ (STEM) must NOT trigger forced-naturalness
const canonicalP3 = basePart3();
const canonicalForcing = canonicalP3.questions.some((q) =>
  detectPart3StemForcing(canonicalP3.passage, q.stem, q.number),
);
if (canonicalForcing) {
  console.error('FAIL POSITIVE-P3-CANONICAL-FORMAT: canonical gaps flagged as forced-naturalness');
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P3-CANONICAL-FORMAT');
}
const canonicalValidation = validateGeneratedExamPart('b2', 3, canonicalP3);
if (
  (canonicalValidation.qualityFails || []).some((m) => /FORCED-NATURALNESS/i.test(m))
) {
  console.error(
    `FAIL POSITIVE-P3-CANONICAL-FORMAT-validation: ${canonicalValidation.qualityFails.join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P3-CANONICAL-FORMAT-validation');
}

// Positive: Part 3 without prefix/negative — must pass HARD layer
assertPass('POSITIVE-P3-NO-PREFIX', () => validateGeneratedExamPart('b2', 3, basePart3()));

// Positive: transformationFamily metadata attached
const p3Norm = validateGeneratedExamPart('b2', 3, basePart3()).normalized;
if (!p3Norm.questions?.[0]?.transformationFamily) {
  console.error('FAIL POSITIVE-P3-METADATA: missing transformationFamily on question');
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P3-METADATA');
}

// TEST-P6-DUPLICATE (HARD P6-H03)
const dupPassage =
  'Many planners now trial quieter routes. (37) ______. Children notice the difference first. (38) ______. Critics argue funding is uneven. (39) ______. Consultation remains patchy. (40) ______. Maintenance budgets decide survival. (41) ______. Attitudes can shift slowly. (42) ______.';
const dupSentence =
  'This has led several municipalities to trial low-traffic neighbourhoods that redirect through-traffic away from residential roads.';
assertHardFail(
  'TEST-P6-DUPLICATE',
  () => {
    const g = {
      title: 'Quieter Streets',
      passage: `${dupPassage} ${dupSentence}`,
      sentencePool: [
        `A) ${dupSentence}`,
        'B) Meanwhile, international airports continue to expand despite rising ticket prices.',
        'C) In addition, shorter walking routes encourage neighbours to greet one another more often.',
        'D) For this reason, consultation that never reaches quieter voices tends to feel imposed.',
        'E) As a result, projects that look finished on opening day can quietly fail once paint fades.',
        'F) However, that concern is less convincing when similar benefits appear elsewhere.',
        'G) Therefore, lasting success depends as much on lived experience as on modelling.',
      ],
      questions: [37, 38, 39, 40, 41, 42].map((n, i) => ({ id: `q${i + 1}`, number: n })),
      modelAnswers: ['A', 'C', 'F', 'D', 'E', 'G'].map((answer, i) => ({
        id: `q${i + 1}`,
        number: 37 + i,
        answer,
      })),
    };
    return validateGeneratedExamPart('b2', 6, g);
  },
  /P6-H03|verbatim/i,
);

// TEST-P6-MULTIFIT (QUALITY_FAIL heuristic)
const multifitFiller =
  'Urban planners reviewed traffic models, consulted traders, interviewed residents near schools, and published summaries that described how local change might affect walking routes and market footfall throughout the year. ';
let multifitPassage = multifitFiller.repeat(8);
multifitPassage +=
  'However, traders and residents near schools remained cautious about the proposed change. (37) ______. ';
multifitPassage += multifitFiller.repeat(4);
multifitPassage +=
  'Meanwhile, traders attended evening meetings while residents discussed schools and local change openly. (38) ______. ';
multifitPassage += multifitFiller.repeat(4);
multifitPassage += 'A pilot lane opened beside the old market square. (39) ______. ';
multifitPassage += multifitFiller.repeat(4);
multifitPassage += 'Critics noted that maintenance costs were unclear for traders and residents. (40) ______. ';
multifitPassage += multifitFiller.repeat(4);
multifitPassage += 'Shopkeepers reported shorter delivery delays near schools. (41) ______. ';
multifitPassage += multifitFiller.repeat(4);
multifitPassage += 'Tourist guides began recommending the area again after the change. (42) ______. ';
multifitPassage += multifitFiller.repeat(6);

const versatileSentence =
  'However, this change also encouraged traders and residents near schools to share ideas more openly.';
const multifitGen = {
  title: 'Market Lanes',
  passage: multifitPassage,
  sentencePool: [
    `A) ${versatileSentence}`,
    'B) International cargo hubs expanded runways despite objections from environmental groups.',
    'C) Remote islands invested heavily in ferry links that reduced isolation for elderly residents.',
    'D) University labs patented a battery that charges in minutes using recycled materials.',
    'E) Orchestra members rehearsed outdoors until neighbours complained about late evening noise.',
    'F) Archaeologists mapped ruins that revealed trade routes across the desert centuries ago.',
    `G) ${versatileSentence.replace('However', 'Therefore')}`,
  ],
  questions: [37, 38, 39, 40, 41, 42].map((n, i) => ({ id: `q${i + 1}`, number: n })),
  modelAnswers: ['B', 'C', 'D', 'E', 'F', 'G'].map((answer, i) => ({
    id: `q${i + 1}`,
    number: 37 + i,
    answer,
  })),
};
const multifitDetected = detectPart6Multifit(multifitGen);
if (!multifitDetected.length) {
  console.error('FAIL TEST-P6-MULTIFIT-detector: heuristic did not flag multifit in fixture');
  process.exitCode = 1;
} else {
  console.log('PASS TEST-P6-MULTIFIT-detector');
}
const multifitRules = validatePart6HardRules(multifitGen);
if (!multifitRules.qualityFails.some((m) => /MULTIFIT|multifit/i.test(m))) {
  console.error(
    `FAIL TEST-P6-MULTIFIT: expected QUALITY_FAIL in:\n${multifitRules.qualityFails.join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.log('PASS TEST-P6-MULTIFIT');
}
const multifitValidation = validateGeneratedExamPart('b2', 6, multifitGen);
if (!multifitValidation.ok && multifitValidation.errors.some((e) => /word count|missing gap/i.test(e))) {
  console.error(
    `FAIL TEST-P6-MULTIFIT-validation: unexpected HARD errors:\n${multifitValidation.errors.join('\n')}`,
  );
  process.exitCode = 1;
} else if (multifitValidation.errors.some((e) => /MULTIFIT/i.test(e))) {
  console.error('FAIL TEST-P6-MULTIFIT-severity: multifit must not be HARD error');
  process.exitCode = 1;
} else {
  console.log('PASS TEST-P6-MULTIFIT-severity');
}

// Positive P6: clean gapped text passes HARD
assertPass('POSITIVE-P6-CLEAN', () => {
  const filler =
    'Cities are reopening old towpaths beside rivers where cyclists welcome smoother surfaces and wildlife charities record more otter sightings while funding still depends on annual grants from central government. ';
  let passage = filler.repeat(5);
  passage +=
    'Cyclists welcomed the smoother surfaces beside the river. (37) ______. ';
  passage += filler.repeat(2);
  passage += 'Wildlife charities recorded more otter sightings near the banks. (38) ______. ';
  passage += filler.repeat(2);
  passage += 'Volunteers planted wildflowers that attracted bees along the banks. (39) ______. ';
  passage += filler.repeat(2);
  passage += 'Funding still depends on annual grants from local councils. (40) ______. ';
  passage += filler.repeat(2);
  passage += 'Evening lighting made routes feel safer for commuters. (41) ______. ';
  passage += filler.repeat(2);
  passage += 'Local cafes extended opening hours during summer weekends. (42) ______. ';
  passage += filler.repeat(5);
  const g = {
    title: 'River Paths',
    passage,
    sentencePool: [
      'A) This improvement encouraged commuters to leave cars at home on sunny mornings.',
      'B) Meanwhile, harbour authorities debated dredging schedules that affect ferry timetables.',
      'C) In addition, volunteers planted wildflowers that attracted bees along the banks.',
      'D) For this reason, councils published maps that highlighted accessible entry points.',
      'E) As a result, property values near the water rose faster than planners predicted.',
      'F) However, winter floods can still wash away sections of the new path overnight.',
      'G) Therefore, maintenance teams inspect surfaces each month before peak tourist season.',
    ],
    questions: [37, 38, 39, 40, 41, 42].map((n, i) => ({ id: `q${i + 1}`, number: n })),
    modelAnswers: ['A', 'C', 'F', 'D', 'E', 'G'].map((answer, i) => ({
      id: `q${i + 1}`,
      number: 37 + i,
      answer,
    })),
  };
  return validateGeneratedExamPart('b2', 6, g);
});

// TEST-P5-OVERSIZE (HARD v1.1.2)
assertHardFail(
  'TEST-P5-OVERSIZE',
  () => {
    const filler =
      'Researchers studied urban gardens and found that shared plots helped neighbours cooperate during heatwaves while councils debated funding. ';
    let passage = filler.repeat(50);
    while (countWords(passage) < 660) passage += filler;
    const g = {
      title: 'City Gardens',
      passage,
      questions: Array.from({ length: 6 }, (_, i) => ({
        id: `q${i + 1}`,
        number: 31 + i,
        prompt: `What point does the writer make in paragraph ${i + 2}?`,
        questionType: 'detail',
        options: ['A) Gardens need water.', 'B) Councils debated funding.', 'C) Heatwaves are rare.', 'D) Neighbours rarely meet.'],
        evidence: 'councils debated funding',
      })),
      modelAnswers: ['A', 'B', 'C', 'D', 'A', 'B'].map((answer, i) => ({
        id: `q${i + 1}`,
        number: 31 + i,
        answer,
      })),
    };
    return validateGeneratedExamPart('b2', 5, g);
  },
  /maximum is 650/,
);

// TEST-P5-BAD-REFERENCE (HARD)
const badRefPassage = 'First paragraph discusses urban trees.\n\nSecond paragraph explains shade benefits.\n\nLast paragraph mentions birds returning in spring.';
const badRefIssue = checkPart5ReferenceIntegrity(
  badRefPassage,
  'What does the writer say in the last paragraph?',
  'urban trees along major roads for shade',
);
if (!badRefIssue) {
  console.error('FAIL TEST-P5-BAD-REFERENCE-helper: detector should flag wrong paragraph');
  process.exitCode = 1;
} else {
  console.log('PASS TEST-P5-BAD-REFERENCE-helper');
}
assertHardFail(
  'TEST-P5-BAD-REFERENCE',
  () => {
    const filler =
      'Researchers studied urban gardens and found that shared plots helped neighbours cooperate during heatwaves while councils debated funding. ';
    let passage = badRefPassage + '\n\n';
    while (countWords(passage) < 560) passage += filler;
    const g = {
      title: 'City Gardens',
      passage,
      questions: [
        {
          id: 'q1',
          number: 31,
          prompt: 'What does the writer say in the last paragraph?',
          questionType: 'detail',
          options: ['A) Birds return.', 'B) Shade helps.', 'C) Trees fail.', 'D) Councils debate.'],
          evidence: 'urban trees along major roads for shade',
        },
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `q${i + 2}`,
          number: 32 + i,
          prompt: `What point does the writer make in paragraph ${i + 2}?`,
          questionType: 'detail',
          options: ['A) Gardens need water.', 'B) Councils debated funding.', 'C) Heatwaves are rare.', 'D) Neighbours rarely meet.'],
          evidence: 'councils debated funding',
        })),
      ],
      modelAnswers: ['A', 'B', 'C', 'D', 'A', 'B'].map((answer, i) => ({
        id: `q${i + 1}`,
        number: 31 + i,
        answer,
      })),
    };
    return validateGeneratedExamPart('b2', 5, g);
  },
  /P5-BAD-REFERENCE|last paragraph/i,
);

// TEST-P5-WEAK-DISTRACTOR (QUALITY_FAIL not HARD)
const weakAnalysis = (() => {
  const filler =
    'Researchers studied urban gardens and found that shared plots helped neighbours cooperate during heatwaves while councils debated funding. ';
  let passage = '';
  while (passage.split(/\s+/).filter(Boolean).length < 580) passage += filler;
  const g = {
    title: 'City Gardens',
    passage,
    questions: Array.from({ length: 6 }, (_, i) => {
      const n = 31 + i;
      return {
        id: `q${i + 1}`,
        number: n,
        prompt:
          i === 0
            ? 'What does the writer suggest about community gardens?'
            : `What point does the writer make in paragraph ${i + 2}?`,
        questionType: i === 0 ? 'inference' : 'detail',
        options:
          i === 0
            ? ['A) They always fail.', 'B) Nobody uses them.', 'C) Everyone hates them.', 'D) They never work.']
            : ['A) Gardens need water.', 'B) Councils debated funding.', 'C) Heatwaves are rare.', 'D) Neighbours rarely meet.'],
        evidence: i === 0 ? 'shared plots helped neighbours cooperate' : 'councils debated funding',
      };
    }),
    modelAnswers: ['A', 'B', 'C', 'D', 'A', 'B'].map((answer, i) => ({
      id: `q${i + 1}`,
      number: 31 + i,
      answer,
    })),
  };
  return analyzePart5Quality(g);
})();
if (!weakAnalysis.qualityFails.some((m) => /P5-WEAK-DISTRACTOR/i.test(m))) {
  console.error('FAIL TEST-P5-WEAK-DISTRACTOR: expected qualityFails');
  process.exitCode = 1;
} else if (weakAnalysis.errors.some((m) => /P5-WEAK-DISTRACTOR/i.test(m))) {
  console.error('FAIL TEST-P5-WEAK-DISTRACTOR-severity: must not be HARD error');
  process.exitCode = 1;
} else {
  console.log('PASS TEST-P5-WEAK-DISTRACTOR');
}

// Positive P5: grounded distractors — no weak-distractor quality fail on Q1
const positiveP5 = (() => {
  const filler =
    'Researchers studied urban gardens and found that shared plots helped neighbours cooperate during heatwaves while councils debated funding. ';
  let passage = '';
  while (passage.split(/\s+/).filter(Boolean).length < 580) passage += filler;
  return {
    title: 'City Gardens',
    passage,
    questions: [
      {
        id: 'q1',
        number: 31,
        prompt: 'What does the writer suggest about community gardens?',
        questionType: 'inference',
        options: [
          'A) They replace all supermarkets.',
          'B) Shared plots helped neighbours cooperate.',
          'C) Councils debated funding loudly.',
          'D) Heatwaves made cooperation impossible.',
        ],
        evidence: 'shared plots helped neighbours cooperate',
      },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `q${i + 2}`,
        number: 32 + i,
        prompt: `What point does the writer make in paragraph ${i + 2}?`,
        questionType: 'detail',
        options: ['A) Gardens need water.', 'B) Councils debated funding.', 'C) Heatwaves are rare.', 'D) Neighbours rarely meet.'],
        evidence: 'councils debated funding',
      })),
    ],
    modelAnswers: ['B', 'B', 'C', 'D', 'A', 'B'].map((answer, i) => ({
      id: `q${i + 1}`,
      number: 31 + i,
      answer,
    })),
  };
})();
const positiveP5Analysis = analyzePart5Quality(positiveP5);
if (positiveP5Analysis.qualityFails.some((m) => /P5-WEAK-DISTRACTOR/i.test(m) && /question 31/i.test(m))) {
  console.error('FAIL POSITIVE-P5-GROUNDED: false positive weak distractor on Q31');
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P5-GROUNDED');
}

// TEST-EDQ-FILLER
assertQualityFail(
  'TEST-EDQ-FILLER',
  () => {
    const editorial = validateRuoeEditorialQuality(5, {
      title: 'Urban Trees',
      passage: `First paragraph explains how cities plant more trees along major roads for shade and cleaner air.

Second paragraph describes how residents notice cooler pavements and more birds in spring.

In conclusion, urban trees matter because they improve daily life and help neighbourhoods feel more pleasant.

In conclusion, urban trees matter because they improve daily life and help neighbourhoods feel more pleasant.`,
    });
    return {
      ok: editorial.qualityFails.length === 0,
      errors: editorial.hardFails,
      qualityFails: editorial.qualityFails,
      warnings: editorial.warnings,
    };
  },
  /TEST-EDQ-FILLER|filler|repeats/i,
);

// TEST-TITLE-LITERAL
assertQualityFail(
  'TEST-TITLE-LITERAL',
  () => {
    const editorial = validateRuoeEditorialQuality(6, {
      title: 'How birth order shapes personality',
      contentBriefWorkingTitle: 'How birth order shapes personality at home',
      passage: 'Body text about siblings and family dynamics over several paragraphs.',
    });
    return {
      ok: editorial.qualityFails.length === 0,
      errors: editorial.hardFails,
      qualityFails: editorial.qualityFails,
      warnings: editorial.warnings,
    };
  },
  /TEST-TITLE-LITERAL|literal paraphrase/i,
);

// P6 pool development fixtures (v1.1.2)
const longPoolOption =
  'A) This longer development sentence explains how neighbours began sharing tools after the council widened the riverside path, which made evening walks feel safer for families.';
const shortGenericPool = 'B) This is a change.';
const longPoolIssues = analyzePart6PoolDevelopment([longPoolOption]);
const shortPoolIssues = analyzePart6PoolDevelopment([shortGenericPool]);
if (longPoolIssues.length) {
  console.error('FAIL POSITIVE-P6-LONG-OPTION: valid long pool flagged');
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P6-LONG-OPTION');
}
if (!shortPoolIssues.some((i) => /P6-SHORT-OPTION|P6-GENERIC-OPTION/.test(i.rule_id))) {
  console.error('FAIL NEGATIVE-P6-SHORT-OPTION: short generic pool not flagged');
  process.exitCode = 1;
} else {
  console.log('PASS NEGATIVE-P6-SHORT-OPTION');
}

// TEST-P7-WORD-MATCH
assertQualityFail(
  'TEST-P7-WORD-MATCH',
  () => {
    const editorial = validateRuoeEditorialQuality(7, {
      sections: [
        { letter: 'A', text: 'I felt overwhelmed when the project deadline arrived without clear guidance from management.' },
        { letter: 'B', text: 'She prefers quiet routines and rarely discusses work stress with colleagues.' },
        { letter: 'C', text: 'They enjoy competitive sports and travel frequently for international tournaments.' },
        { letter: 'D', text: 'He values practical training and keeps detailed notes about every lesson.' },
      ],
      questions: [
        {
          number: 43,
          prompt: 'Who felt overwhelmed when the project deadline arrived without clear guidance?',
        },
      ],
    });
    return {
      ok: editorial.qualityFails.length === 0,
      errors: editorial.hardFails,
      qualityFails: editorial.qualityFails,
      warnings: editorial.warnings,
    };
  },
  /TEST-P7-WORD-MATCH|overlap heavily/i,
);

// POSITIVE-P7-PARAPHRASE (v1.1.2)
const paraphraseP7 = validateRuoeEditorialQuality(7, {
  sections: [
    {
      letter: 'A',
      text: 'I felt overwhelmed when the project deadline arrived without clear guidance from management.',
    },
    { letter: 'B', text: 'She prefers quiet routines and rarely discusses work stress with colleagues.' },
    { letter: 'C', text: 'They enjoy competitive sports and travel frequently for international tournaments.' },
    { letter: 'D', text: 'He values practical training and keeps detailed notes about every lesson.' },
  ],
  questions: [
    {
      number: 43,
      prompt: 'Who struggled with pressure because managers failed to offer timely direction?',
    },
  ],
});
if (paraphraseP7.qualityFails.some((m) => /TEST-P7-WORD-MATCH/i.test(m))) {
  console.error('FAIL POSITIVE-P7-PARAPHRASE: paraphrased question flagged');
  process.exitCode = 1;
} else {
  console.log('PASS POSITIVE-P7-PARAPHRASE');
}

// Positive utilities
const dupes = findPart6OptionsDuplicatedInPassage('Hello world test sentence here.', [
  'A) Hello world test sentence here.',
]);
if (!dupes.length) {
  console.error('FAIL positive duplicate detector');
  process.exitCode = 1;
} else {
  console.log('PASS positive duplicate detector');
}

if (!detectPart3StemForcing('The ADAPT (17) ___ (ADAPT) gap here.', 'ADAPT', 17)) {
  console.error('FAIL detectPart3StemForcing positive case');
  process.exitCode = 1;
} else {
  console.log('PASS detectPart3StemForcing');
}

if (derivePart3TransformationFamily('USE', 'useful') !== 'adjective') {
  console.error('FAIL derivePart3TransformationFamily');
  process.exitCode = 1;
} else {
  console.log('PASS derivePart3TransformationFamily');
}

const titleFamily = classifyTitlePatternFamily('When cities change');
if (titleFamily !== 'when_x') {
  console.error(`FAIL titlePatternFamily (got ${titleFamily})`);
  process.exitCode = 1;
} else {
  console.log('PASS titlePatternFamily');
}

const titledNorm = validateGeneratedExamPart('b2', 5, positiveP5).normalized;
if (!titledNorm.titlePatternFamily) {
  console.error('FAIL titlePatternFamily-metadata');
  process.exitCode = 1;
} else {
  console.log('PASS titlePatternFamily-metadata');
}

console.log('NOTE TEST-P1-AMBIGUOUS: enforced via validateB2Part1Quality (AI blind-solve), not mechanical-only tests.');
console.log('NOTE AI adversarial P3/5/6/7: ruoeAiAdversarialQuality.js — runtime only with OPENAI_API_KEY.');

if (process.exitCode) {
  console.error('Some RUOE quality upgrade v1.1.2 tests failed.');
  process.exit(process.exitCode);
} else {
  console.log('All RUOE quality upgrade v1.1.2 regression tests completed.');
}

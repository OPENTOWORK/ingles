/**
 * LOCAL Phase 4B stabilisation audit — REAL `evaluateCambridgeEssay` pipeline.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/test-writing-correction-integration.mjs
 *
 * - Enables DRALO_WRITING_CORRECTION_V2_ENABLED + DRALO_WRITING_CALIBRATION_ENABLED
 *   for this process only.
 * - 6 test cases x 3 full rounds through the real function (locally).
 * - Flag-gating unit checks (V2 off => legacy behaviour, no calibration).
 * - Unit checks for extractCefrLevel and resolveB2Readiness.
 * - Stability acceptance criteria across rounds.
 * - No commit/push/deploy. No Supabase. No UI changes.
 */

import { loadEnvLocal } from './load-env-local.mjs';
loadEnvLocal();
process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'true';
process.env.DRALO_WRITING_CALIBRATION_ENABLED = 'true';

const {
  evaluateCambridgeEssay,
  extractCefrLevel,
  resolveB2Readiness,
  countEssayWords,
  getCalibrationBlock,
  isWritingCorrectionV2Enabled,
  isWritingCalibrationEnabled,
} = await import('@/lib/cambridgeEssayFeedback');
const { WRITING_CALIBRATION_PACK } = await import('../src/lib/calibration/writingCalibrationPack.js');

const ROUNDS = 3;
const LEVEL_ORDER = ['A2', 'A2+', 'B1', 'B1+', 'low B2', 'B2', 'B2+', 'C1'];
const levelIndex = (l) => LEVEL_ORDER.indexOf(String(l || '').trim());
const FALLBACK_NOTE_MARKER = 'could not be shortened reliably';

// ---------------------------------------------------------------------------
// Unit checks
// ---------------------------------------------------------------------------
function runUnitChecks() {
  let failures = 0;
  console.log('CEFR EXTRACTION UNIT CHECKS');
  const cefrCases = [
    ['Level: B1+', 'B1+'],
    ['Level: B1', 'B1'],
    ['Level: B2', 'B2'],
    ['Estimated CEFR level: B2+', 'B2+'],
    ['Estimated CEFR level: low B2', 'low B2'],
    ['Level: A2+', 'A2+'],
    ['Level: B1+ The text communicates well.', 'B1+'],
    ['Level: B1/B1+. Mixed estimate.', 'B1'],
    ['No level here', null],
  ];
  for (const [input, expected] of cefrCases) {
    const got = extractCefrLevel(input);
    const ok = got === expected;
    if (!ok) failures += 1;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} "${input}" -> ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`);
  }

  console.log('READINESS LOGIC UNIT CHECKS');
  const readinessCases = [
    [{ cefr: 'B2', total: 14 }, 'b2-ready', true],
    [{ cefr: 'B2+', total: 12 }, 'b2-ready', true],
    [{ cefr: 'C1', total: 16 }, 'b2-ready', true],
    [{ cefr: 'low B2', total: 13 }, 'borderline', true],
    [{ cefr: 'B1+', total: 12 }, 'not-b2-ready', false],
    [{ cefr: 'B1', total: 14 }, 'not-b2-ready', false],
    [{ cefr: 'B2', total: 11 }, 'needs-improvement', false],
    [{ cefr: 'B1', total: 8 }, 'needs-improvement', false],
    [{ cefr: null, total: 15 }, 'score-pass-unverified', true],
  ];
  for (const [input, expectedKey, expectedPassed] of readinessCases) {
    const got = resolveB2Readiness(input);
    const ok = got.key === expectedKey && got.passed === expectedPassed;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? 'OK  ' : 'FAIL'} ${JSON.stringify(input)} -> ${got.key}/${got.passed} (expected ${expectedKey}/${expectedPassed})`,
    );
  }
  console.log(failures === 0 ? '  All unit checks passed.\n' : `  ${failures} unit check(s) FAILED.\n`);
  return failures === 0;
}

async function runFlagGatingChecks() {
  let failures = 0;
  console.log('FLAG GATING UNIT CHECKS (no API calls)');
  const dummy = { taskPack: 'Write an essay about technology.' };

  process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'false';
  process.env.DRALO_WRITING_CALIBRATION_ENABLED = 'true';
  const offOn = await getCalibrationBlock(dummy);
  const c1 = offOn === '' && !isWritingCorrectionV2Enabled() && !isWritingCalibrationEnabled();
  if (!c1) failures += 1;
  console.log(`  ${c1 ? 'OK  ' : 'FAIL'} V2 off + calibration on -> calibration BLOCKED (sub-flag never overrides V2)`);

  process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'true';
  process.env.DRALO_WRITING_CALIBRATION_ENABLED = 'false';
  const onOff = await getCalibrationBlock(dummy);
  const c2 = onOff === '' && isWritingCorrectionV2Enabled() && !isWritingCalibrationEnabled();
  if (!c2) failures += 1;
  console.log(`  ${c2 ? 'OK  ' : 'FAIL'} V2 on + calibration off -> V2 without pack`);

  process.env.DRALO_WRITING_CALIBRATION_ENABLED = 'true';
  const onOn = await getCalibrationBlock(dummy);
  const c3 = onOn.includes('MARKING CALIBRATION') && isWritingCalibrationEnabled();
  if (!c3) failures += 1;
  console.log(`  ${c3 ? 'OK  ' : 'FAIL'} V2 on + calibration on -> pack injected`);

  delete process.env.DRALO_WRITING_CORRECTION_V2_ENABLED;
  const c4 = !isWritingCorrectionV2Enabled() && !isWritingCalibrationEnabled();
  if (!c4) failures += 1;
  console.log(`  ${c4 ? 'OK  ' : 'FAIL'} V2 unset -> everything off by default`);

  process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'true';
  console.log(failures === 0 ? '  All flag gating checks passed.\n' : `  ${failures} flag check(s) FAILED.\n`);
  return failures === 0;
}

// ---------------------------------------------------------------------------
// Test samples (invented, separate from the pack)
// ---------------------------------------------------------------------------
const SAMPLES = [
  {
    name: 'Test 1 — Essay B1/B1+ (basic errors, decent structure)',
    short: 'T1 Essay B1',
    lengthIssue: null,
    expectedLevelRange: ['B1', 'B1+'],
    maxLanguageScore: 2,
    expectedReadiness: ['not-b2-ready', 'needs-improvement'],
    requiredCategoriesAny: ['articles', 'subject-verb agreement', 'spelling', 'grammar'],
    minCorrections: 3,
    taskPrompt:
      'Some people think that all teenagers should help with housework at home. Do you agree? Notes: 1) responsibility, 2) free time, 3) your own idea. Write 140-190 words.',
    essay: `Nowadays, there are many discussions about if the teenagers should help with the housework. In my opinion, I am agree with this idea, but it depends of the situation of each family.

Firstly, helping at home teach the teenagers to be more responsible. When they make the bed or cook simple meals, they learn abilities that they will need on the future, when they will live alone.

On the other hand, the teenagers have a lot of homeworks and exams, so they haven't much free time. If the parents give them too many taskes, they could feel stressed and his marks at school can get worst.

In addition, I think the parents should pay a little money to their childrens when they do extra jobs in the house. In this way, they also learn the value of the money.

In conclusion, I believe that help with the housework is a good thing for the teenagers, but the families have to find a balance between the tasks of the house and the studies.`,
  },
  {
    name: 'Test 2 — Essay low B2 (organised, connectors, occasional errors)',
    short: 'T2 Essay low B2',
    lengthIssue: null,
    expectedLevelRange: ['B1+', 'low B2', 'B2'],
    maxLanguageScore: 3,
    expectedReadiness: ['not-b2-ready', 'borderline', 'b2-ready'],
    requiredCategoriesAny: ['grammar', 'vocabulary', 'prepositions', 'verb tense'],
    minCorrections: 3,
    taskPrompt:
      'Many schools now offer online classes instead of traditional lessons. Is this a positive development? Notes: 1) flexibility, 2) contact with other students, 3) your own idea. Write 140-190 words.',
    essay: `In recent years, online classes have become a real alternative to traditional lessons, and many schools offer them as an option. Although this change has clear benefits, I believe it also brings some problems that we should not ignore.

To begin with, online learning gives students much more flexibility. They can organise his own timetable, watch the lessons again and study from any place. This is especially useful for students who live far from the school or have other responsibilities.

However, studying at home reduces the contact with other students. Working in groups, discussing ideas and even having lunch together are experiences that help young people to develop social skills. It is often think that technology can replace this, but in my view a video call is not the same.

Furthermore, not every student has a quiet room or a good connection, which can create unfair differences between them.

In conclusion, online classes are a positive development because of the flexibility they offer, but schools should combine them with face-to-face activities whenever it is possible.`,
  },
  {
    name: 'Test 3 — Email B1+ (friendly but too long)',
    short: 'T3 Long email',
    lengthIssue: 'long',
    expectedLevelRange: ['B1', 'B1+', 'low B2'],
    maxLanguageScore: 3,
    expectedReadiness: ['not-b2-ready', 'needs-improvement', 'borderline'],
    requiredCategoriesAny: ['verb tense', 'prepositions', 'word order', 'grammar'],
    minCorrections: 3,
    mustStayInformal: true,
    taskPrompt:
      'Your English-speaking friend Sam has written asking about visiting you in July for a local music festival: what is the festival like, what should they bring, and where will they sleep? Write your email in 140-190 words.',
    essay: `Hi Sam!

I'm very exciting that you want to come in july for the festival! It is been almost two years since we don't see each other, so this is a great new for me. I couldn't to believe it when I read your email.

The festival is amazing, is the most big music event of my region and it takes three days. Last year I didn't went because I was ill, but my friends sayed me that the atmosphere was incredible. There play groups of rock, pop and also traditional music, so I'm sure you will find something that you like. In the night there are concerts until very late, and on the day you can visit the food market, where they sell typical food of here. I recommend you to try everything!

About the things you should bring with you, don't forget sunglasses, a cap and comfortable shoes, because we will walk a lot of. Also bring a jacket because in the nights is a little cold sometimes. You don't need tent, you can sleep in my house, my mother is very happy to meet you. We have a free room since my brother went to the university.

Please tell me at what time arrives your plane and I will pick you up at the airport with the car of my father.

Bye!`,
  },
  {
    name: 'Test 4 — Solid B2 essay A (mostly accurate, minor errors)',
    short: 'T4 Solid B2 (A)',
    lengthIssue: null,
    expectedLevelRange: ['low B2', 'B2'],
    maxLanguageScore: 4,
    expectedReadiness: ['borderline', 'b2-ready'],
    requiredCategoriesAny: ['grammar', 'vocabulary', 'prepositions', 'verb tense', 'cohesion'],
    minCorrections: 2,
    taskPrompt:
      'Some companies now allow employees to work from home several days a week. Is this a positive development? Notes: 1) productivity, 2) work-life balance, 3) your own idea. Write 140-190 words.',
    essay: `Over the last few years, working from home has changed from being an unusual privilege to a normal part of professional life. In my opinion, this is a largely positive development, although it needs to be managed carefully.

Firstly, many employees are more productive at home because they avoid long commutes and constant interruptions. Having the possibility to choose where to work allows people to organise their day around their most productive hours.

Secondly, remote work clearly improves work-life balance. Parents can spend more time with their children, and workers in general have more freedom to do exercise or follow personal interests. Comparing with the past, this flexibility was simply unthinkable for most employees.

However, spending every day at home can lead to isolation, and some people find difficult to separate their job from their private life. For this reason, I would argue that a hybrid model is the most sensible option.

In conclusion, working from home benefits both companies and employees, as long as it is combined with regular face-to-face contact.`,
  },
  {
    name: 'Test 5 — Too short answer (under 120 words)',
    short: 'T5 Too short',
    lengthIssue: 'short',
    expectedLevelRange: ['A2+', 'B1', 'B1+'],
    maxLanguageScore: 3,
    expectedReadiness: ['not-b2-ready', 'needs-improvement'],
    requiredCategoriesAny: ['grammar', 'articles', 'vocabulary', 'task response'],
    minCorrections: 3,
    taskPrompt:
      'Some people say young people today do not do enough sport. Do you agree? Notes: 1) school, 2) technology, 3) your own idea. Write 140-190 words.',
    essay: `Nowadays many young people don't do enough sport, and I think this is true. In the school, students have only two hours of sport in a week, and this is not sufficient for be healthy.

Also, the technology is a problem. Many teenagers prefer to stay in the sofa watching videos or playing with the phone instead of go outside.

In my opinion, the parents should motivate his children to practise some sport, for example football or swimming.

In conclusion, I agree that young people don't do enough sport and we have to change this situation.`,
  },
  {
    name: 'Test 6 — Solid B2 essay B (stronger: accurate, wide range, 2 subtle slips)',
    short: 'T6 Solid B2 (B)',
    lengthIssue: null,
    expectedLevelRange: ['low B2', 'B2'],
    maxLanguageScore: 4,
    expectedReadiness: ['borderline', 'b2-ready'],
    requiredCategoriesAny: ['grammar', 'vocabulary'],
    minCorrections: 2,
    taskPrompt:
      'Some cities are considering making public transport free for everyone. Is this a good idea? Notes: 1) the environment, 2) cost, 3) your own idea. Write 140-190 words.',
    essay: `Whether public transport should be free for everyone has become a popular topic of debate in many cities. In my view, making buses and trains free would bring important benefits, although it also involves serious challenges.

The strongest argument in favour is environmental. If public transport were free, many drivers would leave their cars at home, which would reduce traffic jams and air pollution in city centres. Moreover, free transport would help people on low incomes, who often spend a significant part of their salary simply travelling to work.

On the other hand, quality matters as much as price. If the amount of commuters increased suddenly, buses and trains could become overcrowded, and the service might get worse unless governments invested in more vehicles and staff. There is also the question of funding, since someone has to pay for the system, usually through higher taxes.

In conclusion, I believe free public transport is a goal worth pursuing, but only if it is introduced gradually and accompanied by real investment. Otherwise, we risk having less cars but also a worse service.`,
  },
];

// Frases distintivas del pack para detectar fugas en el feedback.
const PACK_LEAK_SNIPPETS = WRITING_CALIBRATION_PACK.flatMap((ex) => [
  ex.studentText.split(/\s+/).slice(0, 6).join(' ').toLowerCase(),
  ...ex.commonMistakes.slice(0, 2).map((m) => m.split('→')[0].trim().toLowerCase()),
]).filter((s) => s.length > 8);

const C1_MARKERS = [
  'notwithstanding',
  'albeit',
  'whilst',
  'hitherto',
  'henceforth',
  'it is worth noting that',
  'a plethora of',
  'myriad of',
];

function extractSection(text, startEmoji, endEmoji) {
  const s = String(text || '');
  const start = s.indexOf(startEmoji);
  if (start === -1) return '';
  const end = endEmoji ? s.indexOf(endEmoji, start + 1) : -1;
  return (end === -1 ? s.slice(start) : s.slice(start, end)).trim();
}

function extractCorrections(text) {
  const originals = String(text || '').match(/^Original:/gm) || [];
  const types = [...String(text || '').matchAll(/^Type:\s*(.+)$/gm)].map((m) => m[1].trim().toLowerCase());
  return { count: originals.length, categories: [...new Set(types)] };
}

function audit(sample, result) {
  const signals = [];
  const flags = [];
  const { scores, feedback } = result;
  const idx = levelIndex(scores.cefr);
  const maxIdx = Math.max(...sample.expectedLevelRange.map(levelIndex));
  const minIdx = Math.min(...sample.expectedLevelRange.map(levelIndex));
  const corrections = extractCorrections(feedback);
  const improved = extractSection(feedback, '📈', '🚀');
  const improvedBody = improved.replace(/^📈[^\n]*\n?/, '');
  const fallbackNote = improvedBody.includes(FALLBACK_NOTE_MARKER);
  const improvedWc = fallbackNote ? null : countEssayWords(improvedBody);
  const studyPlan = extractSection(feedback, '📚');
  const problems = extractSection(feedback, '🎯', '✏️');

  if (idx === -1) signals.push('REJECT: no parseable CEFR level.');
  if (idx > maxIdx) signals.push(`REJECT: level inflation — ${scores.cefr}, expected max ${sample.expectedLevelRange.at(-1)}.`);
  if (idx !== -1 && idx < minIdx - 1) signals.push(`REJECT: level dropped too much (${scores.cefr}).`);
  if ((scores.language ?? 0) > sample.maxLanguageScore) {
    signals.push(`REJECT: Language ${scores.language}/5 above expected max ${sample.maxLanguageScore}/5.`);
  }
  if (!sample.expectedReadiness.includes(scores.readiness?.key)) {
    signals.push(`REJECT: readiness "${scores.readiness?.key}" not in expected [${sample.expectedReadiness.join(', ')}].`);
  }
  // Coherencia: la línea final mostrada debe coincidir con el readiness calculado.
  const lastLine = feedback.trim().split('\n').map((l) => l.trim()).filter(Boolean).at(-1) || '';
  const lineMatchesReadiness =
    (scores.readiness?.key === 'b2-ready' && lastLine.startsWith('✅')) ||
    (scores.readiness?.key === 'borderline' && lastLine.startsWith('🟡')) ||
    (['not-b2-ready', 'needs-improvement'].includes(scores.readiness?.key) && lastLine.startsWith('❌')) ||
    (scores.readiness?.key === 'score-pass-unverified' && lastLine.startsWith('✅'));
  if (!lineMatchesReadiness) {
    signals.push(`REJECT: final readiness line ("${lastLine}") inconsistent with computed readiness "${scores.readiness?.key}".`);
  }
  const essayLower = sample.essay.toLowerCase();
  const fbLower = feedback.toLowerCase();
  const leak = PACK_LEAK_SNIPPETS.filter((s) => !essayLower.includes(s)).find((s) => fbLower.includes(s));
  if (leak) signals.push(`REJECT: possible Calibration Pack leak ("${leak}").`);
  const c1 = C1_MARKERS.find((m) => improved.toLowerCase().includes(m));
  if (c1) signals.push(`REJECT: improved version too advanced (C1 marker: "${c1}").`);
  if (corrections.count < sample.minCorrections) {
    signals.push(`REJECT: fewer than ${sample.minCorrections} corrections (${corrections.count}).`);
  }
  if (!sample.requiredCategoriesAny.some((c) => corrections.categories.includes(c))) {
    signals.push(`REJECT: expected error categories missing (${sample.requiredCategoriesAny.join(', ')}).`);
  }
  if (countEssayWords(feedback) > 1200) signals.push('REJECT: feedback too long.');

  let wcDetected = null;
  if (sample.lengthIssue === 'long') {
    wcDetected = /(too long|word|length|concis|limit)/.test(problems.toLowerCase());
    if (!wcDetected) signals.push('REJECT: word count not raised in Main problems.');
    if (!/(concis|word (limit|count)|length|plan|shorter)/i.test(studyPlan)) {
      signals.push('REJECT: study plan does not address concision/word limit.');
    }
    // Acceptance criteria: NUNCA entregar improved version > 190 al alumno.
    if (improvedWc !== null && improvedWc > 190) {
      signals.push(`REJECT: improved version over 190 words (${improvedWc}) DELIVERED to student.`);
    }
    if (fallbackNote) {
      flags.push('FLAG: shortening failed twice — safe fallback note delivered instead of improved version.');
    }
  }
  if (sample.lengthIssue === 'short') {
    wcDetected = /(too short|under|short|word|length|develop)/.test(problems.toLowerCase() + fbLower.slice(0, 600));
    if (!wcDetected) signals.push('REJECT: underlength not mentioned.');
    if (!/(plan|develop|expand|length|word)/i.test(studyPlan)) {
      signals.push('REJECT: study plan does not address planning/development.');
    }
    if (scores.readiness?.passed) signals.push('REJECT: too-short answer marked as pass/B2-ready.');
  }
  if (sample.mustStayInformal && improved && !fallbackNote && !(/hi /i.test(improved.slice(0, 140)) || improved.includes("'"))) {
    signals.push('REJECT: improved version lost the informal register.');
  }

  return { signals, flags, corrections, improvedWc, fallbackNote, wcDetected };
}

function hr(c = '=') {
  return c.repeat(72);
}

async function runSample(sample) {
  return evaluateCambridgeEssay({
    essay: sample.essay,
    level: 'b2',
    taskContext: { partLabel: 'B2 Writing', instructions: sample.taskPrompt },
    wordMin: 140,
    wordMax: 190,
  });
}

async function main() {
  const unitOk = runUnitChecks();
  const flagsOk = await runFlagGatingChecks();

  /** results[sampleIdx] = array of per-round entries */
  const results = SAMPLES.map(() => []);

  for (let round = 1; round <= ROUNDS; round += 1) {
    console.log(`\n${hr('#')}\nROUND ${round}/${ROUNDS}\n${hr('#')}`);
    for (let i = 0; i < SAMPLES.length; i += 1) {
      const sample = SAMPLES[i];
      console.log(`\n${hr()}\n[R${round}] ${sample.name}\n${hr()}`);
      const result = await runSample(sample);
      if (!result.ok) {
        console.log(`API FAILURE: ${result.error}`);
        results[i].push({ failed: true });
        continue;
      }
      if (round === 1) console.log(`\nFEEDBACK:\n${result.feedback}`);
      const a = audit(sample, result);
      const s = result.scores;
      console.log(
        `RESULT: ${s.cefr ?? '—'} · C${s.content} CA${s.communication} O${s.organisation} L${s.language} = ${s.total}/20 · ${s.readiness.key} · improved ${a.fallbackNote ? 'NOTE' : `${a.improvedWc}w`} · corr ${a.corrections.count}`,
      );
      console.log(`AUDIT: ${a.signals.length === 0 ? 'APPROVED' : 'NOT APPROVED'}`);
      for (const sig of a.signals) console.log(`  - ${sig}`);
      for (const f of a.flags) console.log(`  - ${f}`);
      results[i].push({ scores: s, ...a });
    }
  }

  // Legacy sanity: V2 OFF debe conservar el comportamiento actual de producción.
  console.log(`\n${hr()}\nLEGACY SANITY (V2 OFF — current production behaviour)\n${hr()}`);
  process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'false';
  const legacy = await runSample(SAMPLES[4]);
  let legacyOk = false;
  if (legacy.ok) {
    const s = legacy.scores;
    const legacyPassSemantics = s.passed === (s.total >= 12);
    const noV2Fields = s.readiness === undefined && s.improvedVersion === undefined;
    legacyOk = legacyPassSemantics && noV2Fields;
    console.log(`  passed === (total>=12): ${legacyPassSemantics} (total ${s.total}, passed ${s.passed})`);
    console.log(`  no V2 fields in scores (readiness/improvedVersion): ${noV2Fields}`);
    console.log(`  legacy final line present: ${/(Pass — B2 standard met|Not yet at pass level)/.test(legacy.feedback)}`);
    console.log(`  ${legacyOk ? 'OK — legacy behaviour preserved with V2 off.' : 'FAIL — V2 off does NOT match legacy behaviour.'}`);
  } else {
    console.log(`  FAILED: ${legacy.error}`);
  }
  process.env.DRALO_WRITING_CORRECTION_V2_ENABLED = 'true';

  // -------------------------------------------------------------------------
  // Stability report
  // -------------------------------------------------------------------------
  console.log(`\n${hr()}\nSTABILITY TABLE (${ROUNDS} rounds)\n${hr()}`);
  for (let i = 0; i < SAMPLES.length; i += 1) {
    const sample = SAMPLES[i];
    console.log(`\n${sample.name}`);
    results[i].forEach((r, ri) => {
      if (r.failed) {
        console.log(`  R${ri + 1}: API FAILURE`);
        return;
      }
      const s = r.scores;
      console.log(
        `  R${ri + 1}: ${s.cefr ?? '—'} · total ${s.total}/20 · L${s.language} · ${s.readiness.key} · wc-issue ${r.wcDetected === null ? 'n/a' : r.wcDetected ? 'detected' : 'MISSED'} · improved ${r.fallbackNote ? 'NOTE' : `${r.improvedWc}w`} · corr ${r.corrections.count} · ${r.signals.length === 0 ? 'APPROVED' : `NOT APPROVED (${r.signals.length})`}`,
      );
    });
  }

  console.log(`\n${hr()}\nACCEPTANCE CRITERIA\n${hr()}`);
  const ok = (rows, fn) => rows.every((r) => !r.failed && fn(r));
  const criteria = [];

  const b1Rows = [...results[0], ...results[4]];
  criteria.push(['B1 texts never B2-ready', ok(b1Rows, (r) => r.scores.readiness.key !== 'b2-ready')]);
  criteria.push(['B1 texts never Language >= 4', ok(b1Rows, (r) => r.scores.language < 4)]);
  criteria.push([
    'Low B2 text within {B1+, low B2, B2}, never B2+',
    ok(results[1], (r) => ['B1+', 'low B2', 'B2'].includes(r.scores.cefr)),
  ]);
  criteria.push([`Long email: word count detected ${ROUNDS}/${ROUNDS}`, ok(results[2], (r) => r.wcDetected === true)]);
  criteria.push([
    `Long email: improved <= 190 (or safe note) ${ROUNDS}/${ROUNDS}`,
    ok(results[2], (r) => r.fallbackNote || (r.improvedWc !== null && r.improvedWc <= 190)),
  ]);
  criteria.push(['Long email: never B2-ready', ok(results[2], (r) => r.scores.readiness.key !== 'b2-ready')]);
  criteria.push([`Too short: underlength detected ${ROUNDS}/${ROUNDS}`, ok(results[4], (r) => r.wcDetected === true)]);
  criteria.push(['Too short: never B2-ready', ok(results[4], (r) => r.scores.readiness.key !== 'b2-ready')]);

  const t4Ready = results[3].filter((r) => !r.failed && r.scores.readiness.key === 'b2-ready').length;
  const t6Ready = results[5].filter((r) => !r.failed && r.scores.readiness.key === 'b2-ready').length;
  const solidStable = t4Ready >= 2 || t6Ready >= 2;
  criteria.push([
    `At least one solid B2 sample stably B2-ready (T4: ${t4Ready}/${ROUNDS}, T6: ${t6Ready}/${ROUNDS})`,
    solidStable,
  ]);
  if (!solidStable) {
    console.log('  NOTE: if both solid B2 samples never reach b2-ready, the system may be marking too harshly.');
  }

  let criteriaFailures = 0;
  for (const [label, passed] of criteria) {
    if (!passed) criteriaFailures += 1;
    console.log(`  ${passed ? 'PASS' : 'FAIL'} ${label}`);
  }

  const allRuns = results.flat();
  const rejected = allRuns.filter((r) => r.failed || r.signals?.length).length;
  const flagged = allRuns.filter((r) => r.flags?.length).length;

  console.log(`\n${hr()}\nOVERALL\n${hr()}`);
  console.log(`Unit checks: ${unitOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Flag gating checks: ${flagsOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Legacy (V2 off) sanity: ${legacyOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Runs with REJECT signals: ${rejected}/${allRuns.length} · runs with FLAGs: ${flagged}/${allRuns.length}`);
  console.log(`Acceptance criteria failures: ${criteriaFailures}/${criteria.length}`);
  console.log(
    `VERDICT: ${
      unitOk && flagsOk && legacyOk && rejected === 0 && criteriaFailures === 0
        ? 'ALL CHECKS PASSED'
        : 'NOT APPROVED — see failures above'
    }`,
  );
}

main().catch((err) => {
  console.error('FAILED:', err?.message || err);
  process.exit(1);
});

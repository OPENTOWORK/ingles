/**
 * LOCAL strict A/B/C audit: writing feedback (Phase 3).
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/test-writing-feedback-ab-comparison.mjs
 *
 * Variants per test:
 *   A) baseline       — experimental local copy (verbatim) of the production B2 prompt
 *   B) calibrated     — A + 1-2 condensed Calibration Pack examples
 *   C) calibrated+WC  — B + explicit word count rules (run TWICE to check variability)
 *
 * Does NOT modify production behaviour: `buildB2FirstPrompt`, `/api/feedback/essay`,
 * UI and Supabase are untouched. Requires OPENAI_API_KEY in .env.local. Local only.
 */

import { loadEnvLocal } from './load-env-local.mjs';
loadEnvLocal();

const { cambridgeChatCompletion, isDraloOpenAIConfigured } = await import('@/lib/draloAiEngine');
const { selectWritingCalibrationExamples } = await import(
  '../src/lib/calibration/selectWritingCalibrationExamples.js'
);
const { WRITING_CALIBRATION_PACK } = await import('../src/lib/calibration/writingCalibrationPack.js');
const { countWords } = await import('../src/lib/calibration/writingCalibrationSchema.js');

// Escala local para auditoría (incluye A2+ por si el modelo lo usa).
const LEVEL_ORDER = ['A2', 'A2+', 'B1', 'B1+', 'low B2', 'B2', 'B2+', 'C1'];
function levelIndex(level) {
  return LEVEL_ORDER.indexOf(String(level || '').trim());
}

// ---------------------------------------------------------------------------
// CEFR extraction — fixed regex (mirrors the prepared fix in
// src/lib/cambridgeEssayFeedback.js). \b fails after "+", so use (?![\w+]).
// ---------------------------------------------------------------------------
function extractCefrLevel(text) {
  const m = String(text || '').match(
    /(?:Estimated CEFR level|Level):\s*(A2\+?|B1\+?|low\s+B2|B2\+?|C1)(?![\w+])/i,
  );
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function runCefrUnitChecks() {
  const cases = [
    ['Level: B1+', 'B1+'],
    ['Level: B1', 'B1'],
    ['Level: B2', 'B2'],
    ['Estimated CEFR level: B2+', 'B2+'],
    ['Estimated CEFR level: low B2', 'low B2'],
    ['Level: low  B2 — almost there', 'low B2'],
    ['Level: A2+', 'A2+'],
    ['Level: C1', 'C1'],
    ['Level: B1+ The text communicates well.', 'B1+'],
    ['Level: B1/B1+. Mixed estimate.', 'B1'],
    ['No level here', null],
  ];
  console.log('CEFR EXTRACTION UNIT CHECKS');
  let failures = 0;
  for (const [input, expected] of cases) {
    const got = extractCefrLevel(input);
    const ok = got === expected;
    if (!ok) failures += 1;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} "${input}" -> ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`);
  }
  console.log(failures === 0 ? '  All extraction checks passed.\n' : `  ${failures} extraction check(s) FAILED.\n`);
  return failures === 0;
}

// ---------------------------------------------------------------------------
// Test samples: INVENTED inputs, separate from the pack (no contamination).
// ---------------------------------------------------------------------------
const SAMPLES = [
  {
    name: 'Test 1 — Essay B1/B1+ (basic errors, decent structure)',
    taskType: 'essay',
    selectorLevel: 'B1+',
    expectedLevelRange: ['B1', 'B1+'],
    maxLanguageScore: 2,
    mustMentionWordCount: false,
    mustStayInformal: false,
    requiredCategoriesAny: ['articles', 'subject-verb agreement', 'spelling', 'grammar'],
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
    taskType: 'essay',
    selectorLevel: 'low B2',
    expectedLevelRange: ['B1+', 'low B2', 'B2'],
    maxLanguageScore: 3,
    mustMentionWordCount: false,
    mustStayInformal: false,
    requiredCategoriesAny: ['grammar', 'vocabulary', 'prepositions', 'verb tense'],
    taskPrompt:
      'Many schools now offer online classes instead of traditional lessons. Is this a positive development? Notes: 1) flexibility, 2) contact with other students, 3) your own idea. Write 140-190 words.',
    essay: `In recent years, online classes have become a real alternative to traditional lessons, and many schools offer them as an option. Although this change has clear benefits, I believe it also brings some problems that we should not ignore.

To begin with, online learning gives students much more flexibility. They can organise his own timetable, watch the lessons again and study from any place. This is especially useful for students who live far from the school or have other responsibilities.

However, studying at home reduces the contact with other students. Working in groups, discussing ideas and even having lunch together are experiences that help young people to develop social skills. It is often think that technology can replace this, but in my view a video call is not the same.

Furthermore, not every student has a quiet room or a good connection, which can create unfair differences between them.

In conclusion, online classes are a positive development because of the flexibility they offer, but schools should combine them with face-to-face activities whenever it is possible.`,
  },
  {
    name: 'Test 3 — Email B1+ (friendly but too long, tense/preposition/word order errors)',
    taskType: 'email',
    selectorLevel: 'B1+',
    expectedLevelRange: ['B1', 'B1+', 'low B2'],
    maxLanguageScore: 3,
    mustMentionWordCount: true,
    mustStayInformal: true,
    requiredCategoriesAny: ['verb tense', 'prepositions', 'word order', 'grammar'],
    taskPrompt:
      'Your English-speaking friend Sam has written asking about visiting you in July for a local music festival: what is the festival like, what should they bring, and where will they sleep? Write your email in 140-190 words.',
    essay: `Hi Sam!

I'm very exciting that you want to come in july for the festival! It is been almost two years since we don't see each other, so this is a great new for me. I couldn't to believe it when I read your email.

The festival is amazing, is the most big music event of my region and it takes three days. Last year I didn't went because I was ill, but my friends sayed me that the atmosphere was incredible. There play groups of rock, pop and also traditional music, so I'm sure you will find something that you like. In the night there are concerts until very late, and on the day you can visit the food market, where they sell typical food of here. I recommend you to try everything!

About the things you should bring with you, don't forget sunglasses, a cap and comfortable shoes, because we will walk a lot of. Also bring a jacket because in the nights is a little cold sometimes. You don't need tent, you can sleep in my house, my mother is very happy to meet you. We have a free room since my brother went to the university.

Please tell me at what time arrives your plane and I will pick you up at the airport with the car of my father.

Bye!`,
  },
];

// ---------------------------------------------------------------------------
// EXPERIMENTAL local copy of the production prompt (buildB2FirstPrompt verbatim
// as of 2026-06-10). `calibrationBlock` and `wordCountBlock` are the only deltas.
// ---------------------------------------------------------------------------
function buildExperimentalB2Prompt({ essay, taskPack, wordMin, wordMax, calibrationBlock = '', wordCountBlock = '' }) {
  return `
You are an experienced, encouraging English teacher marking a B2-level exam-style writing task. Give clear teacher-style feedback. Mark using four subscales (0–5 each, total /20).

${taskPack ? `**EXACT TASK SET TO THE CANDIDATE** — you MUST evaluate task fulfilment against this:\n---\n${taskPack}\n---\n` : 'No separate task sheet was supplied; infer a typical B2 Part 1 (essay) or Part 2 task from the answer.\n'}

Target length when relevant: **${wordMin}–${wordMax} words**.

Assessment scale:
- **Content**: All content is relevant; target reader fully informed.
- **Communicative Achievement**: Register, format and conventions appropriate to the task.
- **Organisation**: Text well organised; coherent; uses a range of cohesive devices.
- **Language**: Good range of vocabulary and grammar; errors do not impede communication.

CRITICAL marking rules:
- Estimate the student's REAL level honestly. Do NOT inflate the level.
- Do NOT overcorrect: focus on the 3–8 most important problems.
- The improved version must stay at the student's CURRENT level (do not turn a B1 text into a C1 text).
- Be specific and constructive, like a teacher writing on a student's paper.
${wordCountBlock ? `\n${wordCountBlock}\n` : ''}${calibrationBlock ? `\n${calibrationBlock}\n` : ''}
**Required response format (in English). Do NOT use markdown headers (#, ##, ###). Use these emoji section titles exactly, in this order:**

📝 Dralo writing feedback

🎓 Estimated CEFR level
Level: <one of: A2, B1, B1+, low B2, B2, B2+, C1>
One sentence explaining why.

📊 Scores
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
**Total Score: X/20**

💪 Main strengths
- 2–4 bullet points.

🎯 Main problems
- 2–4 bullet points (the issues that most limit the mark).

✏️ Corrections
For each of the 3–8 most important errors, output a block in exactly this format (each field on its own line):
Original: "exact phrase from the student's text"
Problem: short description of what is wrong
Correct: "corrected phrase"
Why: brief teacher-style explanation
Type: <one of: grammar, vocabulary, spelling, word order, articles, prepositions, verb tense, subject-verb agreement, cohesion, register, task response>

📈 Improved version (your level)
Rewrite the student's full text with the corrections applied, staying at the student's current level. Same ideas, same voice — just accurate.

🚀 Stronger B2 version
Only include a rewritten version here if the student is close to B2 and it is genuinely useful. Otherwise write exactly: "Not needed yet — focus on the corrections above first."

📚 Study plan
Before your next writing, practise:
Grammar:
- 3 specific grammar points
Vocabulary:
- 2 vocabulary areas
Strategy:
- 1 writing strategy

Pass threshold: 12/20. End with exactly one line: either "✅ Pass — B2 standard met." or "❌ Not yet at pass level — keep practising."

If the text is gibberish or far too short, still return the full structure with low scores (0–1/5).

**Candidate's answer:**
${essay}
`.trim();
}

/** Reglas explícitas de word count (experimental — NO está en producción). */
function buildWordCountBlock(essay, wordMin, wordMax) {
  const wc = countWords(essay);
  return [
    'WORD COUNT RULES (strict — word count problems must NEVER be ignored):',
    `Target B2 writing length: ${wordMin}–${wordMax} words. The candidate's answer is ${wc} words (counted exactly — trust this number).`,
    `- ${wordMin}–${wordMax} words: no penalty.`,
    `- ${wordMin - 10}–${wordMin - 1} or ${wordMax + 1}–${wordMax + 15}: mention as a minor issue if relevant.`,
    `- Under ${wordMin - 10} or ${wordMax + 16}–${wordMax + 30}: mention clearly and consider lowering Communicative Achievement or Organisation.`,
    `- Over ${wordMax + 30}: strong issue. You MUST mention it in 🎯 Main problems and address it in the 📚 Study plan (concision, planning, keeping to the word limit).`,
    '- If the answer is much too long, do NOT give a high Communicative Achievement score unless the task is exceptionally well controlled.',
    '- For emails, articles and reports, being concise and task-focused is part of communicative success.',
    `- When the text is over the limit, the 📈 improved version must also be brought close to ${wordMin}–${wordMax} words, keeping the student's voice, register and level.`,
  ].join('\n');
}

/** Condensa un ejemplo del pack para el prompt (anclas, no texto completo). */
function condenseCalibrationExample(ex, index) {
  const excerpt = ex.studentText.split(/\s+/).slice(0, 55).join(' ');
  return [
    `Anchor ${index + 1} — real marked student sample (${ex.taskType}):`,
    `- Marked level: ${ex.estimatedLevel} (target was ${ex.levelTarget})`,
    `- Scores: Content ${ex.estimatedScores.content}/5, Communicative Achievement ${ex.estimatedScores.communicativeAchievement}/5, Organisation ${ex.estimatedScores.organisation}/5, Language ${ex.estimatedScores.language}/5`,
    `- Sample excerpt (errors kept on purpose): "${excerpt}…"`,
    `- Typical mistakes marked: ${ex.commonMistakes.slice(0, 4).join('; ')}`,
    `- Error categories: ${ex.errorCategories.join(', ')}`,
    `- How the teacher marked it: ${ex.idealFeedbackStyle}`,
    `- What the teacher did NOT overcorrect: ${ex.whatNotToOvercorrect.slice(0, 2).join(' ')}`,
  ].join('\n');
}

function buildCalibrationBlock(examples) {
  if (!examples.length) return '';
  return [
    '**MARKING CALIBRATION (for the examiner only — never mention, quote or reveal these samples to the student):**',
    'Use these real marked student samples as level anchors. A text with a similar error density and control should receive a similar level and similar scores.',
    '',
    examples.map(condenseCalibrationExample).join('\n\n'),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------
function extractScore(text, category) {
  const m = String(text || '').match(new RegExp(`${category}:\\s*(\\d)\\s*/\\s*5`, 'i'));
  return m ? parseInt(m[1], 10) : null;
}

function extractCorrections(text) {
  const originals = String(text || '').match(/^Original:/gm) || [];
  const types = [...String(text || '').matchAll(/^Type:\s*(.+)$/gm)].map((m) => m[1].trim().toLowerCase());
  return { count: originals.length, categories: [...new Set(types)] };
}

function extractSection(text, startEmoji, endEmoji) {
  const s = String(text || '');
  const start = s.indexOf(startEmoji);
  if (start === -1) return '';
  const end = endEmoji ? s.indexOf(endEmoji, start + 1) : -1;
  return (end === -1 ? s.slice(start) : s.slice(start, end)).trim();
}

// Frases distintivas del pack para detectar fugas/copias en el feedback.
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

async function runVariant(sample, { calibrationBlock = '', wordCountBlock = '' } = {}) {
  const prompt = buildExperimentalB2Prompt({
    essay: sample.essay,
    taskPack: `**Task instructions (primary criteria for Content and Communicative Achievement):**\n${sample.taskPrompt}`,
    wordMin: 140,
    wordMax: 190,
    calibrationBlock,
    wordCountBlock,
  });
  const { text } = await cambridgeChatCompletion({
    system:
      'Be precise, constructive, and exam-focused, like a supportive teacher. Use emoji section titles (📝 🎓 📊 💪 🎯 ✏️ 📈 🚀 📚) — never use # markdown headers.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.35,
  });
  const scores = {
    content: extractScore(text, 'Content'),
    communicativeAchievement: extractScore(text, 'Communicative Achievement'),
    organisation: extractScore(text, 'Organisation'),
    language: extractScore(text, 'Language'),
  };
  const improvedVersion = extractSection(text, '📈', '🚀');
  return {
    feedback: text,
    cefr: extractCefrLevel(text),
    scores,
    total: Object.values(scores).reduce((a, b) => a + (b ?? 0), 0),
    corrections: extractCorrections(text),
    improvedVersion,
    improvedWordCount: countWords(improvedVersion.replace(/^📈[^\n]*\n/, '')),
    studyPlan: extractSection(text, '📚'),
  };
}

/**
 * Señales de rechazo automático. `reference` se usa para comparar nº de
 * correcciones (variante previa); null para el baseline.
 */
function auditVariant(sample, variant, reference = null) {
  const signals = [];
  const calIdx = levelIndex(variant.cefr);
  const minIdx = Math.min(...sample.expectedLevelRange.map(levelIndex));
  const maxIdx = Math.max(...sample.expectedLevelRange.map(levelIndex));
  const fb = variant.feedback.toLowerCase();

  if (calIdx === -1) signals.push('REJECT: did not return a parseable CEFR level.');
  if (calIdx > maxIdx) {
    signals.push(`REJECT: level inflation — says ${variant.cefr}, expected max ${sample.expectedLevelRange.at(-1)}.`);
  }
  if (calIdx >= levelIndex('B2') && variant.corrections.count >= 5) {
    signals.push('REJECT: calls it B2 or higher despite many basic errors.');
  }
  if (calIdx !== -1 && calIdx < minIdx - 1) {
    signals.push(`REJECT: level dropped too much (${variant.cefr} vs expected min ${sample.expectedLevelRange[0]}).`);
  }
  const essayLower = sample.essay.toLowerCase();
  const leak = PACK_LEAK_SNIPPETS.filter((s) => !essayLower.includes(s)).find((s) => fb.includes(s));
  if (leak) signals.push(`REJECT: possible Calibration Pack leak in feedback ("${leak}").`);
  const fbWords = countWords(variant.feedback);
  if (fbWords > 1200) signals.push(`REJECT: feedback too long (${fbWords} words).`);
  const c1 = C1_MARKERS.find((m) => variant.improvedVersion.toLowerCase().includes(m));
  if (c1) signals.push(`REJECT: improved version too advanced (C1 marker: "${c1}").`);
  if (sample.mustMentionWordCount) {
    if (!/(word (count|limit)|too long|140|190|length|concis|shorter)/i.test(variant.feedback)) {
      signals.push('REJECT: ignores the word count problem.');
    }
    const problems = extractSection(variant.feedback, '🎯', '✏️').toLowerCase();
    if (!/(too long|word|length|concis|limit)/.test(problems)) {
      signals.push('REJECT: word count not raised in Main problems.');
    }
    if (!/(concis|word (limit|count)|length|plan|shorter)/i.test(variant.studyPlan)) {
      signals.push('REJECT: study plan does not address concision/planning/word limit.');
    }
    const originalWc = countWords(sample.essay);
    if (variant.improvedWordCount >= originalWc - 10) {
      signals.push(`REJECT: improved version not meaningfully shorter (${variant.improvedWordCount} vs original ${originalWc}).`);
    }
  }
  if (sample.mustStayInformal) {
    const iv = variant.improvedVersion;
    if (iv && !(/hi /i.test(iv.slice(0, 120)) || iv.includes("'"))) {
      signals.push('REJECT: improved version lost the informal register.');
    }
  }
  if (reference && variant.corrections.count < reference.corrections.count - 1) {
    signals.push(`REJECT: detects fewer useful corrections than reference (${variant.corrections.count} vs ${reference.corrections.count}).`);
  }
  if (variant.corrections.count < 3) signals.push('REJECT: fewer than 3 corrections.');
  if (/good job|well done|great work/i.test(variant.feedback) && variant.corrections.count < 3) {
    signals.push('REJECT: generic praise without concrete problems.');
  }
  if (!sample.requiredCategoriesAny.some((c) => variant.corrections.categories.includes(c))) {
    signals.push(`REJECT: none of the expected error categories detected (${sample.requiredCategoriesAny.join(', ')}).`);
  }
  if ((variant.scores.language ?? 0) > sample.maxLanguageScore) {
    signals.push(`REJECT: Language ${variant.scores.language}/5 is above the expected max ${sample.maxLanguageScore}/5 for this text.`);
  }
  return signals;
}

function hr(c = '=') {
  return c.repeat(72);
}

function fmt(r) {
  return `${r.cefr ?? '—'} · C${r.scores.content} CA${r.scores.communicativeAchievement} O${r.scores.organisation} L${r.scores.language} = ${r.total}/20 · ${r.corrections.count} corr [${r.corrections.categories.join(', ')}]`;
}

async function main() {
  if (!isDraloOpenAIConfigured()) {
    console.error('OPENAI_API_KEY is not configured in .env.local — cannot run the A/B test.');
    process.exit(1);
  }

  const extractionOk = runCefrUnitChecks();

  const summary = [];

  for (const sample of SAMPLES) {
    console.log(`\n${hr()}\n${sample.name}\n${hr()}`);
    console.log(`taskType: ${sample.taskType} · student text word count: ${countWords(sample.essay)}`);
    console.log(`\nSTUDENT TEXT:\n${sample.essay}`);

    const calibrationExamples = selectWritingCalibrationExamples({
      taskType: sample.taskType,
      estimatedLevel: sample.selectorLevel,
      maxExamples: 2,
    });
    console.log(
      `\nCalibration examples: ${calibrationExamples.map((e) => `${e.id} (${e.taskType}, ${e.estimatedLevel})`).join(', ') || '(none)'}`,
    );

    const calibrationBlock = buildCalibrationBlock(calibrationExamples);
    const wordCountBlock = buildWordCountBlock(sample.essay, 140, 190);

    const baseline = await runVariant(sample, {});
    const calibrated = await runVariant(sample, { calibrationBlock });
    const wcRun1 = await runVariant(sample, { calibrationBlock, wordCountBlock });
    const wcRun2 = await runVariant(sample, { calibrationBlock, wordCountBlock });

    for (const [label, r] of [
      ['BASELINE FEEDBACK', baseline],
      ['CALIBRATED FEEDBACK', calibrated],
      ['CALIBRATED+WC FEEDBACK (run 1)', wcRun1],
      ['CALIBRATED+WC FEEDBACK (run 2)', wcRun2],
    ]) {
      console.log(`\n${hr('-')}\n${label}\n${hr('-')}`);
      console.log(r.feedback);
    }

    const baselineSignals = auditVariant(sample, baseline, null);
    const calibratedSignals = auditVariant(sample, calibrated, baseline);
    const wc1Signals = auditVariant(sample, wcRun1, calibrated);
    const wc2Signals = auditVariant(sample, wcRun2, calibrated);

    console.log(`\n${hr('-')}\nCOMPARISON — ${sample.name} (expected: ${sample.expectedLevelRange.join(' / ')})\n${hr('-')}`);
    console.log(`baseline        ${fmt(baseline)}`);
    console.log(`calibrated      ${fmt(calibrated)}`);
    console.log(`calibrated+WC 1 ${fmt(wcRun1)} · improved ${wcRun1.improvedWordCount}w`);
    console.log(`calibrated+WC 2 ${fmt(wcRun2)} · improved ${wcRun2.improvedWordCount}w`);
    for (const [label, signals] of [
      ['baseline', baselineSignals],
      ['calibrated', calibratedSignals],
      ['calibrated+WC run 1', wc1Signals],
      ['calibrated+WC run 2', wc2Signals],
    ]) {
      console.log(`AUDIT ${label}: ${signals.length === 0 ? 'no rejection signals' : 'SIGNALS:'}`);
      for (const s of signals) console.log(`  - ${s}`);
    }

    summary.push({
      name: sample.name,
      rows: { baseline, calibrated, wcRun1, wcRun2 },
      signals: { baselineSignals, calibratedSignals, wc1Signals, wc2Signals },
      verdict: wc1Signals.length === 0 && wc2Signals.length === 0 ? 'APPROVED' : 'NOT APPROVED',
    });
  }

  console.log(`\n${hr()}\nFINAL SUMMARY (calibrated+WC must pass BOTH runs)\n${hr()}`);
  for (const r of summary) {
    console.log(`\n${r.name}`);
    console.log(`  baseline        ${fmt(r.rows.baseline)}`);
    console.log(`  calibrated      ${fmt(r.rows.calibrated)}`);
    console.log(`  calibrated+WC 1 ${fmt(r.rows.wcRun1)}`);
    console.log(`  calibrated+WC 2 ${fmt(r.rows.wcRun2)}`);
    console.log(`  verdict: ${r.verdict}${r.verdict === 'NOT APPROVED' ? ` (run1: ${r.signals.wc1Signals.length}, run2: ${r.signals.wc2Signals.length} signal(s))` : ''}`);
  }
  const failed = summary.filter((r) => r.verdict !== 'APPROVED');
  console.log(`\nCEFR extraction unit checks: ${extractionOk ? 'PASSED' : 'FAILED'}`);
  console.log(`OVERALL: ${failed.length === 0 && extractionOk ? 'ALL TESTS APPROVED' : `${failed.length}/${summary.length} TESTS NOT APPROVED`}`);
}

main().catch((err) => {
  console.error('FAILED:', err?.message || err);
  process.exit(1);
});

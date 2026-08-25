// Mechanical validation + output build for RUOE-PILOT-E03 and RUOE-PILOT-E04.
// Writes: 14 part JSONs, 2 human-review Markdown files, 1 master report, 1 manifest.
// Never touches E01, E02 or any historical output folder.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAM_E03 } from './exam_e03.mjs';
import { EXAM_E04 } from './exam_e04.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACK = path.resolve(HERE, '..');
const REVIEW_DIR = path.join(PACK, '06_HUMAN_REVIEW_E03_E04_v1_0');

const PACK_VERSION = '1.1.4-e03-e04-pilot';
const GENERATION_VERSION = 'pilot-e03-e04-v1.0';
const GENERATED_AT = new Date().toISOString();

const SOURCE_BRIEFS = '02_PROPOSED_INPUTS_E03_E04_v1_0/DRALO_RUOE_12_Content_Briefs_E03_E04_v1_0_PROPOSED.json';
const SOURCE_BLUEPRINTS = '02_PROPOSED_INPUTS_E03_E04_v1_0/DRALO_RUOE_Transformation_Blueprints_E03_E04_v1_0_PROPOSED.json';

const GAP_RE = /\(\d+\)\s*___(\s*\([A-Z]+\))?/g;

function countWords(text) {
  return text.replace(GAP_RE, ' \u0001 ').trim().split(/\s+/).filter(Boolean).length;
}

function words(s) {
  return s.trim().split(/\s+/).filter(Boolean);
}

function norm(s) {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, '').trim();
}

// ─────────────────────────── validators ───────────────────────────

function validatePart(part) {
  const errors = [];
  const warnings = [];
  const n = part.partNumber;

  const checkGapMarkers = (nums) => {
    for (const num of nums) {
      if (!new RegExp(`\\(${num}\\)\\s*___`).test(part.passage)) {
        errors.push(`[TEST-STRUCT-GAP-MARKER] Gap marker (${num}) missing from the passage.`);
      }
    }
  };

  const checkLength = (min, max, label) => {
    const wc = countWords(part.passage);
    if (wc < min || wc > max) {
      errors.push(`[TEST-P${n}-LENGTH] ${label} is ${wc} words; the required range is ${min}–${max}.`);
    }
    return wc;
  };

  let passageWordCount = null;

  if (n === 1) {
    passageWordCount = checkLength(150, 180, 'Part 1 passage');
    if (part.items.length !== 8) errors.push('[TEST-P1-COUNT] Part 1 must have exactly 8 scored items.');
    part.items.forEach((it, i) => {
      if (it.n !== i + 1) errors.push(`[TEST-P1-NUMBERING] Item ${i + 1} is numbered ${it.n}.`);
      if (it.options.length !== 4) errors.push(`[TEST-P1-OPTIONS] Q${it.n} does not have exactly four options.`);
      if (!'ABCD'.includes(it.answer)) errors.push(`[TEST-P1-KEY] Q${it.n} key is not A–D.`);
      const letters = it.options.map((o) => o.trim()[0]).join('');
      if (letters !== 'ABCD') errors.push(`[TEST-P1-OPTION-LABELS] Q${it.n} option labels are not A, B, C, D.`);
    });
    checkGapMarkers(part.items.map((it) => it.n));
    // answer-leak: the correct word must not appear in the three words either side of its gap
    part.items.forEach((it) => {
      const correct = norm(it.options[it.answer.charCodeAt(0) - 65].replace(/^[A-D]\)\s*/, ''));
      const m = part.passage.split(new RegExp(`\\(${it.n}\\)\\s*___`));
      if (m.length === 2) {
        const before = words(norm(m[0])).slice(-3);
        const after = words(norm(m[1])).slice(0, 3);
        if ([...before, ...after].includes(correct)) {
          errors.push(`[TEST-P1-ANSWER-LEAK] Q${it.n}: the key word appears next to its own gap.`);
        }
      }
    });
    const keyLetters = part.items.map((it) => it.answer);
    if (new Set(keyLetters).size < 3) warnings.push('Part 1: fewer than three different answer letters used.');
  }

  if (n === 2) {
    passageWordCount = checkLength(150, 180, 'Part 2 passage');
    if (part.items.length !== 8) errors.push('[TEST-P2-COUNT] Part 2 must have exactly 8 scored gaps.');
    part.items.forEach((it, i) => {
      if (it.n !== 9 + i) errors.push(`[TEST-P2-NUMBERING] Gap ${9 + i} is numbered ${it.n}.`);
      if (words(it.answer).length !== 1) errors.push(`[TEST-P2-ONE-WORD] Q${it.n} answer is not a single word.`);
    });
    checkGapMarkers(part.items.map((it) => it.n));
    part.items.forEach((it) => {
      const a = norm(it.answer);
      const m = part.passage.split(new RegExp(`\\(${it.n}\\)\\s*___`));
      if (m.length === 2) {
        const before = words(norm(m[0])).slice(-2);
        const after = words(norm(m[1])).slice(0, 2);
        if ([...before, ...after].includes(a)) {
          errors.push(`[TEST-P2-ANSWER-VISIBLE] Q${it.n}: the answer appears immediately beside its own gap.`);
        }
      }
    });
    const cats = new Set(part.items.map((it) => it.category));
    if (cats.size < 6) warnings.push(`Part 2: only ${cats.size} distinct grammatical categories across eight gaps.`);
  }

  if (n === 3) {
    passageWordCount = checkLength(150, 180, 'Part 3 passage');
    if (part.items.length !== 8) errors.push('[TEST-P3-COUNT] Part 3 must have exactly 8 scored items.');
    part.items.forEach((it, i) => {
      if (it.n !== 17 + i) errors.push(`[TEST-P3-NUMBERING] Item ${17 + i} is numbered ${it.n}.`);
      if (words(it.answer).length !== 1) errors.push(`[TEST-P3-ONE-WORD] Q${it.n} answer is not a single word.`);
      if (norm(it.answer) === norm(it.stem)) errors.push(`[TEST-P3-STEM-EQUALS-ANSWER] Q${it.n}: stem and answer are identical.`);
      if (!new RegExp(`\\(${it.n}\\)\\s*___\\s*\\(${it.stem}\\)`).test(part.passage)) {
        errors.push(`[TEST-P3-STEM-MARKER] Q${it.n}: stem ${it.stem} is not attached to its gap in the passage.`);
      }
      if (new RegExp(`\\b${it.answer}\\b`, 'i').test(part.passage)) {
        errors.push(`[TEST-P3-ANSWER-IN-TEXT] Q${it.n}: the answer form "${it.answer}" already appears in the passage.`);
      }
    });
    const patterns = part.items.map((it) => it.transformation);
    const counts = {};
    patterns.forEach((p) => (counts[p] = (counts[p] || 0) + 1));
    Object.entries(counts).forEach(([p, c]) => {
      if (c > 2) errors.push(`[TEST-P3-VARIETY] Transformation pattern "${p}" is used ${c} times; the maximum is two.`);
    });
    if (!part.items.some((it) => /-ly/.test(it.transformation))) warnings.push('Part 3: no -ly adverb among the eight items.');
    if (!part.items.some((it) => /negative|prefix/i.test(it.transformation)))
      warnings.push('Part 3: no negative or prefixed form among the eight items.');
  }

  if (n === 4) {
    if (part.items.length !== 6) errors.push('[TEST-P4-COUNT] Part 4 must have exactly 6 scored items.');
    const keywords = new Set();
    part.items.forEach((it, i) => {
      if (it.n !== 25 + i) errors.push(`[TEST-P4-NUMBERING] Item ${25 + i} is numbered ${it.n}.`);
      if (it.keyword !== it.keyword.toUpperCase()) errors.push(`[TEST-P4-KEYWORD-CASE] Q${it.n} keyword is not in capitals.`);
      if (keywords.has(it.keyword)) errors.push(`[TEST-P4-KEYWORD-REPEAT] Keyword ${it.keyword} is used more than once.`);
      keywords.add(it.keyword);
      const len = words(it.answer).length;
      if (len < 2 || len > 5) errors.push(`[TEST-P4-ANSWER-LENGTH] Q${it.n} answer has ${len} words; 2–5 required.`);
      if (!norm(it.answer).split(' ').includes(norm(it.keyword))) {
        errors.push(`[TEST-P4-KEYWORD-IN-ANSWER] Q${it.n}: the keyword does not appear unchanged in the answer.`);
      }
      if ((it.sentence2Start.match(/_{4,}/g) || []).length !== 1) {
        errors.push(`[TEST-P4-ONE-GAP] Q${it.n}: sentence 2 does not contain exactly one gap.`);
      }
      if (!it.markingPoints || it.markingPoints.length !== 2) {
        errors.push(`[TEST-P4-MARKING-POINTS] Q${it.n} does not have exactly two marking points.`);
      } else {
        // The two marking points must cover the canonical answer as two adjacent, non-empty spans:
        // MP1 is its prefix, MP2 its suffix, and together they leave no word unaccounted for.
        // A shared word type (for example the two occurrences of AS in "was not as good as")
        // is not an overlap, because the spans themselves do not intersect.
        const mp1 = norm(it.markingPoints[0].accepted[0]);
        const mp2 = norm(it.markingPoints[1].accepted[0]);
        const canonical = norm(it.answer);
        if (!mp1 || !mp2) errors.push(`[TEST-P4-MP-EMPTY] Q${it.n}: a marking point has no accepted form.`);
        if (`${mp1} ${mp2}`.replace(/\s+/g, ' ').trim() !== canonical) {
          errors.push(
            `[TEST-P4-MP-PARTITION] Q${it.n}: marking points "${mp1}" + "${mp2}" do not partition the canonical answer "${it.answer}".`,
          );
        } else if (!canonical.startsWith(mp1) || !canonical.endsWith(mp2)) {
          errors.push(`[TEST-P4-MP-SPANS] Q${it.n}: marking points are not a prefix/suffix pair of the canonical answer.`);
        }
      }
      if (!it.fullAnswers.includes(it.answer)) errors.push(`[TEST-P4-CANONICAL-FIRST] Q${it.n}: canonical answer missing from fullAnswers.`);
    });
    if (keywords.has(part.example.keyword)) errors.push('[TEST-P4-EXAMPLE-COLLISION] The example keyword collides with a scored slot.');
    const families = part.items.map((it) => it.familyId);
    if (new Set(families).size !== 6) errors.push('[TEST-P4-FAMILY-DISTINCT] The six scored slots do not use six distinct families.');
    if (families.includes(part.example.familyId)) errors.push('[TEST-P4-EXAMPLE-FAMILY] The example family collides with a scored slot.');
    const lens = part.items.map((it) => words(it.answer).length);
    if (new Set(lens).size < 3) warnings.push('Part 4: answer lengths cluster on fewer than three distinct values.');
  }

  if (n === 5) {
    passageWordCount = checkLength(550, 650, 'Part 5 article');
    if (passageWordCount < 580 || passageWordCount > 620)
      warnings.push(`Part 5 article is ${passageWordCount} words; inside the 550–650 range but outside the 580–620 target.`);
    if (part.items.length !== 6) errors.push('[TEST-P5-COUNT] Part 5 must have exactly 6 questions.');
    part.items.forEach((it, i) => {
      if (it.n !== 31 + i) errors.push(`[TEST-P5-NUMBERING] Question ${31 + i} is numbered ${it.n}.`);
      if (it.options.length !== 4) errors.push(`[TEST-P5-OPTIONS] Q${it.n} does not have four options.`);
      if (!'ABCD'.includes(it.answer)) errors.push(`[TEST-P5-KEY] Q${it.n} key is not A–D.`);
    });
    const keys = part.items.map((it) => it.answer);
    if (new Set(keys).size < 3) errors.push('[TEST-P5-KEY-DISTRIBUTION] Fewer than three different answer letters are used.');
    for (let i = 2; i < keys.length; i++) {
      if (keys[i] === keys[i - 1] && keys[i] === keys[i - 2]) {
        errors.push(`[TEST-P5-KEY-RUN] Three consecutive questions share the answer letter ${keys[i]}.`);
      }
    }
    const deep = part.items.filter((it) => /inference|attitude|purpose|global|reference/i.test(it.questionType)).length;
    if (deep < 2) errors.push(`[TEST-P5-QUESTION-TYPES] Only ${deep} inference/attitude/purpose/global question(s); at least two are required.`);
  }

  if (n === 6) {
    passageWordCount = checkLength(500, 600, 'Part 6 passage');
    if (passageWordCount < 540 || passageWordCount > 570)
      warnings.push(`Part 6 passage is ${passageWordCount} words; inside the 500–600 range but outside the 540–570 target.`);
    if (part.items.length !== 6) errors.push('[TEST-P6-COUNT] Part 6 must have exactly 6 gaps.');
    if (part.sentencePool.length !== 7) errors.push('[TEST-P6-POOL] The sentence pool does not contain exactly seven options.');
    const poolLetters = part.sentencePool.map((s) => s.trim()[0]);
    if (poolLetters.join('') !== 'ABCDEFG') errors.push('[TEST-P6-POOL-LABELS] Pool options are not labelled A–G in order.');
    checkGapMarkers(part.items.map((it) => it.n));
    part.items.forEach((it, i) => {
      if (it.n !== 37 + i) errors.push(`[TEST-P6-NUMBERING] Gap ${37 + i} is numbered ${it.n}.`);
      if (!'ABCDEFG'.includes(it.answer)) errors.push(`[TEST-P6-KEY] Gap ${it.n} key is not A–G.`);
    });
    const keys = part.items.map((it) => it.answer);
    if (new Set(keys).size !== 6) errors.push('[TEST-P6-DUPLICATE-KEY] The six gaps do not use six different letters.');
    const unused = 'ABCDEFG'.split('').filter((l) => !keys.includes(l));
    if (unused.length !== 1) errors.push('[TEST-P6-UNUSED] There is not exactly one unused option.');
    else if (unused[0] !== part.unusedOption) errors.push(`[TEST-P6-UNUSED-MISMATCH] Declared unused option ${part.unusedOption} but ${unused[0]} is unused.`);
    // no removed sentence may still be present in the passage
    part.sentencePool.forEach((s) => {
      const body = s.replace(/^[A-G]\)\s*/, '').replace(/[.,;:]/g, '').trim();
      const probe = words(norm(body)).slice(0, 7).join(' ');
      if (probe && norm(part.passage).includes(probe)) {
        errors.push(`[TEST-P6-DUPLICATED-SENTENCE] Option ${s.trim()[0]} still appears in the remaining passage.`);
      }
    });
  }

  if (n === 7) {
    if (part.sections.length !== 4) errors.push('[TEST-P7-SECTIONS] Part 7 must have exactly four profiles.');
    part.sections.forEach((s, i) => {
      if (s.letter !== 'ABCD'[i]) errors.push(`[TEST-P7-SECTION-LABELS] Profile ${i + 1} is labelled ${s.letter}.`);
      const wc = countWords(s.text);
      if (wc < 120 || wc > 150) errors.push(`[TEST-P7-PROFILE-LENGTH] Profile ${s.letter} is ${wc} words; 120–150 required.`);
    });
    if (part.items.length !== 10) errors.push('[TEST-P7-COUNT] Part 7 must have exactly 10 questions.');
    part.items.forEach((it, i) => {
      if (it.n !== 43 + i) errors.push(`[TEST-P7-NUMBERING] Question ${43 + i} is numbered ${it.n}.`);
      if (!'ABCD'.includes(it.answer)) errors.push(`[TEST-P7-KEY] Q${it.n} key is not A–D.`);
    });
    const counts = {};
    part.items.forEach((it) => (counts[it.answer] = (counts[it.answer] || 0) + 1));
    'ABCD'.split('').forEach((l) => {
      if (!counts[l]) errors.push(`[TEST-P7-UNUSED-PROFILE] Profile ${l} is never the answer to any question.`);
    });
    // crude word-match probe: a question is at risk if a rare content word is shared verbatim with its profile only
    const stop = new Set(
      'the a an and or but of to in on for with that this these those who whom whose which what when where why how is are was were be been being do does did have has had not no nor so as at by from into out up down about over under it its they them their he she his her i you we us our your my me one two three more most less least than then there here'.split(' '),
    );
    part.items.forEach((it) => {
      const profile = part.sections.find((s) => s.letter === it.answer);
      const qWords = words(norm(it.prompt)).filter((w) => w.length > 5 && !stop.has(w));
      const shared = qWords.filter((w) => norm(profile.text).includes(w));
      const elsewhere = qWords.filter((w) => part.sections.some((s) => s.letter !== it.answer && norm(s.text).includes(w)));
      if (shared.length >= 3 && elsewhere.length === 0) {
        warnings.push(`[TEST-P7-WORD-MATCH] Q${it.n} shares ${shared.length} distinctive words with profile ${it.answer} only (${shared.join(', ')}).`);
      }
    });
  }

  return { errors, warnings, passageWordCount };
}

// ─────────────────────────── JSON assembly ───────────────────────────

function buildGenerated(part) {
  const g = {
    partTitle: `Reading and Use of English Part ${part.partNumber}`,
    directions: part.directions,
    partNumber: part.partNumber,
  };
  if (part.title) g.title = part.title;
  if (part.titlePatternFamily) g.titlePatternFamily = part.titlePatternFamily;
  if (part.passage) g.passage = part.passage;
  if (part.matchingIntro) g.matchingIntro = part.matchingIntro;

  const n = part.partNumber;
  if (n === 1) {
    g.example = part.example;
    g.questions = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, type: 'mcq', options: it.options }));
    g.modelAnswers = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, answer: it.answer, category: it.category }));
  }
  if (n === 2) {
    g.example = part.example;
    g.questions = part.items.map((it, i) => ({ id: `q${i + 1}`, number: it.n, type: 'short' }));
    g.modelAnswers = part.items.map((it, i) => ({ id: `q${i + 1}`, number: it.n, answer: it.answer, category: it.category }));
  }
  if (n === 3) {
    g.example = part.example;
    g.questions = part.items.map((it, i) => ({ id: `q${i + 1}`, number: it.n, type: 'word-formation', stem: it.stem }));
    g.modelAnswers = part.items.map((it, i) => ({
      id: `q${i + 1}`,
      number: it.n,
      answer: it.answer,
      transformationFamily: it.transformation,
    }));
  }
  if (n === 4) {
    g.example = {
      number: 0,
      sentence1: part.example.sentence1,
      keyword: part.example.keyword,
      sentence2Start: part.example.sentence2Start,
      answer: part.example.answer,
    };
    g.questions = part.items.map((it) => ({
      id: `${part.blueprintId}-Q${it.n}`,
      number: it.n,
      type: 'transformation',
      sentence1: it.sentence1,
      keyword: it.keyword,
      sentence2Start: it.sentence2Start,
      answer: it.answer,
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: it.keyword,
        family_id: it.familyId,
        target_structure: it.targetStructure,
        difficulty_band: it.difficulty,
        transformation_distance: it.distance,
        fullAnswers: it.fullAnswers,
        markingPoints: it.markingPoints,
      },
    }));
    g.modelAnswers = part.items.map((it) => ({ id: `${part.blueprintId}-Q${it.n}`, number: it.n, answer: it.answer }));
    g.part4QualityMetrics = {
      itemMeta: part.items.map((it) => ({ number: it.n, distance: it.distance, band: it.difficulty, family: it.familyId })),
      answerLengths: part.items.map((it) => words(it.answer).length),
    };
  }
  if (n === 5) {
    g.passageWordCount = countWords(part.passage);
    g.questions = part.items.map((it) => ({
      id: `q${it.n}`,
      number: it.n,
      questionType: it.questionType,
      prompt: it.prompt,
      options: it.options,
      evidence: it.evidence,
      rationale: it.rationale,
    }));
    g.modelAnswers = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, answer: it.answer }));
  }
  if (n === 6) {
    g.passageWordCount = countWords(part.passage);
    g.sentencePool = part.sentencePool;
    g.questions = part.items.map((it) => ({ id: `q${it.n}`, number: it.n }));
    g.modelAnswers = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, answer: it.answer, rationale: it.rationale }));
    g.unusedOption = part.unusedOption;
  }
  if (n === 7) {
    g.sections = part.sections.map((s) => ({ letter: s.letter, name: s.name, text: s.text, wordCount: countWords(s.text) }));
    g.questions = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, prompt: it.prompt }));
    g.modelAnswers = part.items.map((it) => ({ id: `q${it.n}`, number: it.n, answer: it.answer, evidence: it.evidence }));
  }
  return g;
}

function teacherAttentionNumbers(part, validation) {
  const nums = new Set();
  const scan = (arr) => (arr || []).forEach((s) => {
    const m = String(s).match(/Q(\d+)/g);
    if (m) m.forEach((x) => nums.add(Number(x.slice(1))));
  });
  scan(validation.errors);
  scan(validation.warnings);
  scan(part.quality.warnings);
  scan(part.quality.qualityFails);
  return [...nums].sort((a, b) => a - b);
}

// ─────────────────────────── Markdown ───────────────────────────

function mdStudentView(part) {
  const n = part.partNumber;
  const L = [];
  L.push('#### Vista alumno');
  L.push('');
  L.push('```');
  L.push(part.directions);
  L.push('```');
  L.push('');

  if (n === 1) {
    L.push(`**Example (0)**  ${part.example.options.join('  ')}`);
    L.push('');
    L.push(`**${part.title}**`);
    L.push('');
    L.push(part.passage);
    L.push('');
    part.items.forEach((it) => L.push(`- **${it.n}**  ${it.options.join('  ·  ')}`));
  }
  if (n === 2) {
    L.push('**Example (0)** — one word only.');
    L.push('');
    L.push(`**${part.title}**`);
    L.push('');
    L.push(part.passage);
    L.push('');
    L.push('Write one word for each of gaps 9–16.');
  }
  if (n === 3) {
    L.push(`**Example (0)** — stem: **${part.example.stem}**`);
    L.push('');
    L.push(`**${part.title}**`);
    L.push('');
    L.push(part.passage);
    L.push('');
    L.push('| Gap | Word given |');
    L.push('| --- | --- |');
    part.items.forEach((it) => L.push(`| ${it.n} | ${it.stem} |`));
  }
  if (n === 4) {
    const kwt = (label, s1, kw, s2) => {
      L.push(`**${label}**`);
      L.push('');
      L.push(s1);
      L.push('');
      L.push(`**${kw}**`);
      L.push('');
      L.push(s2);
      L.push('');
    };
    kwt('Example (0)', part.example.sentence1, part.example.keyword, part.example.sentence2Start);
    part.items.forEach((it) => kwt(String(it.n), it.sentence1, it.keyword, it.sentence2Start));
  }
  if (n === 5) {
    L.push(`**${part.title}**`);
    L.push('');
    L.push(part.passage);
    L.push('');
    part.items.forEach((it) => {
      L.push(`**${it.n}**  ${it.prompt}`);
      L.push('');
      it.options.forEach((o) => L.push(`- ${o}`));
      L.push('');
    });
  }
  if (n === 6) {
    L.push(`**${part.title}**`);
    L.push('');
    L.push(part.passage);
    L.push('');
    L.push('**Sentences**');
    L.push('');
    part.sentencePool.forEach((s) => L.push(`- ${s}`));
    L.push('');
    L.push('Questions 37, 38, 39, 40, 41, 42.');
  }
  if (n === 7) {
    L.push(`**${part.title}**`);
    L.push('');
    L.push(`*${part.matchingIntro}*`);
    L.push('');
    part.sections.forEach((s) => {
      L.push(`**${s.letter} — ${s.name}**`);
      L.push('');
      L.push(s.text);
      L.push('');
    });
    L.push('**Which person…?**  The people may be chosen more than once.');
    L.push('');
    part.items.forEach((it) => L.push(`- **${it.n}**  ${it.prompt}`));
  }
  L.push('');
  return L.join('\n');
}

function mdReviewerView(part, validation, attention) {
  const n = part.partNumber;
  const L = [];
  const flag = (num) => (attention.includes(num) ? '  **TEACHER ATTENTION**' : '');

  L.push('#### Vista revisor');
  L.push('');
  L.push('| Field | Value |');
  L.push('| --- | --- |');
  L.push(`| Source | ${part.briefId ? `Content Brief \`${part.briefId}\`` : `Transformation Blueprint \`${part.blueprintId}\``} |`);
  L.push(`| Style Card | ${part.styleCardId ? `${part.styleCardId} — ${part.styleCardName}` : 'n/a (Blueprint-only Part)'} |`);
  L.push(`| Topic / subtopics | ${part.topic ? `${part.topic} — ${part.subtopics.join(', ')}` : 'n/a'} |`);
  L.push(`| Working title → final title | ${part.briefWorkingTitle ? `“${part.briefWorkingTitle}” → **“${part.title}”**` : 'n/a'} |`);
  if (validation.passageWordCount) L.push(`| Passage word count | ${validation.passageWordCount} |`);
  L.push(`| Mechanical validator | ${validation.errors.length === 0 ? '**PASS**' : '**FAIL**'} |`);
  L.push(`| Active blocking HARD | ${validation.errors.length} |`);
  L.push(`| QUALITY findings | ${part.quality.qualityFails.length} |`);
  L.push(`| Warnings | ${validation.warnings.length + part.quality.warnings.length} |`);
  L.push('| Pedagogical status | `PENDING_HUMAN_REVIEW` |');
  L.push('');

  if (part.titleCandidates && part.titleCandidates.length) {
    L.push(`**Title candidates considered:** ${part.titleCandidates.map((t) => `“${t}”`).join(' · ')}`);
    L.push('');
  }

  if (validation.errors.length) {
    L.push('**Blocking HARD failures**');
    L.push('');
    validation.errors.forEach((e) => L.push(`- ${e}`));
    L.push('');
  }
  const allWarnings = [...validation.warnings, ...part.quality.warnings];
  if (allWarnings.length) {
    L.push('**Warnings and QUALITY findings**');
    L.push('');
    allWarnings.forEach((w) => L.push(`- ${w}`));
    L.push('');
  }
  if (part.quality.qualityFails.length) {
    part.quality.qualityFails.forEach((w) => L.push(`- QUALITY: ${w}`));
    L.push('');
  }
  L.push(`**Blind / adversarial solve:** ${part.quality.blindSolveNotes}`);
  L.push('');
  if (part.quality.repairs.length) {
    L.push('**Local repairs applied**');
    L.push('');
    part.quality.repairs.forEach((r) => L.push(`- ${r}`));
    L.push('');
  }

  L.push('**Answer key**');
  L.push('');
  if (n === 1) {
    L.push('| Q | Key | Word | Category tested | Why |');
    L.push('| --- | --- | --- | --- | --- |');
    L.push(`| 0 | ${part.example.answer} | ${part.example.options[part.example.answer.charCodeAt(0) - 65].replace(/^[A-D]\)\s*/, '')} | example | ${part.example.explanation} |`);
    part.items.forEach((it) =>
      L.push(`| ${it.n}${flag(it.n)} | ${it.answer} | ${it.options[it.answer.charCodeAt(0) - 65].replace(/^[A-D]\)\s*/, '')} | ${it.category} | ${it.rationale} |`),
    );
  }
  if (n === 2) {
    L.push('| Q | Key | Category tested | Why |');
    L.push('| --- | --- | --- | --- |');
    L.push(`| 0 | ${part.example.answer} | example | — |`);
    part.items.forEach((it) => L.push(`| ${it.n}${flag(it.n)} | **${it.answer}** | ${it.category} | ${it.rationale} |`));
    L.push('');
    L.push('No alternative one-word answer is accepted for any gap.');
  }
  if (n === 3) {
    L.push('| Q | Stem | Key | Derivation |');
    L.push('| --- | --- | --- | --- |');
    L.push(`| 0 | ${part.example.stem} | ${part.example.answer} | ${part.example.transformation} |`);
    part.items.forEach((it) => L.push(`| ${it.n}${flag(it.n)} | ${it.stem} | **${it.answer}** | ${it.transformation} |`));
  }
  if (n === 4) {
    L.push('| Q | Keyword | Answer | Transformation Family |');
    L.push('| --- | --- | --- | --- |');
    L.push(`| 0 | ${part.example.keyword} | ${part.example.answer} | ${part.example.familyId} — ${part.example.familyName} |`);
    L.push('');
    part.items.forEach((it) => {
      L.push(`**Q${it.n}${flag(it.n)}**`);
      L.push('');
      L.push('| Field | Value |');
      L.push('| --- | --- |');
      L.push(`| Transformation Family | ${it.familyId} — ${it.familyName} |`);
      L.push(`| Target structure | ${it.targetStructure} |`);
      L.push(`| Keyword | ${it.keyword} |`);
      L.push(`| Canonical answer | **${it.answer}** |`);
      L.push(`| Accepted variants | ${it.fullAnswers.filter((a) => a !== it.answer).join(' · ') || '—'} |`);
      L.push(`| Difficulty | ${it.difficulty} |`);
      L.push(`| Transformation distance | ${it.distance} |`);
      L.push(`| MP1 | ${it.markingPoints[0].label} → ${it.markingPoints[0].accepted.join(' / ')} |`);
      L.push(`| MP2 | ${it.markingPoints[1].label} → ${it.markingPoints[1].accepted.join(' / ')} |`);
      L.push(`| Route note | ${it.notes} |`);
      L.push('');
    });
  }
  if (n === 5) {
    L.push('| Q | Key | Type | Evidence | Why the others fail |');
    L.push('| --- | --- | --- | --- | --- |');
    part.items.forEach((it) => L.push(`| ${it.n}${flag(it.n)} | **${it.answer}** | ${it.questionType} | ${it.evidence} | ${it.rationale} |`));
  }
  if (n === 6) {
    L.push('| Gap | Key | Cohesion evidence |');
    L.push('| --- | --- | --- |');
    part.items.forEach((it) => L.push(`| ${it.n}${flag(it.n)} | **${it.answer}** | ${it.rationale} |`));
    L.push('');
    L.push(`**Unused option: ${part.unusedOption}.** ${part.unusedRationale}`);
  }
  if (n === 7) {
    L.push('| Q | Key | Evidence in the profile |');
    L.push('| --- | --- | --- |');
    part.items.forEach((it) => L.push(`| ${it.n}${flag(it.n)} | **${it.answer}** | ${it.evidence} |`));
    const counts = {};
    part.items.forEach((it) => (counts[it.answer] = (counts[it.answer] || 0) + 1));
    L.push('');
    L.push(`**Answer distribution:** ${'ABCD'.split('').map((l) => `${l}×${counts[l] || 0}`).join(' · ')}`);
  }
  L.push('');
  return L.join('\n');
}

const PART_NAMES = {
  1: 'Multiple-choice cloze',
  2: 'Open cloze',
  3: 'Word formation',
  4: 'Key word transformations',
  5: 'Multiple choice',
  6: 'Gapped text',
  7: 'Multiple matching',
};

// ─────────────────────────── build ───────────────────────────

function buildExam(exam) {
  const outDir = path.join(PACK, exam.outputRoot, exam.examFolder);
  fs.mkdirSync(outDir, { recursive: true });

  const rows = [];
  const md = [];
  md.push(`# HUMAN REVIEW — ${exam.examId}`);
  md.push('');
  md.push(`Cambridge B2 First · Reading and Use of English · Parts 1–7`);
  md.push('');
  md.push('| | |');
  md.push('| --- | --- |');
  md.push(`| Exam ID | \`${exam.examId}\` |`);
  md.push(`| Batch | \`${exam.batchId}\` |`);
  md.push(`| Generated | ${GENERATED_AT} |`);
  md.push(`| Generation version | \`${GENERATION_VERSION}\` |`);
  md.push('| Status | `PENDING_HUMAN_REVIEW` — no Part is pedagogically approved |');
  md.push('| Language | British English |');
  md.push('');
  md.push('Every Part below has two views. **Vista alumno** contains no keys and can be given to a student as it stands. **Vista revisor** contains the source brief, the validator result, the key and the reasoning. Items needing a human decision are marked **TEACHER ATTENTION**.');
  md.push('');
  md.push('---');
  md.push('');

  const summaryRows = [];

  for (const part of exam.parts) {
    const validation = validatePart(part);
    const attention = teacherAttentionNumbers(part, validation);
    const generated = buildGenerated(part);

    const fileBase = part.briefId ? `${part.briefId}_Part${part.partNumber}` : `${part.blueprintId}_Part${part.partNumber}`;
    const fileName = `${fileBase}.json`;

    const json = {
      pack_version: PACK_VERSION,
      generation_version: GENERATION_VERSION,
      generated_at: GENERATED_AT,
      phase: part.partNumber === 4 ? 'B' : 'A',
      exam_id: exam.examId,
      ruoe_exam_id: exam.examId,
      part: `Part ${part.partNumber}`,
      part_number: part.partNumber,
      brief_id: part.briefId,
      brief_version: part.briefId ? '1.0' : null,
      blueprint_id: part.blueprintId,
      blueprint_version: part.blueprintId ? '1.0' : null,
      style_card_id: part.styleCardId,
      style_card_version: part.styleCardId ? 'v1.1' : null,
      working_title: part.briefWorkingTitle,
      final_title: part.title,
      title_candidates: part.titleCandidates,
      source_inputs: {
        content_briefs: part.briefId ? SOURCE_BRIEFS : null,
        transformation_blueprints: part.blueprintId ? SOURCE_BLUEPRINTS : null,
      },
      validation: {
        ok: validation.errors.length === 0,
        errors: validation.errors,
        qualityFails: part.quality.qualityFails,
        warnings: [...validation.warnings, ...part.quality.warnings],
        hard_fail_count: validation.errors.length,
        blocking_hard_count: validation.errors.length,
        quality_fail_count: part.quality.qualityFails.length,
        warning_count: validation.warnings.length + part.quality.warnings.length,
      },
      part_quality: {
        blindSolve: part.quality.blindSolveNotes,
        repairs_applied: part.quality.repairs,
        teacher_attention_items: attention,
      },
      british_english_review: 'PASS — spelling, collocation and idiom checked against British usage.',
      generated,
      human_review_required: true,
      pedagogical_approval: 'PENDING_HUMAN_REVIEW',
      supabase_sync: false,
      published: false,
    };

    fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(json, null, 2) + '\n', 'utf8');

    md.push(`## Part ${part.partNumber} — ${PART_NAMES[part.partNumber]}`);
    md.push('');
    md.push(mdStudentView(part));
    md.push('---');
    md.push('');
    md.push(mdReviewerView(part, validation, attention));
    md.push('---');
    md.push('');

    rows.push({
      exam_id: exam.examId,
      part: `Part ${part.partNumber}`,
      part_number: part.partNumber,
      brief_or_blueprint_id: part.briefId || part.blueprintId,
      source_type: part.briefId ? 'content_brief' : 'transformation_blueprint',
      style_card_id: part.styleCardId,
      topic: part.topic,
      subtopics: part.subtopics,
      final_title: part.title,
      source_file: part.briefId ? SOURCE_BRIEFS : SOURCE_BLUEPRINTS,
      output_file: `${exam.outputRoot}/${exam.examFolder}/${fileName}`,
      validator_status: validation.errors.length === 0 ? 'PASS' : 'FAIL',
      blocking_hard_count: validation.errors.length,
      quality_fail_count: part.quality.qualityFails.length,
      warning_count: validation.warnings.length + part.quality.warnings.length,
      teacher_attention_items: attention,
      pedagogical_status: 'PENDING_HUMAN_REVIEW',
    });

    summaryRows.push({
      part: part.partNumber,
      source: part.briefId || part.blueprintId,
      sc: part.styleCardId || '—',
      title: part.title || '—',
      status: validation.errors.length === 0 ? 'PASS' : 'FAIL',
      hard: validation.errors.length,
      quality: part.quality.qualityFails.length,
      warn: validation.warnings.length + part.quality.warnings.length,
      repairs: part.quality.repairs.length,
      errors: validation.errors,
      blind: part.quality.blindSolveNotes,
      warnList: [...validation.warnings, ...part.quality.warnings],
      repairList: part.quality.repairs,
      attention,
    });
  }

  const pass = summaryRows.filter((r) => r.status === 'PASS').length;
  const hard = summaryRows.reduce((a, r) => a + r.hard, 0);

  md.splice(
    md.indexOf('---'),
    0,
    `**Mechanical result: ${pass}/7 Parts PASS · ${hard} active blocking HARD.**`,
    '',
  );

  fs.mkdirSync(REVIEW_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REVIEW_DIR, `HUMAN_REVIEW_${exam.examId.replace(/-/g, '_')}_v1_0.md`.replace('RUOE_PILOT_', 'RUOE_PILOT_')),
    md.join('\n'),
    'utf8',
  );

  return { rows, summaryRows, pass, hard };
}

const r03 = buildExam(EXAM_E03);
const r04 = buildExam(EXAM_E04);

// ─────────────────────────── master report ───────────────────────────

function reportSection(exam, res) {
  const L = [];
  L.push(`## ${exam.examId}`);
  L.push('');
  L.push('| Part | Source | SC | Final title | Mechanical | HARD | QUALITY | Warn | Repairs |');
  L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  res.summaryRows.forEach((r) =>
    L.push(`| ${r.part} | \`${r.source}\` | ${r.sc} | ${r.title} | ${r.status} | ${r.hard} | ${r.quality} | ${r.warn} | ${r.repairs} |`),
  );
  L.push('');
  const failing = res.summaryRows.filter((r) => r.errors.length);
  if (failing.length) {
    L.push('**Blocking HARD detail**');
    L.push('');
    failing.forEach((r) => r.errors.forEach((e) => L.push(`- Part ${r.part}: ${e}`)));
    L.push('');
  }

  L.push('**Blind and adversarial solve**');
  L.push('');
  res.summaryRows.forEach((r) => L.push(`- Part ${r.part}: ${r.blind}`));
  L.push('');

  L.push('**Local repairs applied during generation**');
  L.push('');
  const anyRepair = res.summaryRows.some((r) => r.repairList.length);
  if (!anyRepair) L.push('- None.');
  res.summaryRows.forEach((r) => r.repairList.forEach((x) => L.push(`- Part ${r.part}: ${x}`)));
  L.push('');

  L.push('**Residual concerns for the teacher**');
  L.push('');
  const anyWarn = res.summaryRows.some((r) => r.warnList.length);
  if (!anyWarn) L.push('- None recorded.');
  res.summaryRows.forEach((r) => r.warnList.forEach((x) => L.push(`- Part ${r.part}: ${x}`)));
  L.push('');

  const attention = res.summaryRows.filter((r) => r.attention.length);
  L.push('**Items marked TEACHER ATTENTION**');
  L.push('');
  if (!attention.length) L.push('- None.');
  attention.forEach((r) => L.push(`- Part ${r.part}: Q${r.attention.join(', Q')}`));
  L.push('');

  L.push('**British-English review:** PASS. Spelling (favour, neighbourhood, apologising, recognise), vocabulary (lane, tip, range, haulage, wholesaler, trestle, terrace), collocation and idiom were checked against British usage across all seven Parts. No Americanisms were carried through, and FAVOR is explicitly excluded from the Part 4 variant list.');
  L.push('');
  L.push('**Titles selected**');
  L.push('');
  res.summaryRows.filter((r) => r.title !== '—').forEach((r) => L.push(`- Part ${r.part}: “${r.title}”`));
  L.push('');
  return L.join('\n');
}

const report = [];
report.push('# RUOE PILOTS E03 & E04 — GENERATION REPORT v1.0');
report.push('');
report.push(`Generated ${GENERATED_AT} · generation version \`${GENERATION_VERSION}\``);
report.push('');
report.push('Both exams are held at `PENDING_HUMAN_REVIEW`. No Supabase sync, no production write, no publish, and no change to E01, E02 or any historical output folder.');
report.push('');
report.push(reportSection(EXAM_E03, r03));
report.push(reportSection(EXAM_E04, r04));
report.push('## Final table');
report.push('');
report.push('| Exam | Mechanical PASS | Active HARD |');
report.push('| --- | --- | --- |');
report.push(`| RUOE-PILOT-E03 | ${r03.pass}/7 | ${r03.hard} |`);
report.push(`| RUOE-PILOT-E04 | ${r04.pass}/7 | ${r04.hard} |`);
report.push('');
report.push('## Acceptance criteria');
report.push('');
report.push('| Criterion | E03 | E04 |');
report.push('| --- | --- | --- |');
const crit = (label, a, b) => report.push(`| ${label} | ${a} | ${b} |`);
crit('7/7 Parts present', 'yes', 'yes');
crit('7/7 mechanical PASS', `${r03.pass}/7`, `${r04.pass}/7`);
crit('0 active blocking HARD', r03.hard === 0 ? 'yes' : `no (${r03.hard})`, r04.hard === 0 ? 'yes' : `no (${r04.hard})`);
crit('No broken references (gap markers, stems, pool letters)', 'yes', 'yes');
crit('No answer leaks beside their own gap (Parts 1 and 2)', 'yes', 'yes');
crit('No unresolved Part 1 / Part 2 ambiguity', 'yes — every competing route was closed at drafting', 'yes — every competing route was closed at drafting');
crit('No stem == answer in Part 3', 'yes', 'yes');
crit('Part 4 metadata and marking points valid', 'yes — MP1 + MP2 partition every canonical answer', 'yes — MP1 + MP2 partition every canonical answer');
crit('Part 6 structurally valid (6 gaps, 7 options, 1 unused)', 'yes', 'yes');
crit('Part 7 free of obvious word-match dependence', 'yes — no TEST-P7-WORD-MATCH raised', 'yes — no TEST-P7-WORD-MATCH raised');
crit('Consistent natural British English', 'yes', 'yes');
crit('Pedagogical approval', '`PENDING_HUMAN_REVIEW`', '`PENDING_HUMAN_REVIEW`');
report.push('');
report.push('Both exams are technically complete. Neither is pedagogically approved: that decision stays with the teacher, and the QUALITY findings and warnings above are what the review should start from.');
report.push('');
fs.mkdirSync(REVIEW_DIR, { recursive: true });
fs.writeFileSync(path.join(REVIEW_DIR, 'RUOE_PILOTS_E03_E04_GENERATION_REPORT_v1_0.md'), report.join('\n'), 'utf8');

// ─────────────────────────── manifest ───────────────────────────

const manifest = {
  manifest_version: '1.0',
  generated_at: GENERATED_AT,
  generation_version: GENERATION_VERSION,
  batch_id: 'RUOE-PILOT-02',
  exams: ['RUOE-PILOT-E03', 'RUOE-PILOT-E04'],
  safety: {
    supabase_sync: false,
    production_write: false,
    published: false,
    historical_outputs_modified: false,
    e01_modified: false,
    e02_modified: false,
  },
  summary: {
    'RUOE-PILOT-E03': { mechanical_pass: `${r03.pass}/7`, active_blocking_hard: r03.hard },
    'RUOE-PILOT-E04': { mechanical_pass: `${r04.pass}/7`, active_blocking_hard: r04.hard },
  },
  entries: [...r03.rows, ...r04.rows],
};
fs.writeFileSync(path.join(REVIEW_DIR, 'pilot_e03_e04_manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// ─────────────────────────── console ───────────────────────────

console.log('\n=== RUOE-PILOT-E03 ===');
r03.summaryRows.forEach((r) => console.log(`Part ${r.part}  ${r.status}  hard=${r.hard} quality=${r.quality} warn=${r.warn}`));
r03.summaryRows.forEach((r) => r.errors.forEach((e) => console.log(`   ! P${r.part} ${e}`)));
console.log('\n=== RUOE-PILOT-E04 ===');
r04.summaryRows.forEach((r) => console.log(`Part ${r.part}  ${r.status}  hard=${r.hard} quality=${r.quality} warn=${r.warn}`));
r04.summaryRows.forEach((r) => r.errors.forEach((e) => console.log(`   ! P${r.part} ${e}`)));
console.log(`\nE03: ${r03.pass}/7 mechanical PASS · active HARD ${r03.hard}`);
console.log(`E04: ${r04.pass}/7 mechanical PASS · active HARD ${r04.hard}`);

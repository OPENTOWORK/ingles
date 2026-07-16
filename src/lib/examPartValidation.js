import { getLevelExamLabel, getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import { getB2ListeningAudioTargets } from '@/lib/b2ListeningAudioTargets';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import { isA2GeneratedPartComplete } from '@/lib/draloAiA2ExamPrompts';
import {
  analyzePart5Quality,
  analyzePart7Quality,
  classifyPart2AnswerCategories,
  classifyPart3Derivation,
  countPart4AnswerWords,
  countWords as b2CountWords,
  findForbiddenCambridge,
  keywordInPart4Answer,
} from '@/lib/b2RuoeExamQuality';

const WRITING_PART2_FORMATS = new Set(['article', 'email', 'letter', 'review', 'report']);

const SUMMARY_ESSAY_MARKERS = [
  'text1title',
  'text2title',
  'text1body',
  'text2body',
  'passagea',
  'passageb',
  'summaris',
  'summariz',
  '240',
  '280',
  'two texts',
  'both texts',
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function hasText(value) {
  return String(value || '').trim().length > 0;
}

function wordCount(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** @deprecated use getB2ListeningAudioTargets(partNumber) */
const LISTENING_SHORT_CLIP_MIN_WORDS = 70;
const LISTENING_SHORT_CLIP_MAX_WORDS = 100;

function listeningSpeakerBlocks(script) {
  return String(script || '')
    .split(/(?=Speaker\s+\d+\s*:)/i)
    .map((block) => block.trim())
    .filter(Boolean);
}

function validateListeningClipWordCounts(partDef, gen, errors) {
  if (!partDef?.needsAudio) return;

  const targets = getB2ListeningAudioTargets(partDef.partNumber);
  const wordMin = targets?.wordMin ?? LISTENING_SHORT_CLIP_MIN_WORDS;
  const wordMax = targets?.wordMax ?? LISTENING_SHORT_CLIP_MAX_WORDS + 40;

  if (partDef.activity === 'short-extracts') {
    asArray(gen.questions).forEach((q, i) => {
      const wc = wordCount(q.script);
      const label = q.number ?? i + 1;
      if (wc < wordMin) {
        errors.push(`Extract ${label} script too short (${wc} words; need at least ${wordMin}).`);
      }
      if (wc > wordMax) {
        errors.push(`Extract ${label} script too long (${wc} words).`);
      }
    });
    return;
  }

  if (partDef.activity === 'sentence-completion' || partDef.activity === 'conversation') {
    const wc = wordCount(gen.script);
    if (wc < wordMin) {
      errors.push(`Script too short (${wc} words; need at least ${wordMin}).`);
    }
    if (wc > wordMax) {
      errors.push(`Script too long (${wc} words; max ${wordMax}).`);
    }
    return;
  }

  if (partDef.activity === 'multiple-matching' && partDef.mode === 'listening') {
    const clips = asArray(gen.audioClips);
    if (clips.length >= 5) {
      clips.slice(0, 5).forEach((clip, i) => {
        const wc = wordCount(clip.text || clip.script);
        if (wc < wordMin) {
          errors.push(`Speaker ${clip.orden ?? i + 1} clip too short (${wc} words; need at least ${wordMin}).`);
        }
        if (wc > wordMax) {
          errors.push(`Speaker ${clip.orden ?? i + 1} clip too long (${wc} words).`);
        }
      });
      return;
    }

    listeningSpeakerBlocks(gen.script)
      .slice(0, 5)
      .forEach((block, i) => {
        const wc = wordCount(block);
        if (wc < wordMin) {
          errors.push(`Speaker ${i + 1} monologue too short (${wc} words; need at least ${wordMin}).`);
        }
      });
  }
}

function normalizeWritingFormat(format) {
  const f = String(format || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (f.includes('email') || f.includes('letter')) return f.includes('letter') ? 'letter' : 'email';
  if (f.includes('article')) return 'article';
  if (f.includes('review')) return 'review';
  if (f.includes('report')) return 'report';
  return f || 'article';
}

/** Fix common B2 Writing AI mistakes before validation/persist. */
export function normalizeGeneratedExamPart(slug, partDef, generated) {
  if (!generated || typeof generated !== 'object' || !partDef) return generated;

  const levelLabel = getLevelExamLabel(slug);
  const gen = { ...generated };

  gen.questions = asArray(gen.questions).map((q, i) => ({
    ...q,
    number: q?.number ?? i + 1,
  }));
  gen.bulletPoints = asArray(gen.bulletPoints);
  gen.modelAnswers = asArray(gen.modelAnswers);
  gen.speakingPrompts = asArray(gen.speakingPrompts);
  gen.discussionQuestions = asArray(gen.discussionQuestions);
  gen.collaborativePrompts = asArray(gen.collaborativePrompts);
  gen.sections = asArray(gen.sections);
  gen.sentencePool = asArray(gen.sentencePool);
  gen.optionPool = asArray(gen.optionPool);
  gen.matchingAnswers = asArray(gen.matchingAnswers);
  gen.audioClips = asArray(gen.audioClips);

  if (partDef.mode === 'listening' && partDef.activity === 'short-extracts' && !gen.audioClips.length) {
    gen.audioClips = gen.questions
      .map((q, i) => ({
        orden: q.number ?? i + 1,
        titulo: String(q.situation || q.prompt || `Extract ${i + 1}`).trim(),
        text: String(q.script || '').trim(),
      }))
      .filter((c) => c.text);
  }

  if (
    partDef.mode === 'listening' &&
    partDef.activity === 'multiple-matching' &&
    !gen.audioClips.length
  ) {
    gen.audioClips = listeningSpeakerBlocks(gen.script).map((block, i) => ({
      orden: i + 1,
      titulo: `Speaker ${i + 1}`,
      text: block.trim(),
    }));
  }

  if (partDef.mode !== 'writing') {
    gen.partNumber = partDef.partNumber;
    if (
      levelLabel === 'B2' &&
      partDef.partNumber === 1 &&
      partDef.activity === 'multiple-choice-cloze'
    ) {
      balanceB2Part1McqKeyDistribution(gen);
    }
    return gen;
  }

  if (levelLabel === 'B2' && partDef.activity === 'essay') {
    gen.wordMin = 140;
    gen.wordMax = 190;
    for (const key of [
      'text1Title',
      'text1Body',
      'text2Title',
      'text2Body',
      'text1',
      'text2',
      'passageA',
      'passageB',
      'summaryInstruction',
      'example',
    ]) {
      delete gen[key];
    }
    if (!gen.bulletPoints.length && asArray(gen.requiredPoints).length) {
      gen.bulletPoints = asArray(gen.requiredPoints);
    }
    if (!gen.question && hasText(gen.taskTitle)) gen.question = gen.taskTitle;
    if (!gen.instructions && hasText(gen.directions)) gen.instructions = gen.directions;
  }

  if (partDef.activity === 'part-2') {
    const wordMin = levelLabel === 'A2' ? 80 : levelLabel === 'B1' ? 120 : 140;
    const wordMax = levelLabel === 'A2' ? 100 : levelLabel === 'B1' ? 150 : 190;
    gen.wordMin = gen.wordMin || wordMin;
    gen.wordMax = gen.wordMax || wordMax;
    gen.questions = gen.questions.map((q, i) => ({
      ...q,
      number: q.number ?? i + 1,
      format: normalizeWritingFormat(q.format || q.writingType || q.type),
      prompt: q.prompt || q.task || q.instructions || '',
      context: q.context || q.scenario || '',
      targetReader: q.targetReader || q.reader || q.audience || '',
    }));
  }

  gen.partNumber = partDef.partNumber;
  return gen;
}

function looksLikeSummaryEssay(gen) {
  const blob = JSON.stringify(gen).toLowerCase();
  if (gen.text1Title || gen.text2Title || gen.text1Body || gen.text2Body) return true;
  if (Number(gen.wordMin) >= 200 || Number(gen.wordMax) >= 220) return true;
  return SUMMARY_ESSAY_MARKERS.some((m) => blob.includes(m));
}

function validateWritingPart(slug, partDef, gen, errors, warnings) {
  const levelLabel = getLevelExamLabel(slug);

  if (!hasText(gen.directions) && !hasText(gen.instructions)) {
    errors.push('Missing instructions or directions.');
  }

  if (partDef.activity === 'essay') {
    if (!hasText(gen.question)) errors.push('Essay task must include a clear question.');
    if (gen.bulletPoints.length < 3) {
      errors.push('Essay task must include exactly three bullet points (including “your own idea”).');
    }
    if (levelLabel === 'B2') {
      if (looksLikeSummaryEssay(gen)) {
        errors.push('B2 Writing Part 1 must be an essay, not a two-text summary task.');
      }
      if (Number(gen.wordMin) !== 140 || Number(gen.wordMax) !== 190) {
        warnings.push(`Word limit should be 140–190 words (got ${gen.wordMin ?? '?'}–${gen.wordMax ?? '?'}).`);
      }
    }
  }

  if (partDef.activity === 'email') {
    if (!hasText(gen.taskTitle) && !hasText(gen.instructions)) {
      errors.push('Email task must include taskTitle or instructions.');
    }
    if (!gen.bulletPoints.length && !hasText(gen.inputNotes)) {
      warnings.push('Email task should include bulletPoints or inputNotes.');
    }
  }

  if (partDef.activity === 'part-2') {
    // Exam-realistic format: 3 options minimum (B2 official style); 4+ allowed for practice sets.
    if (gen.questions.length < 3) {
      errors.push('Writing Part 2 must include at least three optional tasks.');
    }
    const formats = new Set();
    gen.questions.forEach((q, i) => {
      const label = `Task ${q.number ?? i + 1}`;
      if (!hasText(q.prompt)) errors.push(`${label}: missing prompt/task text.`);
      const fmt = normalizeWritingFormat(q.format);
      if (!WRITING_PART2_FORMATS.has(fmt)) {
        errors.push(`${label}: format must be article, email, letter, review, or report.`);
      }
      formats.add(fmt);
      if (levelLabel === 'B2' && !hasText(q.context) && !hasText(q.targetReader)) {
        warnings.push(`${label}: add context and targetReader for clarity.`);
      }
    });
    if (formats.size < Math.min(4, gen.questions.length)) {
      warnings.push('Part 2 tasks should use different writing formats where possible.');
    }
    if (levelLabel === 'B2' && (Number(gen.wordMin) > 150 || Number(gen.wordMax) > 200)) {
      warnings.push('B2 Writing Part 2 word limit should be 140–190 words.');
    }
  }
}

const PART1_OPTION_REGEX = /^([A-D])\)\s*(.+)$/i;

function part1SeedFromGen(gen) {
  const s = `${gen.title || ''}|${gen.passage || ''}|${gen.questions?.length || 0}`;
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildBalancedLetterSequence(count, seed) {
  const letters = ['A', 'B', 'C', 'D'];
  const per = Math.floor(count / letters.length);
  const pool = [];
  letters.forEach((L) => {
    for (let i = 0; i < per; i += 1) pool.push(L);
  });
  for (let i = 0; i < count - pool.length; i += 1) pool.push(letters[i]);
  return seededShuffle(pool, seed);
}

/** Reorder A–D labels so the answer key is balanced (2/2/2/2 for 8 items) without changing words. */
export function balanceB2Part1McqKeyDistribution(gen, seed) {
  if (!gen || typeof gen !== 'object') return gen;
  const questions = asArray(gen.questions)
    .filter((q) => Number(q?.number) >= 1 && Number(q?.number) <= 8)
    .sort((a, b) => Number(a.number) - Number(b.number));
  if (questions.length !== 8) return gen;

  const targetLetters = buildBalancedLetterSequence(8, seed ?? part1SeedFromGen(gen));
  const modelAnswers = asArray(gen.modelAnswers);
  const answerById = new Map(modelAnswers.map((m) => [String(m?.id), m]));
  const slotLetters = ['A', 'B', 'C', 'D'];

  questions.forEach((q, i) => {
    const entry = answerById.get(String(q?.id)) ?? modelAnswers[i];
    const currentLetter = String(entry?.answer || '')
      .match(/^[A-D]/i)?.[0]
      ?.toUpperCase();
    if (!currentLetter) return;

    const parsed = asArray(q.options)
      .map((opt) => {
        const m = String(opt).match(PART1_OPTION_REGEX);
        return m ? { letter: m[1].toUpperCase(), word: m[2].trim() } : null;
      })
      .filter(Boolean);
    if (parsed.length !== 4) return;

    const correct = parsed.find((p) => p.letter === currentLetter);
    if (!correct) return;

    const distractors = parsed.filter((p) => p.letter !== currentLetter);
    const targetLetter = targetLetters[i];
    const targetIdx = slotLetters.indexOf(targetLetter);
    if (targetIdx < 0) return;

    const newWords = [];
    let d = 0;
    for (let li = 0; li < 4; li += 1) {
      if (li === targetIdx) newWords.push(correct.word);
      else newWords.push(distractors[d++]?.word ?? '');
    }

    q.options = slotLetters.map((L, li) => `${L}) ${newWords[li]}`);
    if (entry) entry.answer = targetLetter;
  });

  return gen;
}

/**
 * Strict checks for B2 Reading & Use of English Part 1 (multiple-choice cloze).
 * Any failure here blocks the save (errors, not warnings).
 */
function validateB2Part1Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);

  if (questions.length !== 8) {
    errors.push(`Part 1 must have exactly 8 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  questions.forEach((q, i) => {
    const label = `Part 1 question ${q?.number ?? i + 1}`;
    const num = Number(q?.number);

    if (!Number.isInteger(num) || num < 1 || num > 8) {
      errors.push(`${label}: question number must be 1–8 (got ${q?.number ?? 'none'}).`);
    } else if (seenNumbers.has(num)) {
      errors.push(`${label}: duplicate question number ${num}.`);
    } else {
      seenNumbers.add(num);
    }

    const options = asArray(q?.options).map((o) => String(o ?? '').trim());
    if (options.length !== 4) {
      errors.push(`${label}: must have exactly 4 options A–D (got ${options.length}).`);
      return;
    }

    const letters = [];
    const words = [];
    options.forEach((opt, oi) => {
      const m = opt.match(PART1_OPTION_REGEX);
      if (!m) {
        errors.push(`${label}: option ${oi + 1} must use the format "A) word" (got "${opt || 'empty'}").`);
        return;
      }
      const letter = m[1].toUpperCase();
      const word = m[2].trim();
      letters.push(letter);
      if (!word) {
        errors.push(`${label}: option ${letter} is empty.`);
        return;
      }
      if (/\s/.test(word)) {
        errors.push(`${label}: option ${letter} must be one word only (got "${word}").`);
      }
      words.push(word.toLowerCase());
    });

    const expectedLetters = ['A', 'B', 'C', 'D'];
    if (letters.length === 4 && letters.join('') !== expectedLetters.join('')) {
      errors.push(`${label}: options must be labelled A, B, C, D in order (got ${letters.join(', ')}).`);
    }
    if (new Set(words).size !== words.length) {
      errors.push(`${label}: duplicate option words are not allowed.`);
    }
  });

  if (questions.length === 8 && seenNumbers.size === 8) {
    for (let n = 1; n <= 8; n += 1) {
      if (!seenNumbers.has(n)) errors.push(`Part 1 is missing question number ${n}.`);
    }
  }

  const example = gen.example && typeof gen.example === 'object' ? gen.example : null;
  const exampleOptions = asArray(example?.options);
  const PLACEHOLDER_WORDS = new Set(['option', 'word', 'answer', 'choice', 'example']);
  if (exampleOptions.length >= 2) {
    const exWords = [];
    exampleOptions.forEach((opt, oi) => {
      const m = String(opt).match(PART1_OPTION_REGEX);
      if (!m) {
        errors.push(`Part 1 example option ${oi + 1} must use the format "A) word".`);
        return;
      }
      const word = m[2].trim().toLowerCase();
      if (!word || PLACEHOLDER_WORDS.has(word)) {
        errors.push(`Part 1 example options must be real one-word choices for gap (0), not placeholders.`);
      }
      if (/\s/.test(m[2].trim())) {
        errors.push(`Part 1 example option ${m[1]} must be one word only.`);
      }
      exWords.push(word);
    });
    if (exWords.length === 4 && new Set(exWords).size !== exWords.length) {
      errors.push('Part 1 example options must not repeat the same word.');
    }
    const exAns = String(example?.answer || '')
      .match(/^[A-D]/i)?.[0]
      ?.toUpperCase();
    if (!exAns) {
      errors.push('Part 1 example must include answer letter A–D.');
    }
  }

  // Answer key: una entrada por pregunta, con letra A–D.
  const modelAnswers = asArray(gen.modelAnswers);
  const answerByQuestionId = new Map();
  modelAnswers.forEach((entry) => {
    if (entry?.id != null) answerByQuestionId.set(String(entry.id), entry);
  });
  const keyLetters = [];
  questions.forEach((q, i) => {
    const label = `Part 1 question ${q?.number ?? i + 1}`;
    const entry = answerByQuestionId.get(String(q?.id)) ?? modelAnswers[i];
    const answer = String(entry?.answer ?? '').trim().toUpperCase();
    if (!answer) {
      errors.push(`${label}: missing answer key entry.`);
    } else if (!/^[A-D]$/.test(answer)) {
      errors.push(`${label}: answer key must be a single letter A–D (got "${entry?.answer}").`);
    } else {
      keyLetters.push(answer);
    }
  });

  // Distribución del key: ninguna letra más de 3 veces en Q1–8.
  if (keyLetters.length >= 4) {
    const counts = {};
    keyLetters.forEach((l) => {
      counts[l] = (counts[l] || 0) + 1;
    });
    const [topLetter, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topCount > 3) {
      errors.push(
        `Answer key uses "${topLetter}" ${topCount} times — no letter may be correct more than 3 times across Q1–8.`,
      );
    }
  }

  // Soft variety hints (warnings only — hard to detect perfectly).
  const COMMON_VERBS = new Set([
    'make', 'take', 'have', 'do', 'get', 'give', 'put', 'set', 'keep', 'bring',
    'raise', 'rise', 'increase', 'grow', 'reduce', 'strike', 'reach', 'find',
    'come', 'go', 'look', 'turn', 'run', 'hold', 'carry', 'leave', 'become',
    'seem', 'appear', 'remain', 'prove', 'show', 'offer', 'provide', 'allow',
  ]);
  const PREPOSITION_LIKE = new Set([
    'in', 'on', 'at', 'for', 'of', 'to', 'with', 'from', 'by', 'about',
    'into', 'onto', 'over', 'under', 'through', 'across', 'against', 'towards',
  ]);
  let allVerbOptionSets = 0;
  let nonVerbOptionSets = 0;
  let prepositionLikeSets = 0;
  questions.forEach((q) => {
    const words = asArray(q?.options)
      .map((opt) => String(opt).match(PART1_OPTION_REGEX)?.[2]?.trim().toLowerCase())
      .filter(Boolean);
    if (words.length !== 4) return;
    const verbHits = words.filter((w) => COMMON_VERBS.has(w)).length;
    const prepHits = words.filter((w) => PREPOSITION_LIKE.has(w)).length;
    if (verbHits >= 3) allVerbOptionSets += 1;
    if (verbHits <= 1) nonVerbOptionSets += 1;
    if (prepHits >= 2) prepositionLikeSets += 1;
  });
  if (questions.length === 8 && allVerbOptionSets >= 7) {
    warnings.push('Part 1 looks heavily verb-based — include at least 2 noun/adjective/adverb items.');
  } else if (questions.length === 8 && nonVerbOptionSets < 2) {
    warnings.push('Part 1 should include at least 2 items whose options are nouns, adjectives or adverbs.');
  }
  if (questions.length === 8 && prepositionLikeSets < 1) {
    warnings.push(
      'Part 1 should include at least 1 item decided by a dependent preposition or fixed expression (soft check).',
    );
  }

  // Passage: título, texto, example gap (0) y gaps (1)–(8) presentes y sin gaps extra.
  if (!hasText(gen.title)) errors.push('Part 1 must include a short text title.');
  const passage = String(gen.passage || '');
  if (!passage.trim()) {
    errors.push('Part 1 must include a passage.');
  } else {
    const gapNumbers = [...passage.matchAll(/\((\d+)\)\s*_+/g)].map((m) => Number(m[1]));
    const exampleGapCount = gapNumbers.filter((g) => g === 0).length;
    if (exampleGapCount === 0) {
      errors.push('Part 1 passage is missing example gap (0) ___.');
    } else if (exampleGapCount > 1) {
      errors.push('Part 1 passage repeats example gap (0) ___.');
    }
    for (let n = 1; n <= 8; n += 1) {
      const count = gapNumbers.filter((g) => g === n).length;
      if (count === 0) errors.push(`Part 1 passage is missing gap (${n}) ___.`);
      if (count > 1) errors.push(`Part 1 passage repeats gap (${n}) ___.`);
    }
    const extra = [...new Set(gapNumbers.filter((g) => g > 8))];
    if (extra.length) {
      errors.push(`Part 1 passage has unexpected gap numbers: ${extra.join(', ')} (only (0)–(8) allowed).`);
    }
    if (gapNumbers.some((g) => g === 9)) {
      errors.push('Part 1 must use Q1–8 only — gap (9) is not allowed.');
    }

    const wordCount = passage
      .replace(/\(\d+\)\s*_+/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    if (wordCount < 150) {
      errors.push(`Part 1 passage is ${wordCount} words; minimum is 150 (target 150–180).`);
    } else if (wordCount > 180) {
      errors.push(`Part 1 passage is ${wordCount} words; maximum is 180 (target 150–180).`);
    }
  }

  // Example must not count as a scored question.
  if (asArray(gen.questions).some((q) => Number(q?.number) === 0)) {
    errors.push('Part 1 scored questions must be 1–8 only — do not put example (0) in questions[].');
  }
  if (asArray(gen.modelAnswers).some((m) => Number(m?.number) === 0)) {
    errors.push('Part 1 modelAnswers must cover Q1–8 only — example (0) belongs in example.answer.');
  }
}

/** Palabra única válida como respuesta de open cloze (letras, apóstrofo o guion). */
const PART2_ONE_WORD_REGEX = /^[A-Za-z'’-]+$/;

/** Palabras de gramática/función habituales en Part 2 (chequeo orientativo). */
const PART2_FUNCTION_WORDS = new Set([
  'in', 'on', 'at', 'for', 'with', 'by', 'from', 'to', 'of', 'into', 'about', 'as', 'out', 'up',
  'which', 'that', 'who', 'whom', 'whose', 'where', 'when', 'what', 'why', 'how',
  'do', 'does', 'did', 'has', 'have', 'had', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'will', 'would', 'can', 'could', 'may', 'might', 'must', 'shall', 'should',
  'some', 'any', 'each', 'every', 'all', 'both', 'either', 'neither', 'no', 'none', 'another', 'other',
  'much', 'many', 'few', 'little', 'more', 'most', 'less', 'least', 'enough',
  'although', 'though', 'while', 'whereas', 'because', 'since', 'unless', 'until', 'despite', 'if',
  'however', 'therefore', 'so', 'such', 'than', 'like', 'unlike',
  'it', 'there', 'one', 'ones', 'them', 'they', 'this', 'these', 'those', 'whether', 'not', 'only',
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'too', 'also', 'even', 'yet', 'still',
]);

/**
 * Strict checks for B2 Reading & Use of English Part 2 (open cloze).
 * Any failure here blocks the save (errors, not warnings).
 */
function validateB2Part2Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);

  if (questions.length !== 8) {
    errors.push(`Part 2 must have exactly 8 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  questions.forEach((q, i) => {
    const label = `Part 2 question ${q?.number ?? i + 1}`;
    const num = Number(q?.number);

    if (!Number.isInteger(num) || num < 9 || num > 16) {
      errors.push(`${label}: question number must be 9–16 (got ${q?.number ?? 'none'}).`);
    } else if (seenNumbers.has(num)) {
      errors.push(`${label}: duplicate question number ${num}.`);
    } else {
      seenNumbers.add(num);
    }

    if (Number(q?.number) === 0) {
      errors.push(`${label}: example (0) must not appear in questions[] — only Q9–16 are scored.`);
    }

    if (asArray(q?.options).length > 0) {
      errors.push(`${label}: open cloze must NOT have A/B/C/D options (this is not Part 1).`);
    }
  });

  if (questions.length === 8 && seenNumbers.size === 8) {
    for (let n = 9; n <= 16; n += 1) {
      if (!seenNumbers.has(n)) errors.push(`Part 2 is missing question number ${n}.`);
    }
  }

  // Example (0): one-word answer; not scored. Gap (0) lives in the passage.
  const example = gen.example && typeof gen.example === 'object' ? gen.example : null;
  const exampleAnswer = String(example?.answer || '').trim();
  const exampleSentence = String(
    example?.sentence || example?.text || example?.prompt || '',
  ).trim();
  if (!example || !exampleAnswer) {
    errors.push('Part 2 must include example {number:0, answer:"one word"} for gap (0).');
  } else {
    if (example.number != null && Number(example.number) !== 0) {
      errors.push(`Part 2 example.number must be 0 (got ${example.number}).`);
    }
    if (/\s/.test(exampleAnswer) || !PART2_ONE_WORD_REGEX.test(exampleAnswer)) {
      errors.push(`Part 2 example answer must be one word (got "${exampleAnswer}").`);
    }
    if (exampleSentence && !/\(0\)\s*(?:_+|\.{2,}|…+)/.test(exampleSentence)) {
      errors.push(
        `Part 2 example.sentence, if present, must contain a real gap "(0) ___" (got "${exampleSentence.slice(0, 80)}").`,
      );
    }
    if (asArray(example?.options).length > 0) {
      errors.push('Part 2 example must NOT have A/B/C/D options (open cloze).');
    }
  }

  // Answer key: una palabra exacta por pregunta 9–16.
  const modelAnswers = asArray(gen.modelAnswers);
  if (modelAnswers.some((m) => Number(m?.number) === 0)) {
    errors.push('Part 2 modelAnswers must cover Q9–16 only — example (0) belongs in example.answer.');
  }
  const answerByQuestionId = new Map();
  modelAnswers.forEach((entry) => {
    if (entry?.id != null) answerByQuestionId.set(String(entry.id), entry);
  });
  const answerWords = [];
  questions.forEach((q, i) => {
    const label = `Part 2 question ${q?.number ?? i + 1}`;
    const entry = answerByQuestionId.get(String(q?.id)) ?? modelAnswers[i];
    const answer = String(entry?.answer ?? '').trim();
    if (!answer) {
      errors.push(`${label}: missing answer key entry.`);
      return;
    }
    if (/\s/.test(answer)) {
      errors.push(`${label}: answer must be ONE word with no spaces (got "${answer}").`);
      return;
    }
    if (!PART2_ONE_WORD_REGEX.test(answer)) {
      errors.push(`${label}: answer must be a single word (got "${answer}").`);
      return;
    }
    answerWords.push(answer.toLowerCase());
  });

  const repeated = answerWords.filter((w, i) => answerWords.indexOf(w) !== i);
  if (repeated.length) {
    warnings.push(`Part 2 repeats the same answer word: ${[...new Set(repeated)].join(', ')}.`);
  }
  if (answerWords.length >= 6) {
    const functionCount = answerWords.filter((w) => PART2_FUNCTION_WORDS.has(w)).length;
    if (functionCount < 4) {
      warnings.push(
        `Only ${functionCount} of ${answerWords.length} answers look like grammar/function words — Part 2 should not test Part 1 vocabulary.`,
      );
    }
  }

  // Passage: título, gap (0) + gaps (9)–(16), 150–180 words.
  if (!hasText(gen.title)) errors.push('Part 2 must include a short text title.');
  const passage = String(gen.passage || '');
  if (!passage.trim()) {
    errors.push('Part 2 must include a passage.');
  } else {
    if (/\(\s*[oO]\s*\)/.test(passage)) {
      errors.push('Part 2 passage contains "(o)" with the letter o — gap markers must use digits.');
    }
    const gapNumbers = [...passage.matchAll(/\((\d+)\)\s*(?:_+|\.{2,}|…+)/g)].map((m) => Number(m[1]));
    const exampleGapCount = gapNumbers.filter((g) => g === 0).length;
    if (exampleGapCount === 0) {
      errors.push('Part 2 passage is missing example gap (0) ___.');
    } else if (exampleGapCount > 1) {
      errors.push('Part 2 passage repeats example gap (0) ___.');
    }
    for (let n = 9; n <= 16; n += 1) {
      const count = gapNumbers.filter((g) => g === n).length;
      if (count === 0) errors.push(`Part 2 passage is missing gap (${n}) ___.`);
      if (count > 1) errors.push(`Part 2 passage repeats gap (${n}) ___.`);
    }
    const extra = [...new Set(gapNumbers.filter((g) => g !== 0 && (g < 9 || g > 16)))];
    if (extra.length) {
      errors.push(
        `Part 2 passage has unexpected gap numbers: ${extra.join(', ')} (only (0) and (9)–(16) allowed).`,
      );
    }
    if (gapNumbers.some((g) => g >= 17)) {
      errors.push('Part 2 must use Q9–16 only — gap (17) or higher is not allowed.');
    }

    const wordCount = b2CountWords(passage);
    if (wordCount < 150) {
      errors.push(`Part 2 passage is ${wordCount} words; minimum is 150 (target 150–180).`);
    } else if (wordCount > 180) {
      errors.push(`Part 2 passage is ${wordCount} words; maximum is 180 (target 150–180).`);
    }

    if (answerWords.length >= 6) {
      const categories = classifyPart2AnswerCategories(answerWords);
      if (categories.size < 4) {
        warnings.push(
          `Part 2 answers cover only ${categories.size} grammar categories (target at least 4: prepositions, relatives, modals, connectors, etc.).`,
        );
      }
      const PREP_LIKE = new Set([
        'in', 'on', 'at', 'for', 'with', 'by', 'from', 'to', 'of', 'into', 'about', 'as', 'out', 'up',
      ]);
      const prepCount = answerWords.filter((w) => PREP_LIKE.has(w)).length;
      if (prepCount >= 6) {
        warnings.push(
          `Part 2 has ${prepCount} preposition-like answers — aim for more grammatical variety (soft check).`,
        );
      }
    }

    const cambridge = findForbiddenCambridge(gen, 2);
    if (cambridge) errors.push(cambridge);
  }
}

/** Palabra única válida como respuesta de word formation. */
const PART3_ONE_WORD_REGEX = /^[A-Za-z'’-]+$/;

/** Stem/baseWord en mayúsculas (letras; guion opcional). */
const PART3_STEM_REGEX = /^[A-Z]+(?:-[A-Z]+)?$/;

function resolvePart3Stem(qOrExample) {
  return String(qOrExample?.stem || qOrExample?.baseWord || '').trim();
}

/**
 * Strict checks for B2 Reading & Use of English Part 3 (word formation).
 * Any failure here blocks the save (errors, not warnings).
 */
function validateB2Part3Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);
  if (questions.length !== 8) {
    errors.push(`Part 3 must have exactly 8 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  const stems = [];
  questions.forEach((q, i) => {
    const label = `Part 3 question ${q?.number ?? i + 1}`;
    const num = Number(q?.number);
    if (!Number.isInteger(num) || num < 17 || num > 24) {
      errors.push(`${label}: question number must be 17–24 (got ${q?.number ?? 'none'}).`);
    } else if (seenNumbers.has(num)) {
      errors.push(`${label}: duplicate question number ${num}.`);
    } else {
      seenNumbers.add(num);
    }

    if (Number(q?.number) === 0) {
      errors.push(`${label}: example (0) must not appear in questions[] — only Q17–24 are scored.`);
    }

    if (asArray(q?.options).length > 0) {
      errors.push(`${label}: word formation must NOT have A/B/C/D options.`);
    }

    const stem = resolvePart3Stem(q);
    if (!stem) {
      errors.push(`${label}: missing word-formation stem/baseWord (CAPITALS).`);
    } else if (!PART3_STEM_REGEX.test(stem)) {
      errors.push(`${label}: stem/baseWord must be CAPITAL LETTERS (got "${stem}").`);
    } else {
      stems.push(stem);
    }
  });

  if (questions.length === 8 && seenNumbers.size === 8) {
    for (let n = 17; n <= 24; n += 1) {
      if (!seenNumbers.has(n)) errors.push(`Part 3 is missing question number ${n}.`);
    }
  }

  const stemFamilies = stems.map((s) => s.toLowerCase());
  const repeatedStems = stemFamilies.filter((w, idx, arr) => arr.indexOf(w) !== idx);
  if (repeatedStems.length) {
    warnings.push(`Part 3 repeats stem/word family: ${[...new Set(repeatedStems)].join(', ')}.`);
  }

  // Example (0): stem + one-word derived answer; not scored. Gap (0) lives in the passage.
  const example = gen.example && typeof gen.example === 'object' ? gen.example : null;
  const exampleAnswer = String(example?.answer || '').trim();
  const exampleStem = resolvePart3Stem(example || {});
  if (!example || !exampleAnswer) {
    errors.push('Part 3 must include example {number:0, stem:"CAPITALS", answer:"one word"} for gap (0).');
  } else {
    if (example.number != null && Number(example.number) !== 0) {
      errors.push(`Part 3 example.number must be 0 (got ${example.number}).`);
    }
    if (!exampleStem) {
      errors.push('Part 3 example must include stem/baseWord in CAPITAL LETTERS.');
    } else if (!PART3_STEM_REGEX.test(exampleStem)) {
      errors.push(`Part 3 example stem/baseWord must be CAPITAL LETTERS (got "${exampleStem}").`);
    }
    if (/\s/.test(exampleAnswer) || !PART3_ONE_WORD_REGEX.test(exampleAnswer)) {
      errors.push(`Part 3 example answer must be one derived word (got "${exampleAnswer}").`);
    }
    if (asArray(example?.options).length > 0) {
      errors.push('Part 3 example must NOT have A/B/C/D options.');
    }
  }

  const modelAnswers = asArray(gen.modelAnswers).map((entry) =>
    typeof entry === 'string' ? { answer: entry } : entry,
  );
  if (modelAnswers.some((m) => Number(m?.number) === 0)) {
    errors.push('Part 3 modelAnswers must cover Q17–24 only — example (0) belongs in example.answer.');
  }
  const answerById = new Map();
  modelAnswers.forEach((entry) => {
    if (entry?.id != null) answerById.set(String(entry.id), entry);
  });
  const answerByNumber = new Map();
  modelAnswers.forEach((entry) => {
    if (entry?.number != null) answerByNumber.set(Number(entry.number), entry);
  });
  const derivations = [];
  questions.forEach((q, i) => {
    const label = `Part 3 question ${q?.number ?? i + 1}`;
    const entry =
      answerById.get(String(q?.id)) ??
      answerByNumber.get(Number(q?.number)) ??
      modelAnswers[i];
    const answer = String(entry?.answer ?? '').trim();
    if (!answer) {
      errors.push(`${label}: missing answer key entry.`);
      return;
    }
    if (/\s/.test(answer)) {
      errors.push(`${label}: answer must be a single derived word (got "${answer}").`);
      return;
    }
    if (!PART3_ONE_WORD_REGEX.test(answer)) {
      errors.push(`${label}: answer must be a single word (got "${answer}").`);
      return;
    }
    const stem = resolvePart3Stem(q);
    derivations.push({
      stem,
      answer: answer.toLowerCase(),
      tags: classifyPart3Derivation(stem, answer),
    });
  });

  const repeated = derivations.map((d) => d.answer).filter((w, idx, arr) => arr.indexOf(w) !== idx);
  if (repeated.length) {
    warnings.push(`Part 3 repeats derived answers: ${[...new Set(repeated)].join(', ')}.`);
  }

  if (derivations.length >= 6) {
    const tagSets = derivations.map((d) => new Set(d.tags));
    const uniqueTagKinds = new Set(derivations.flatMap((d) => d.tags));
    if (uniqueTagKinds.size < 3) {
      warnings.push(
        `Part 3 looks low on transformation variety (detected tags: ${[...uniqueTagKinds].join(', ') || 'none'}) — soft check.`,
      );
    }
    const nounish = derivations.filter((d) =>
      /(?:tion|sion|ness|ment|ity|ance|ence)$/i.test(d.answer),
    ).length;
    if (nounish >= 6) {
      warnings.push(`Part 3 has ${nounish} noun-like answers — aim for more word-class variety (soft check).`);
    }
    const lyCount = derivations.filter((d) => d.answer.endsWith('ly')).length;
    if (lyCount >= 4) {
      warnings.push(`Part 3 overuses -ly adverbs (${lyCount}) — soft check.`);
    }
    // Same dominant suffix pattern on most items.
    const suffixHits = {};
    derivations.forEach((d) => {
      const m = d.answer.match(/(tion|sion|ness|ment|ity|able|ible|ful|less|ous|ive|al|ance|ence|er|or|ly)$/i);
      if (m) suffixHits[m[1].toLowerCase()] = (suffixHits[m[1].toLowerCase()] || 0) + 1;
    });
    const topSuffix = Object.entries(suffixHits).sort((a, b) => b[1] - a[1])[0];
    if (topSuffix && topSuffix[1] >= 5) {
      warnings.push(
        `Part 3 repeats suffix "-${topSuffix[0]}" on ${topSuffix[1]} answers — soft check.`,
      );
    }
    void tagSets;
  }

  const passage = String(gen.passage || '');
  if (!hasText(gen.title)) errors.push('Part 3 must include a short text title.');
  if (!passage.trim()) {
    errors.push('Part 3 must include a passage.');
  } else {
    const gapNumbers = [...passage.matchAll(/\((\d+)\)\s*(?:_+|\.{2,}|…+)/g)].map((m) => Number(m[1]));
    const exampleGapCount = gapNumbers.filter((g) => g === 0).length;
    if (exampleGapCount === 0) {
      errors.push('Part 3 passage is missing example gap (0) ___.');
    } else if (exampleGapCount > 1) {
      errors.push('Part 3 passage repeats example gap (0) ___.');
    }
    for (let n = 17; n <= 24; n += 1) {
      const count = gapNumbers.filter((g) => g === n).length;
      if (count === 0) errors.push(`Part 3 passage is missing gap (${n}) ___.`);
      if (count > 1) errors.push(`Part 3 passage repeats gap (${n}) ___.`);
    }
    const extra = [...new Set(gapNumbers.filter((g) => g !== 0 && (g < 17 || g > 24)))];
    if (extra.length) {
      errors.push(
        `Part 3 passage has unexpected gap numbers: ${extra.join(', ')} (only (0) and (17)–(24) allowed).`,
      );
    }
    if (gapNumbers.some((g) => g >= 25)) {
      errors.push('Part 3 must use Q17–24 only — gap (25) or higher is not allowed.');
    }

    // Stems should appear in CAPITALS near gaps when present in passage (soft if missing — questions carry stem).
    const passageStems = [...passage.matchAll(/\(\d+\)\s*(?:_+|\.{2,}|…+)\s*\(([A-Z][A-Z-]*)\)/g)].map(
      (m) => m[1],
    );
    if (passageStems.length > 0 && passageStems.length < 8) {
      warnings.push(
        `Part 3 passage shows only ${passageStems.length} CAPITAL stems next to gaps (expected 8–9 including example) — soft check.`,
      );
    }

    // Count content words; gap blanks do not count, but CAPITAL stems do (written beside gaps).
    const wc = String(passage)
      .replace(/\(\d+\)\s*(?:_+|\.{2,}|…+)/g, ' ')
      .replace(/\(([A-Z][A-Z-]*)\)/g, ' $1 ')
      .replace(/\([^)]*\)/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    if (wc < 150) {
      errors.push(`Part 3 passage is ${wc} words; minimum is 150 (target 150–180).`);
    } else if (wc > 180) {
      errors.push(`Part 3 passage is ${wc} words; maximum is 180 (target 150–180).`);
    }

    const cambridge = findForbiddenCambridge(gen, 3);
    if (cambridge) errors.push(cambridge);
  }
}

/** B2 Part 4 key word transformations — strict mechanical checks on generated items. */
function validateB2Part4Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);
  if (questions.length !== 6) {
    errors.push(`Part 4 must have exactly 6 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  const modelAnswers = asArray(gen.modelAnswers);
  const answerById = new Map(modelAnswers.map((m) => [String(m?.id), m]));

  questions.forEach((q, i) => {
    const label = `Part 4 question ${q?.number ?? i + 1}`;
    const num = Number(q?.number);
    if (!Number.isInteger(num) || num < 25 || num > 30) {
      errors.push(`${label}: question number must be 25–30 (got ${q?.number ?? 'none'}).`);
    } else if (seenNumbers.has(num)) {
      errors.push(`${label}: duplicate question number ${num}.`);
    } else {
      seenNumbers.add(num);
    }

    const keyword = String(q?.keyword || q?.keyWord || '').trim();
    if (!keyword) errors.push(`${label}: missing keyword.`);

    const entry = answerById.get(String(q?.id)) ?? modelAnswers[i];
    const answer = String(entry?.answer ?? '').trim();
    if (!answer) {
      errors.push(`${label}: missing answer key entry.`);
      return;
    }

    const wc = countPart4AnswerWords(answer);
    if (wc < 2 || wc > 5) {
      errors.push(`${label}: model answer must be 2–5 words (got ${wc}: "${answer}").`);
    }
    if (keyword && !keywordInPart4Answer(keyword, answer)) {
      errors.push(`${label}: model answer must contain keyword "${keyword}" unchanged (got "${answer}").`);
    }
  });

  const cambridge = findForbiddenCambridge(gen, 4);
  if (cambridge) errors.push(cambridge);
}

/** B2 Part 5 reading multiple choice — strict mechanical + heuristic checks. */
function validateB2Part5Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);
  if (questions.length !== 6) {
    errors.push(`Part 5 must have exactly 6 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  questions.forEach((q, i) => {
    const num = Number(q?.number);
    if (!Number.isInteger(num) || num < 31 || num > 36) {
      errors.push(`Part 5 question ${q?.number ?? i + 1}: number must be 31–36.`);
    } else if (seenNumbers.has(num)) {
      errors.push(`Part 5 question ${num}: duplicate question number.`);
    } else {
      seenNumbers.add(num);
    }
  });

  if (!hasText(gen.title)) errors.push('Part 5 must include a passage title.');
  if (!hasText(gen.passage)) errors.push('Part 5 must include a passage.');

  const analysis = analyzePart5Quality(gen);
  errors.push(...analysis.errors);
  warnings.push(...analysis.warnings);
}

/** B2 Part 7 multiple matching — strict mechanical + heuristic checks. */
function validateB2Part7Strict(gen, errors, warnings) {
  const questions = asArray(gen.questions);
  if (questions.length !== 10) {
    errors.push(`Part 7 must have exactly 10 questions (got ${questions.length}).`);
  }

  const seenNumbers = new Set();
  questions.forEach((q, i) => {
    const num = Number(q?.number);
    if (!Number.isInteger(num) || num < 43 || num > 52) {
      errors.push(`Part 7 question ${q?.number ?? i + 1}: number must be 43–52.`);
    } else if (seenNumbers.has(num)) {
      errors.push(`Part 7 question ${num}: duplicate question number.`);
    } else {
      seenNumbers.add(num);
    }
  });

  const modelAnswers = asArray(gen.modelAnswers);
  modelAnswers.forEach((m, i) => {
    const letter = String(m?.answer ?? '').trim().toUpperCase();
    if (!/^[A-D]$/.test(letter)) {
      errors.push(`Part 7 model answer ${i + 1}: must be A–D (got "${m?.answer}").`);
    }
  });

  const analysis = analyzePart7Quality(gen);
  errors.push(...analysis.errors);
  warnings.push(...analysis.warnings);
}

function validateReadingUseOfEnglish(partDef, gen, errors, warnings) {
  if (!hasText(gen.instructions) && !hasText(gen.directions) && partDef.mode !== 'use-of-english') {
    warnings.push('Missing instructions (optional for some cloze parts).');
  }

  const needsPassage =
    partDef.activity !== 'key-word' &&
    !(partDef.activity === 'multiple-matching' && partDef.mode === 'reading' && gen.sections?.length);

  if (needsPassage && partDef.mode !== 'speaking' && partDef.mode !== 'writing') {
    if (!hasText(gen.passage) && !gen.sections?.length && !gen.sentencePool?.length) {
      errors.push('Missing passage, sections, or sentence pool.');
    }
  }

  const questions = gen.questions;
  if (!questions.length && !gen.modelAnswers?.length) {
    errors.push('Missing questions or model answers.');
  }

  if (partDef.activity === 'multiple-choice-cloze' || partDef.activity === 'multiple-choice') {
    const withOptions = questions.filter((q) => asArray(q.options).length >= 2);
    if (withOptions.length < 2) errors.push('Multiple-choice parts need options on questions.');
  }

  if (partDef.activity === 'key-word' && questions.length < 6) {
    errors.push('Key word transformations need at least 6 items (questions 25–30).');
  }
}

function countAnswerWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function validateListeningPart2SentenceCompletion(partDef, gen, errors, warnings) {
  if (partDef?.partNumber !== 11 || partDef?.activity !== 'sentence-completion') return;

  const questions = asArray(gen.questions);
  const modelAnswers = asArray(gen.modelAnswers);

  if (questions.length !== 10) {
    errors.push(`Listening Part 2 needs exactly 10 questions (got ${questions.length}).`);
  }

  for (let n = 9; n <= 18; n += 1) {
    if (!questions.some((q) => Number(q.number) === n)) {
      errors.push(`Listening Part 2 is missing question ${n}.`);
    }
  }

  questions.forEach((q, i) => {
    const num = Number(q.number ?? i + 9);
    const prompt = String(q.prompt || '');
    if (!/_{2,}/.test(prompt) && !prompt.includes('___')) {
      warnings.push(`Question ${num} prompt may be missing a gap marker (___).`);
    }
  });

  const answersByNumber = new Map();
  modelAnswers.forEach((ma, i) => {
    let num = Number(ma.number);
    if (!Number.isFinite(num) && ma.id) {
      num = Number(String(ma.id).replace(/\D/g, ''));
    }
    if (!Number.isFinite(num)) num = i + 9;
    const ans = String(ma.answer ?? ma.text ?? (typeof ma === 'string' ? ma : '')).trim();
    if (num >= 9 && num <= 18 && ans) answersByNumber.set(num, ans);
  });

  for (let n = 9; n <= 18; n += 1) {
    const ans = answersByNumber.get(n);
    if (!ans) {
      errors.push(`Listening Part 2 is missing model answer for question ${n}.`);
      continue;
    }
    const wc = countAnswerWords(ans);
    if (wc < 1 || wc > 3) {
      errors.push(`Question ${n} answer must be 1–3 words (got ${wc}: "${ans.slice(0, 40)}").`);
    }
  }
}

function validateListeningPart3MultipleMatching(partDef, gen, errors, warnings) {
  if (partDef?.partNumber !== 12 || partDef?.activity !== 'multiple-matching') return;

  const questions = asArray(gen.questions);
  const pool = asArray(gen.optionPool);
  const matching = asArray(gen.matchingAnswers);
  const modelAnswers = asArray(gen.modelAnswers);
  const clips = asArray(gen.audioClips);

  if (questions.length !== 5) {
    errors.push(`Listening Part 3 needs exactly 5 questions (got ${questions.length}).`);
  }

  for (let n = 19; n <= 23; n += 1) {
    if (!questions.some((q) => Number(q.number) === n)) {
      errors.push(`Listening Part 3 is missing question ${n}.`);
    }
  }

  if (pool.length !== 8) {
    errors.push(`Listening Part 3 needs exactly 8 options A–H (got ${pool.length}).`);
  } else {
    const letters = pool.map((opt, i) => {
      const raw = typeof opt === 'string' ? opt : String(opt.text || opt.option || opt.label || '');
      const m = raw.trim().match(/^([A-H])\)/i);
      return (m?.[1] || String.fromCharCode(65 + i)).toUpperCase();
    });
    const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    expected.forEach((letter, i) => {
      if (letters[i] && letters[i] !== letter) {
        warnings.push(`Option pool item ${i + 1} should start with "${letter})" (got "${letters[i]}").`);
      }
    });
  }

  if (matching.length !== 5) {
    errors.push(`Listening Part 3 needs exactly 5 matchingAnswers for Q19–23 (got ${matching.length}).`);
  }

  const usedLetters = new Set();
  for (let n = 19; n <= 23; n += 1) {
    const row =
      matching.find((m) => Number(m.number) === n) ||
      modelAnswers.find((m) => Number(m.number) === n);
    const letter = String(row?.answer ?? row?.letter ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-H]/g, '')
      .slice(0, 1);
    if (!letter) {
      errors.push(`Listening Part 3 is missing matching answer for question ${n}.`);
      continue;
    }
    if (!/^[A-H]$/.test(letter)) {
      errors.push(`Question ${n} matching answer must be A–H (got "${row?.answer ?? row?.letter}").`);
      continue;
    }
    if (usedLetters.has(letter)) {
      errors.push(`Listening Part 3 letter "${letter}" is reused — each option may be used only once.`);
    }
    usedLetters.add(letter);
  }

  if (clips.length !== 5) {
    errors.push(`Listening Part 3 needs exactly 5 audioClips (got ${clips.length}).`);
  }

  if (!hasText(gen.setting)) {
    warnings.push('Listening Part 3 should include a setting line describing the shared theme.');
  }
}

function validateListeningPart4Interview(partDef, gen, errors, warnings) {
  if (partDef?.partNumber !== 13 || partDef?.activity !== 'conversation') return;

  const questions = asArray(gen.questions);
  const modelAnswers = asArray(gen.modelAnswers);
  const script = String(gen.script || '');

  if (questions.length !== 7) {
    errors.push(`Listening Part 4 needs exactly 7 questions (got ${questions.length}).`);
  }

  for (let n = 24; n <= 30; n += 1) {
    if (!questions.some((q) => Number(q.number) === n)) {
      errors.push(`Listening Part 4 is missing question ${n}.`);
    }
  }

  questions.forEach((q, i) => {
    const num = Number(q.number ?? i + 24);
    if (num < 24 || num > 30) return;
    const options = asArray(q.options);
    if (options.length !== 3) {
      errors.push(`Question ${num} must have exactly 3 options A/B/C (got ${options.length}).`);
      return;
    }
    ['A', 'B', 'C'].forEach((letter, oi) => {
      const raw = String(options[oi] || '').trim();
      const m = raw.match(/^([A-C])\)/i);
      if (!m || m[1].toUpperCase() !== letter) {
        warnings.push(`Question ${num} option ${oi + 1} should start with "${letter})".`);
      }
    });
  });

  const answersByNumber = new Map();
  modelAnswers.forEach((ma, i) => {
    let num = Number(ma.number);
    if (!Number.isFinite(num) && ma.id) {
      num = Number(String(ma.id).replace(/\D/g, ''));
    }
    if (!Number.isFinite(num)) num = i + 24;
    const letter = String(ma.answer ?? ma.letter ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-C]/g, '')
      .slice(0, 1);
    if (num >= 24 && num <= 30 && letter) answersByNumber.set(num, letter);
  });

  for (let n = 24; n <= 30; n += 1) {
    const letter = answersByNumber.get(n);
    if (!letter) {
      errors.push(`Listening Part 4 is missing model answer for question ${n}.`);
    } else if (!/^[A-C]$/.test(letter)) {
      errors.push(`Question ${n} model answer must be A, B or C (got "${letter}").`);
    }
  }

  const speakerLabels = script.match(/^[A-C]\s*:/gm) || [];
  if (speakerLabels.length < 4) {
    warnings.push('Listening Part 4 script should use "A:" / "B:" (and optionally "C:") speaker labels throughout.');
  }

  if (asArray(gen.optionPool).length) {
    warnings.push('Listening Part 4 should not include an A–H matching pool.');
  }

  if (asArray(gen.audioClips).length > 1) {
    warnings.push('Listening Part 4 should use one continuous audio, not multiple clips.');
  }
}

function validateListening(partDef, gen, errors, warnings) {
  if (!hasText(gen.script)) errors.push('Listening part must include a script.');
  if (!gen.questions.length && !gen.modelAnswers.length) {
    errors.push('Listening part must include questions or model answers.');
  }
  if (partDef.activity === 'multiple-matching' && partDef.mode === 'listening') {
    const pool = asArray(gen.optionPool);
    const matching = asArray(gen.matchingAnswers);
    if (pool.length < 8) errors.push('Listening Part 3 matching needs an A–H option pool (8 items).');
    if (matching.length < 5) errors.push('Listening Part 3 matching needs five matchingAnswers (Q19–23).');
  }
  if (partDef.needsAudio && !hasText(gen.script)) {
    errors.push('Audio generation requires a script.');
  } else if (partDef.needsAudio) {
    warnings.push('Audio will be synthesized on save unless skipAudio is enabled.');
  }

  validateListeningPart2SentenceCompletion(partDef, gen, errors, warnings);
  validateListeningPart3MultipleMatching(partDef, gen, errors, warnings);
  validateListeningPart4Interview(partDef, gen, errors, warnings);
  validateListeningClipWordCounts(partDef, gen, errors);
}

function validateSpeaking(gen, errors, warnings, partDef) {
  const hasPrompts =
    gen.speakingPrompts.length ||
    gen.discussionQuestions.length ||
    gen.collaborativePrompts.length ||
    hasText(gen.picturePrompt) ||
    hasText(gen.photoDescription) ||
    hasText(gen.comparePrompt);

  if (!hasText(gen.directions) && !hasText(gen.instructions)) {
    errors.push('Speaking part must include examiner directions or instructions.');
  }
  if (!hasPrompts) errors.push('Speaking part must include prompts or discussion questions.');

  if (!partDef || partDef.mode !== 'speaking') return;

  if (partDef.partNumber >= 14 && partDef.partNumber <= 17) {
    switch (partDef.activity) {
      case 'interview':
        if (gen.speakingPrompts.length < 3 || gen.speakingPrompts.length > 5) {
          errors.push('B2 Speaking Part 1 needs 3–4 interview questions.');
        }
        break;
      case 'long-turn':
        if (!hasText(gen.comparePrompt)) errors.push('B2 Speaking Part 2 needs comparePrompt.');
        if (!hasText(gen.photoA)) errors.push('B2 Speaking Part 2 needs photoA description.');
        if (!hasText(gen.photoB)) errors.push('B2 Speaking Part 2 needs photoB description.');
        if (!hasText(gen.partnerFollowUpQuestion)) {
          errors.push('B2 Speaking Part 2 needs partnerFollowUpQuestion.');
        }
        break;
      case 'collaborative':
        if (!hasText(gen.centralQuestion)) errors.push('B2 Speaking Part 3 needs centralQuestion.');
        if (gen.collaborativePrompts.length !== 5) {
          errors.push('B2 Speaking Part 3 needs exactly 5 collaborativePrompts.');
        }
        if (!hasText(gen.decisionQuestion)) errors.push('B2 Speaking Part 3 needs decisionQuestion.');
        break;
      case 'discussion':
        if (gen.discussionQuestions.length < 4 || gen.discussionQuestions.length > 6) {
          errors.push('B2 Speaking Part 4 needs 4–6 discussionQuestions.');
        }
        break;
      default:
        break;
    }
  }
}

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[], normalized: object }}
 */
export function validateGeneratedExamPart(slug, partNumber, generated) {
  const key = String(slug || '').toLowerCase();
  const pn = Number(partNumber);
  const errors = [];
  const warnings = [];

  let partDef =
    key === 'a2'
      ? A2_EXAM_PARTS.find((p) => p.partNumber === pn)
      : getLevelExamPartDef(key, pn);

  if (!partDef) {
    return { ok: false, errors: [`Unknown part: ${pn}`], warnings: [], normalized: generated };
  }

  const normalized = normalizeGeneratedExamPart(key, partDef, generated);

  if (key === 'a2') {
    if (!isA2GeneratedPartComplete(normalized, partDef)) {
      errors.push('Generated A2 part appears incomplete (questions, options, or script missing).');
    }
    return { ok: errors.length === 0, errors, warnings, normalized };
  }

  switch (partDef.mode) {
    case 'writing':
      validateWritingPart(key, partDef, normalized, errors, warnings);
      break;
    case 'listening':
      validateListening(partDef, normalized, errors, warnings);
      break;
    case 'speaking':
      validateSpeaking(normalized, errors, warnings, partDef);
      break;
    default:
      validateReadingUseOfEnglish(partDef, normalized, errors, warnings);
      if (key === 'b2' && partDef.partNumber === 1 && partDef.activity === 'multiple-choice-cloze') {
        validateB2Part1Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 2 && partDef.activity === 'open-cloze') {
        validateB2Part2Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 3 && partDef.activity === 'word-formation') {
        validateB2Part3Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 4 && partDef.activity === 'key-word') {
        validateB2Part4Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 5 && partDef.activity === 'multiple-choice') {
        validateB2Part5Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 7 && partDef.activity === 'multiple-matching') {
        validateB2Part7Strict(normalized, errors, warnings);
      }
      break;
  }

  const qCount = normalized.questions?.length || 0;
  const maCount = normalized.modelAnswers?.length || 0;
  if (partDef.mode === 'reading' || partDef.mode === 'use-of-english') {
    if (qCount < 1 && maCount < 1) errors.push('No scorable questions found.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    normalized,
  };
}

import { getLevelExamLabel, getLevelExamPartDef } from '@/lib/levelsExamCatalog';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import { isA2GeneratedPartComplete } from '@/lib/draloAiA2ExamPrompts';

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

  if (partDef.mode !== 'writing') {
    gen.partNumber = partDef.partNumber;
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

  // Distribución del key: un examen real reparte las letras (nunca 6+ veces la misma).
  if (keyLetters.length >= 6) {
    const counts = {};
    keyLetters.forEach((l) => {
      counts[l] = (counts[l] || 0) + 1;
    });
    const [topLetter, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topCount >= 6) {
      errors.push(`Answer key is degenerate: "${topLetter}" is correct ${topCount} times. Spread answers across A–D.`);
    } else if (topCount === 5) {
      warnings.push(`Answer key uses "${topLetter}" ${topCount} times — consider spreading answers across A–D.`);
    }
  }

  // Passage: título, texto y gaps (1)–(8) presentes y sin gaps extra.
  if (!hasText(gen.title)) errors.push('Part 1 must include a short text title.');
  const passage = String(gen.passage || '');
  if (!passage.trim()) {
    errors.push('Part 1 must include a passage.');
  } else {
    const gapNumbers = [...passage.matchAll(/\((\d+)\)\s*_+/g)].map((m) => Number(m[1]));
    for (let n = 1; n <= 8; n += 1) {
      const count = gapNumbers.filter((g) => g === n).length;
      if (count === 0) errors.push(`Part 1 passage is missing gap (${n}) ___.`);
      if (count > 1) errors.push(`Part 1 passage repeats gap (${n}) ___.`);
    }
    const extra = [...new Set(gapNumbers.filter((g) => g > 8))];
    if (extra.length) {
      errors.push(`Part 1 passage has unexpected gap numbers: ${extra.join(', ')} (only (0)–(8) allowed).`);
    }

    const wordCount = passage
      .replace(/\(\d+\)\s*_+/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    if (wordCount < 140 || wordCount > 190) {
      warnings.push(`Part 1 passage is ${wordCount} words; target is around 150–180.`);
    }
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

    if (asArray(q?.options).length > 0) {
      errors.push(`${label}: open cloze must NOT have A/B/C/D options (this is not Part 1).`);
    }
  });

  if (questions.length === 8 && seenNumbers.size === 8) {
    for (let n = 9; n <= 16; n += 1) {
      if (!seenNumbers.has(n)) errors.push(`Part 2 is missing question number ${n}.`);
    }
  }

  // Example: frase independiente con gap (0) real y respuesta de una palabra.
  const example = gen.example && typeof gen.example === 'object' ? gen.example : null;
  const exampleSentence = String(
    example?.sentence || example?.text || example?.prompt || '',
  ).trim();
  const exampleAnswer = String(example?.answer || '').trim();
  if (!example || !exampleSentence) {
    errors.push('Part 2 must include a separate example sentence (example.sentence with a (0) ___ gap).');
  } else {
    if (!/\(0\)\s*_+/.test(exampleSentence)) {
      errors.push(`Part 2 example sentence must contain a real gap "(0) ___" (got "${exampleSentence.slice(0, 80)}").`);
    }
    if (!exampleAnswer) {
      errors.push('Part 2 example must include its answer.');
    } else if (!PART2_ONE_WORD_REGEX.test(exampleAnswer)) {
      errors.push(`Part 2 example answer must be one word (got "${exampleAnswer}").`);
    }
  }

  // Answer key: una palabra exacta por pregunta 9–16.
  const modelAnswers = asArray(gen.modelAnswers);
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

  // Passage: título, gaps (9)–(16) exactos, sin (0) ni "(o)" dentro del texto.
  if (!hasText(gen.title)) errors.push('Part 2 must include a short text title.');
  const passage = String(gen.passage || '');
  if (!passage.trim()) {
    errors.push('Part 2 must include a passage.');
  } else {
    if (/\(0\)\s*(?:_+|\.{2,}|…+)/.test(passage)) {
      errors.push('Part 2 passage must NOT contain the example gap (0) — the example goes in its own section.');
    }
    if (/\(\s*[oO]\s*\)/.test(passage)) {
      errors.push('Part 2 passage contains "(o)" with the letter o — gap markers must use digits.');
    }
    const gapNumbers = [...passage.matchAll(/\((\d+)\)\s*(?:_+|\.{2,}|…+)/g)].map((m) => Number(m[1]));
    for (let n = 9; n <= 16; n += 1) {
      const count = gapNumbers.filter((g) => g === n).length;
      if (count === 0) errors.push(`Part 2 passage is missing gap (${n}) ___.`);
      if (count > 1) errors.push(`Part 2 passage repeats gap (${n}) ___.`);
    }
    const extra = [...new Set(gapNumbers.filter((g) => g < 9 || g > 16))];
    if (extra.length) {
      errors.push(`Part 2 passage has unexpected gap numbers: ${extra.join(', ')} (only (9)–(16) allowed).`);
    }

    const wordCount = passage
      .replace(/\(\d+\)\s*_+/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    if (wordCount < 140 || wordCount > 190) {
      warnings.push(`Part 2 passage is ${wordCount} words; target is around 150–180.`);
    }
  }
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
  if (partDef.activity === 'conversation' && partDef.mode === 'listening' && partDef.partNumber === 13) {
    const mcq = asArray(gen.questions).filter((q) => asArray(q.options).length >= 3);
    if (mcq.length < 7) errors.push('Listening Part 4 needs seven MCQ questions (Q24–30) with A/B/C options.');
    if (asArray(gen.optionPool).length) {
      warnings.push('Part 13 should not include an A–H matching pool (use per-question A/B/C options).');
    }
  }
  if (partDef.needsAudio && !hasText(gen.script)) {
    errors.push('Audio generation requires a script.');
  } else if (partDef.needsAudio) {
    warnings.push('Audio will be synthesized on save unless skipAudio is enabled.');
  }
}

function validateSpeaking(gen, errors) {
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
      validateSpeaking(normalized, errors);
      break;
    default:
      validateReadingUseOfEnglish(partDef, normalized, errors, warnings);
      if (key === 'b2' && partDef.partNumber === 1 && partDef.activity === 'multiple-choice-cloze') {
        validateB2Part1Strict(normalized, errors, warnings);
      }
      if (key === 'b2' && partDef.partNumber === 2 && partDef.activity === 'open-cloze') {
        validateB2Part2Strict(normalized, errors, warnings);
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

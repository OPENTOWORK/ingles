/**
 * B2 Reading & Use of English quality analysis (mechanical heuristics, no AI).
 * Used by examPartValidation.js and review scripts.
 */

export const B2_FORBIDDEN_VISIBLE_CAMBRIDGE = /\bcambridge\b/i;

export const B2_OVERUSED_NAMES = ['emma', 'emma thomson', 'emma thompson'];

export const B2_OVERUSED_TOPIC_PATTERNS = [
  /\bcareer change\b/i,
  /\bchanged career\b/i,
  /\bchanging career\b/i,
  /\bswitching career\b/i,
  /\bleft (?:her|his|their) (?:corporate|office|finance)\b/i,
];

export const PART5_QUESTION_TYPES = new Set([
  'inference',
  'detail',
  'attitude',
  'purpose',
  'reference',
  'global',
  'vocabulary',
  'opinion',
  'tone',
  'main-idea',
  'main_idea',
]);

export const PART5_ABSURD_DISTRACTOR_PATTERNS = [
  /\b(always|never|everyone|nobody|all people|no one)\b/i,
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'who', 'which', 'what', 'that', 'this', 'these', 'those', 'their', 'they',
  'them', 'with', 'from', 'into', 'about', 'when', 'where', 'while', 'because', 'although',
  'would', 'could', 'should', 'have', 'has', 'had', 'been', 'being', 'were', 'was', 'are', 'is',
  'for', 'and', 'but', 'not', 'does', 'did', 'will', 'can', 'may', 'might', 'must', 'shall',
  'than', 'then', 'also', 'just', 'more', 'most', 'some', 'such', 'other', 'after', 'before',
  'during', 'through', 'over', 'under', 'between', 'among', 'found', 'felt', 'says', 'said',
  'people', 'person', 'someone', 'something', 'anything', 'everything',
]);

const PART2_CATEGORY_PATTERNS = {
  prepositions: /\b(in|on|at|for|with|by|from|to|of|into|onto|upon|over|under|through|during|within|without|against|among|between|despite|except)\b/i,
  relatives: /\b(which|that|who|whom|whose|where|when|why|how)\b/i,
  modals: /\b(will|would|can|could|may|might|must|shall|should|ought)\b/i,
  auxiliaries: /\b(do|does|did|has|have|had|is|are|was|were|be|been|being)\b/i,
  articles: /\b(a|an|the)\b/i,
  negatives: /\b(not|no|nor|never|neither|none|nothing|nowhere|hardly|barely|scarcely)\b/i,
  connectors: /\b(although|though|while|whereas|because|since|unless|until|however|therefore|moreover|furthermore|nevertheless|meanwhile|instead|otherwise|yet|still|also|too|either|neither)\b/i,
  conditionals: /\b(if|unless|provided|whether)\b/i,
  asSoSuchEnough: /\b(as|so|such|enough|too)\b/i,
};

const PART3_SUFFIX_PATTERNS = {
  noun: /(tion|sion|ment|ness|ity|ism|ance|ence|ship|hood|dom)$/i,
  adjective: /(ful|less|ous|ive|able|ible|al|ic|ed|ing|y)$/i,
  adverb: /ly$/i,
  verb: /(ise|ize|ify|en|ate)$/i,
};

const PART3_PREFIX_PATTERNS = /^(un|dis|re|mis|over|under|out|pre|post|non|anti|de)/i;

export function countWords(text) {
  return String(text || '')
    .replace(/\(\d+\)\s*(?:_+|\.{2,}|…+)/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function normalizeForMatch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractMcqOptionText(option) {
  if (typeof option === 'string') {
    const m = option.match(/^[A-D]\)\s*(.*)$/i) || option.match(/^[A-D]\.\s*(.*)$/i);
    return (m ? m[1] : option).trim();
  }
  if (option && typeof option === 'object') {
    return String(option.text || option.label || '').trim();
  }
  return String(option || '').trim();
}

export function extractMcqLetter(option) {
  if (typeof option === 'string') {
    const m = option.match(/^([A-D])\)?/i);
    return m ? m[1].toUpperCase() : null;
  }
  if (option?.letter) return String(option.letter).toUpperCase();
  return null;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function answerLetterForQuestion(q, modelAnswers, index) {
  const byId = new Map(asArray(modelAnswers).map((m) => [String(m?.id), m]));
  const entry = byId.get(String(q?.id)) ?? modelAnswers[index];
  const fromQ = String(q?.answer ?? '').trim().toUpperCase();
  if (/^[A-D]$/.test(fromQ)) return fromQ;
  const fromM = String(entry?.answer ?? '').trim().toUpperCase();
  return /^[A-D]$/.test(fromM) ? fromM : null;
}

function significantWords(text, minLen = 4) {
  return normalizeForMatch(text)
    .split(/\s+/)
    .filter((w) => w.length >= minLen && !STOP_WORDS.has(w));
}

/** Longest shared phrase (4+ words) between option and passage. */
export function detectLiteralPart5Match(passage, correctOptionText) {
  const passNorm = normalizeForMatch(passage);
  const optWords = normalizeForMatch(correctOptionText).split(/\s+/).filter(Boolean);
  if (optWords.length < 4) return null;
  for (let len = Math.min(optWords.length, 12); len >= 4; len -= 1) {
    for (let i = 0; i <= optWords.length - len; i += 1) {
      const phrase = optWords.slice(i, i + len).join(' ');
      if (passNorm.includes(phrase)) return phrase;
    }
  }
  return null;
}

export function isAbsurdPart5Option(text) {
  return PART5_ABSURD_DISTRACTOR_PATTERNS.some((re) => re.test(text));
}

export function checkPart5LetterBalance(answers) {
  const letters = answers.filter((l) => /^[A-D]$/.test(l));
  const warnings = [];
  const errors = [];
  if (letters.length !== 6) return { warnings, errors };
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  letters.forEach((l) => {
    counts[l] += 1;
  });
  const used = Object.values(counts).filter((c) => c > 0).length;
  if (used < 3) {
    warnings.push(`Part 5 answer key uses only ${used} different letters (target: spread across A–D).`);
  }
  let consecutive = 1;
  for (let i = 1; i < letters.length; i += 1) {
    if (letters[i] === letters[i - 1]) consecutive += 1;
    else consecutive = 1;
    if (consecutive > 2) {
      errors.push(
        `Part 5 answer key has ${consecutive} consecutive "${letters[i]}" answers — max 2 consecutive same letter.`,
      );
      break;
    }
  }
  return { warnings, errors };
}

export function collectVisibleStudentText(gen, partNumber) {
  const chunks = [
    gen.partTitle,
    gen.directions,
    gen.instructions,
    gen.title,
    gen.passage,
    gen.matchingIntro,
  ];
  asArray(gen.questions).forEach((q) => {
    chunks.push(q.prompt, q.question, q.stem, q.sentence1, q.sentence2Start, q.sentence2);
    asArray(q.options).forEach((o) => chunks.push(extractMcqOptionText(o)));
  });
  asArray(gen.sections).forEach((s) => {
    chunks.push(s.name, s.title, s.text, s.body);
  });
  asArray(gen.sentencePool).forEach((s) => chunks.push(String(s)));
  if (partNumber === 3 && gen.example?.sentence) chunks.push(gen.example.sentence);
  return chunks.filter(Boolean).join('\n');
}

export function findForbiddenCambridge(gen, partNumber) {
  const blob = collectVisibleStudentText(gen, partNumber);
  return B2_FORBIDDEN_VISIBLE_CAMBRIDGE.test(blob) ? 'Student-facing content mentions "Cambridge".' : null;
}

export function findOverusedPatterns(gen) {
  const blob = normalizeForMatch(collectVisibleStudentText(gen));
  const findings = [];
  for (const name of B2_OVERUSED_NAMES) {
    if (blob.includes(name)) findings.push(`Overused name detected: "${name}".`);
  }
  for (const re of B2_OVERUSED_TOPIC_PATTERNS) {
    if (re.test(blob)) findings.push(`Overused topic pattern: ${re.source}.`);
  }
  return findings;
}

export function analyzePart5Quality(gen) {
  const errors = [];
  const warnings = [];
  const metrics = { wordCount: 0, questionTypes: [], literalMatches: [] };

  const passage = String(gen.passage || '');
  metrics.wordCount = countWords(passage);
  if (metrics.wordCount < 550) {
    errors.push(`Part 5 passage is ${metrics.wordCount} words; minimum is 550 (target 550–650).`);
  } else if (metrics.wordCount > 650) {
    errors.push(`Part 5 passage is ${metrics.wordCount} words; maximum is 650 (target 550–650).`);
  }

  const questions = asArray(gen.questions);
  const modelAnswers = asArray(gen.modelAnswers);
  const answerLetters = [];
  const PLACEHOLDER_RE = /\b(placeholder|lorem ipsum|TODO|option text|question text)\b/i;

  questions.forEach((q, i) => {
    const label = `Part 5 question ${q?.number ?? i + 1}`;
    const letter = answerLetterForQuestion(q, modelAnswers, i);
    if (!letter) errors.push(`${label}: missing valid A–D answer key.`);
    else answerLetters.push(letter);

    const stem = String(q?.prompt || q?.question || q?.stem || '').trim();
    if (!stem) errors.push(`${label}: missing question stem (prompt/question).`);
    if (PLACEHOLDER_RE.test(stem)) errors.push(`${label}: placeholder text in question stem.`);

    const opts = asArray(q.options);
    if (opts.length !== 4) errors.push(`${label}: must have exactly 4 options (got ${opts.length}).`);

    const seenOptLetters = new Set();
    opts.forEach((o, oi) => {
      const optLetter = extractMcqLetter(o) || 'ABCD'[oi];
      const t = extractMcqOptionText(o);
      if (!/^[A-D]$/.test(optLetter || '')) {
        errors.push(`${label}: option ${oi + 1} must be labelled A–D.`);
      } else if (seenOptLetters.has(optLetter)) {
        errors.push(`${label}: duplicate option letter ${optLetter}.`);
      } else {
        seenOptLetters.add(optLetter);
      }
      if (!t) errors.push(`${label}: option ${optLetter || oi + 1} is empty.`);
      if (PLACEHOLDER_RE.test(t)) errors.push(`${label}: placeholder text in option ${optLetter}.`);
      if (isAbsurdPart5Option(t)) {
        warnings.push(`${label}: option may be an absurd distractor ("${t.slice(0, 50)}").`);
      }
    });

    const qType = String(q.questionType || q.skillType || '').toLowerCase();
    if (qType) metrics.questionTypes.push(qType);
    else warnings.push(`${label}: missing questionType (inference/detail/attitude/purpose/reference/global).`);

    if (qType && !PART5_QUESTION_TYPES.has(qType)) {
      warnings.push(`${label}: unknown questionType "${qType}".`);
    }

    if (letter && passage) {
      const correctText = extractMcqOptionText(
        opts.find((o) => extractMcqLetter(o) === letter) ?? opts['ABCD'.indexOf(letter)] ?? '',
      );
      const literal = detectLiteralPart5Match(passage, correctText);
      if (literal) {
        metrics.literalMatches.push({ number: q.number, phrase: literal });
        warnings.push(
          `${label}: correct option may be solvable by word matching ("${literal.slice(0, 60)}…").`,
        );
      }
    }
  });

  const balance = checkPart5LetterBalance(answerLetters);
  warnings.push(...balance.warnings);
  errors.push(...balance.errors);

  const inferential = metrics.questionTypes.filter((t) =>
    ['inference', 'attitude', 'purpose', 'reference', 'global', 'opinion', 'tone', 'main-idea', 'main_idea'].includes(
      t,
    ),
  );
  if (questions.length === 6 && inferential.length < 2) {
    warnings.push(
      `Part 5 has only ${inferential.length} inferential/attitude/purpose/reference/global questions (target at least 2).`,
    );
  }
  const detailCount = metrics.questionTypes.filter((t) => t === 'detail').length;
  if (questions.length === 6 && detailCount >= 5) {
    warnings.push(`Part 5 looks heavily detail-based (${detailCount}/6) — soft check.`);
  }
  if (questions.length === 6 && new Set(metrics.questionTypes).size < 3 && metrics.questionTypes.length >= 4) {
    warnings.push(
      `Part 5 questionType variety is low (${[...new Set(metrics.questionTypes)].join(', ') || 'none'}) — soft check.`,
    );
  }

  warnings.push(...findOverusedPatterns(gen));
  const cambridge = findForbiddenCambridge(gen, 5);
  if (cambridge) errors.push(cambridge);

  return { errors, warnings, metrics };
}

export function computeSectionPairOverlap(sections) {
  const texts = sections.map((s) => new Set(significantWords(s.text || s.body || '')));
  const pairs = [];
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) {
      const shared = [...texts[i]].filter((w) => texts[j].has(w));
      pairs.push({ i, j, sharedCount: shared.length, shared: shared.slice(0, 8) });
    }
  }
  return pairs;
}

export function detectPart7KeywordMatch(prompt, sections) {
  const promptWords = significantWords(prompt, 5);
  if (promptWords.length < 2) return null;
  const hits = sections.map((s, idx) => {
    const text = normalizeForMatch(s.text || s.body || '');
    const matched = promptWords.filter((w) => text.includes(w));
    return { idx, letter: s.letter, matched, ratio: matched.length / promptWords.length };
  }).filter((h) => h.ratio >= 0.5);
  if (hits.length === 1 && hits[0].ratio >= 0.6) return hits[0];
  return null;
}

export function analyzePart7Quality(gen) {
  const errors = [];
  const warnings = [];
  const metrics = { sectionWordCounts: [], overlaps: [], keywordMatches: [] };

  const sections = asArray(gen.sections);
  if (sections.length !== 4) {
    errors.push(`Part 7 must have exactly 4 sections (got ${sections.length}).`);
  }

  sections.forEach((s, i) => {
    const wc = countWords(s.text || s.body || '');
    metrics.sectionWordCounts.push(wc);
    const label = `Part 7 section ${s.letter || i + 1}`;
    if (wc < 120) errors.push(`${label} is ${wc} words; minimum is 120 (target 120–150).`);
    else if (wc > 150) warnings.push(`${label} is ${wc} words; target is 120–150.`);
  });

  metrics.overlaps = computeSectionPairOverlap(sections);
  const weakOverlap = metrics.overlaps.every((p) => p.sharedCount < 3);
  if (sections.length === 4 && weakOverlap) {
    warnings.push('Part 7 sections show weak lexical overlap — matching may be too easy without nuanced distractors.');
  }

  const questions = asArray(gen.questions);
  questions.forEach((q, i) => {
    const label = `Part 7 question ${q?.number ?? i + 1}`;
    const prompt = String(q.prompt || q.stem || '').trim();
    if (!/^who\b/i.test(prompt)) {
      errors.push(`${label}: prompt must start with "Who" (got "${prompt.slice(0, 40)}").`);
    }
    const kw = detectPart7KeywordMatch(prompt, sections);
    if (kw) {
      metrics.keywordMatches.push({ number: q.number, section: kw.letter, words: kw.matched });
      warnings.push(`${label}: may be solvable by keyword matching in section ${kw.letter}.`);
    }
  });

  warnings.push(...findOverusedPatterns(gen));
  const cambridge = findForbiddenCambridge(gen, 7);
  if (cambridge) errors.push(cambridge);

  return { errors, warnings, metrics };
}

export function classifyPart2AnswerCategories(answers) {
  const found = new Set();
  answers.forEach((word) => {
    const w = String(word || '').toLowerCase();
    Object.entries(PART2_CATEGORY_PATTERNS).forEach(([cat, re]) => {
      if (re.test(w)) found.add(cat);
    });
  });
  return found;
}

export function classifyPart3Derivation(stem, answer) {
  const s = String(stem || '').toUpperCase();
  const a = String(answer || '').toLowerCase();
  const tags = [];
  if (PART3_PREFIX_PATTERNS.test(a) && !PART3_PREFIX_PATTERNS.test(s.toLowerCase())) tags.push('prefix');
  Object.entries(PART3_SUFFIX_PATTERNS).forEach(([kind, re]) => {
    if (re.test(a)) tags.push(kind);
  });
  if (a.endsWith('ly')) tags.push('adverb');
  return tags;
}

export function countPart4AnswerWords(answer) {
  return String(answer || '').trim().split(/\s+/).filter(Boolean).length;
}

export function keywordInPart4Answer(keyword, answer) {
  const kw = normalizeForMatch(keyword);
  const ans = normalizeForMatch(answer);
  if (!kw || !ans) return false;
  return ans.includes(kw);
}

export function detectRepeatedNamesAcrossExams(examGens) {
  const nameCounts = new Map();
  examGens.forEach(({ examSlot, partNumber, gen }) => {
    if (partNumber !== 7) return;
    asArray(gen.sections).forEach((s) => {
      const name = normalizeForMatch(s.name || '');
      if (!name) return;
      const key = name.split(/\s+/)[0];
      if (key.length < 3) return;
      nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
    });
  });
  const repeated = [...nameCounts.entries()].filter(([, c]) => c > 1);
  return repeated.map(([name, count]) => ({ name, count }));
}

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

/** A–G sentence-pool helpers (B2 Part 6 gapped text). */
export function extractPoolSentenceText(option) {
  if (typeof option === 'string') {
    const m =
      option.match(/^[A-G]\)\s*(.*)$/i) ||
      option.match(/^[A-G]\.\s*(.*)$/i) ||
      option.match(/^[A-G]\s+(.*)$/i);
    return (m ? m[1] : option).trim();
  }
  if (option && typeof option === 'object') {
    return String(option.text || option.sentence || option.label || '').trim();
  }
  return String(option || '').trim();
}

export function extractPoolLetter(option) {
  if (typeof option === 'string') {
    const m = option.match(/^([A-G])(?:\)|\.|[\s])/i) || option.match(/^([A-G])$/i);
    return m ? m[1].toUpperCase() : null;
  }
  if (option?.letter) {
    const L = String(option.letter).replace(/[^A-Ga-g]/g, '').charAt(0).toUpperCase();
    return /^[A-G]$/.test(L) ? L : null;
  }
  return null;
}

export function isCompleteSentenceText(text) {
  const t = String(text || '').trim();
  if (t.length < 12) return false;
  if (!/[.!?]"?$/.test(t)) return false;
  return countWords(t) >= 5;
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

export function significantWords(text, minLen = 4) {
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

/** Distractor uses vocabulary or ideas traceable to the passage (v1.1). */
export function isPart5DistractorGrounded(passage, optionText) {
  const words = significantWords(optionText, 4);
  if (!words.length) return false;
  const p = normalizeForMatch(passage);
  const hits = words.filter((w) => p.includes(w)).length;
  return hits >= 1;
}

/** Verify textual reference phrases against passage layout (v1.1). */
export function checkPart5ReferenceIntegrity(passage, questionText, evidenceText) {
  const q = String(questionText || '').toLowerCase();
  const paras = String(passage || '')
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paras.length) return null;
  const evidenceNorm = normalizeForMatch(evidenceText).slice(0, 60);
  if (!evidenceNorm || evidenceNorm.length < 12) return null;

  if (/\blast paragraph\b/.test(q)) {
    const last = normalizeForMatch(paras[paras.length - 1]);
    if (!last.includes(evidenceNorm.slice(0, 24))) {
      return 'question cites "last paragraph" but evidence does not appear there';
    }
  }
  if (/\bfirst paragraph\b/.test(q)) {
    const first = normalizeForMatch(paras[0]);
    if (!first.includes(evidenceNorm.slice(0, 24))) {
      return 'question cites "first paragraph" but evidence does not appear there';
    }
  }
  return null;
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
  const qualityFails = [];
  const warnings = [];
  const metrics = { wordCount: 0, questionTypes: [], literalMatches: [] };

  const passage = String(gen.passage || '');
  metrics.wordCount = countWords(passage);
  if (metrics.wordCount < 550) {
    errors.push(
      `Part 5 passage is ${metrics.wordCount} words; minimum is 550 (target 550–650).`,
    );
  } else if (metrics.wordCount > 650) {
    errors.push(
      `Part 5 passage is ${metrics.wordCount} words; maximum is 650 (target 550–650).`,
    );
  } else if (metrics.wordCount < 560) {
    warnings.push(
      `Part 5 passage is ${metrics.wordCount} words; target is 550–650 (prefer ~580–620).`,
    );
  } else if (metrics.wordCount > 640) {
    warnings.push(
      `Part 5 passage is ${metrics.wordCount} words; target is 550–650 (prefer ~580–620).`,
    );
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

      const distractors = opts
        .filter((o) => extractMcqLetter(o) !== letter)
        .map((o) => extractMcqOptionText(o))
        .filter(Boolean);
      const grounded = distractors.filter((t) => isPart5DistractorGrounded(passage, t)).length;
      if (distractors.length === 3 && grounded < 2) {
        qualityFails.push(
          `${label}: distractors are weak — fewer than 2 of 3 wrong options are grounded in passage information (P5-WEAK-DISTRACTOR).`,
        );
      }
    }

    const refIssue = checkPart5ReferenceIntegrity(passage, stem, String(q?.evidence || q?.rationale || ''));
    if (refIssue) {
      errors.push(`${label}: ${refIssue} (P5-BAD-REFERENCE).`);
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

  return { errors, qualityFails, warnings, metrics };
}

const PART6_COHESION_HINTS =
  /\b(this|these|that|those|such|however|although|though|yet|nevertheless|therefore|thus|consequently|meanwhile|instead|for example|for instance|in addition|moreover|furthermore|similarly|likewise|as a result|because|since|while|whereas|then|next|later|previously|above all|after all)\b/i;

const PART6_PLACEHOLDER_RE =
  /\b(placeholder|lorem ipsum|TODO|option text|question text|extra sentence\.\.\.)\b/i;

function answerLetterForPart6Gap(q, modelAnswers, index) {
  const fromQ = String(q?.answer || '').trim().toUpperCase();
  if (/^[A-G]$/.test(fromQ)) return fromQ;
  const byId = modelAnswers.find((m) => String(m?.id) === String(q?.id));
  const byNum = modelAnswers.find((m) => Number(m?.number) === Number(q?.number));
  const entry = byId || byNum || modelAnswers[index];
  const letter = String(entry?.answer || '').trim().toUpperCase();
  return /^[A-G]$/.test(letter) ? letter : null;
}

function gapContextSnippet(passage, gapNumber, radius = 90) {
  const re = new RegExp(`\\(${gapNumber}\\)`, 'i');
  const m = String(passage || '').match(re);
  if (!m || m.index == null) return '';
  const start = Math.max(0, m.index - radius);
  const end = Math.min(passage.length, m.index + String(m[0]).length + radius);
  return passage.slice(start, end);
}

function detectPart6KeywordOverlap(context, sentenceText) {
  const ctxWords = significantWords(context, 5);
  const sentWords = significantWords(sentenceText, 5);
  if (ctxWords.length < 2 || sentWords.length < 2) return null;
  const shared = sentWords.filter((w) => ctxWords.includes(w));
  if (shared.length >= 3) return shared.slice(0, 4).join(', ');
  return null;
}

/**
 * Mechanical + soft heuristic checks for B2 Part 6 gapped text.
 */
export function analyzePart6Quality(gen) {
  const errors = [];
  const warnings = [];
  const metrics = {
    wordCount: 0,
    gapMarkers: [],
    usedLetters: [],
    unusedLetters: [],
    poolWordCounts: [],
  };

  const passage = String(gen.passage || '');
  metrics.wordCount = countWords(passage);
  if (metrics.wordCount < 350) {
    errors.push(`Part 6 passage is ${metrics.wordCount} words; minimum is 350 (target 500–600).`);
  } else if (metrics.wordCount < 500) {
    warnings.push(
      `Part 6 passage is ${metrics.wordCount} words; target is 500–600 (accepted from 350 for generation).`,
    );
  } else if (metrics.wordCount > 650) {
    errors.push(`Part 6 passage is ${metrics.wordCount} words; maximum is 650 (target 500–600).`);
  } else if (metrics.wordCount > 600) {
    warnings.push(
      `Part 6 passage is ${metrics.wordCount} words; target is 500–600 (accepted up to 650 for generation).`,
    );
  }

  if (!hasTextLocal(gen.title)) errors.push('Part 6 must include a passage title.');
  if (!hasTextLocal(passage)) errors.push('Part 6 must include a passage.');

  for (let n = 37; n <= 42; n += 1) {
    const re = new RegExp(`\\(${n}\\)`);
    if (!re.test(passage)) errors.push(`Part 6 passage is missing gap marker (${n}).`);
    else metrics.gapMarkers.push(n);
  }

  const highGaps = [...passage.matchAll(/\((\d{2,})\)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 43);
  if (highGaps.length) {
    errors.push(`Part 6 passage must not contain gap markers 43+ (found ${[...new Set(highGaps)].join(', ')}).`);
  }

  const wrongLowGaps = [...passage.matchAll(/\((\d{2,})\)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 31 && n <= 36);
  if (wrongLowGaps.length) {
    errors.push(
      `Part 6 passage must use gaps 37–42 only (found legacy markers ${[...new Set(wrongLowGaps)].join(', ')}).`,
    );
  }

  let pool = asArray(gen.sentencePool);
  if (!pool.length && asArray(gen.options).length) pool = asArray(gen.options);

  if (pool.length !== 7) {
    errors.push(`Part 6 must have exactly 7 sentencePool options A–G (got ${pool.length}).`);
  }

  const poolByLetter = {};
  const seenPoolLetters = new Set();
  pool.forEach((item, i) => {
    const letter = extractPoolLetter(item) || 'ABCDEFG'[i];
    const text = extractPoolSentenceText(item);
    const label = `Part 6 option ${letter || i + 1}`;
    if (!/^[A-G]$/.test(letter || '')) {
      errors.push(`${label}: letter must be A–G.`);
    } else if (seenPoolLetters.has(letter)) {
      errors.push(`${label}: duplicate option letter ${letter}.`);
    } else {
      seenPoolLetters.add(letter);
      poolByLetter[letter] = text;
    }
    if (!text) errors.push(`${label}: empty sentence text.`);
    if (PART6_PLACEHOLDER_RE.test(text)) errors.push(`${label}: placeholder text.`);
    if (text && !isCompleteSentenceText(text)) {
      errors.push(`${label}: must be a complete sentence.`);
    }
    const wc = countWords(text);
    metrics.poolWordCounts.push({ letter, wc });
    if (wc > 0 && (wc < 6 || wc > 40)) {
      warnings.push(`${label}: unusual length (${wc} words) — soft check.`);
    }
  });

  for (const L of 'ABCDEFG') {
    if (!seenPoolLetters.has(L) && pool.length === 7) {
      errors.push(`Part 6 sentencePool is missing option ${L}.`);
    }
  }

  const questions = asArray(gen.questions);
  const modelAnswers = asArray(gen.modelAnswers);
  const answerLetters = [];

  questions.forEach((q, i) => {
    const label = `Part 6 gap ${q?.number ?? i + 1}`;
    if (asArray(q?.options).length > 0) {
      // Per-question A–D options are wrong for Part 6; warn only if they look like full MCQ stems.
      const looksLikeMcq = asArray(q.options).some((o) => extractMcqLetter(o) && extractMcqOptionText(o).length > 8);
      if (looksLikeMcq) {
        warnings.push(`${label}: has per-question options; Part 6 should use a global A–G sentencePool only.`);
      }
    }
    const letter = answerLetterForPart6Gap(q, modelAnswers, i);
    if (!letter) errors.push(`${label}: missing valid A–G answer key.`);
    else answerLetters.push(letter);

    if (letter && poolByLetter[letter]) {
      const ctx = gapContextSnippet(passage, Number(q?.number) || 37 + i);
      const overlap = detectPart6KeywordOverlap(ctx, poolByLetter[letter]);
      if (overlap) {
        warnings.push(
          `${label}: correct sentence may rely on keyword overlap with nearby text (${overlap}) — soft check.`,
        );
      }
      if (!PART6_COHESION_HINTS.test(`${ctx} ${poolByLetter[letter]}`)) {
        warnings.push(`${label}: weak cohesion clues near gap — soft check.`);
      }
    }
  });

  // Prefer modelAnswers length when questions omit answers.
  if (answerLetters.length === 0 && modelAnswers.length) {
    modelAnswers.forEach((m, i) => {
      const letter = String(m?.answer || '').trim().toUpperCase();
      if (!/^[A-G]$/.test(letter)) {
        errors.push(`Part 6 model answer ${i + 1}: must be A–G (got "${m?.answer}").`);
      } else {
        answerLetters.push(letter);
      }
    });
  } else {
    modelAnswers.forEach((m, i) => {
      const letter = String(m?.answer || '').trim().toUpperCase();
      if (letter && !/^[A-G]$/.test(letter)) {
        errors.push(`Part 6 model answer ${i + 1}: must be A–G (got "${m?.answer}").`);
      }
    });
  }

  metrics.usedLetters = answerLetters;
  if (answerLetters.length === 6) {
    const unique = new Set(answerLetters);
    if (unique.size !== 6) {
      errors.push(
        `Part 6 answer key must use 6 different letters (got ${answerLetters.join(', ')} — duplicates).`,
      );
    }
    const unused = [...'ABCDEFG'].filter((L) => !unique.has(L));
    metrics.unusedLetters = unused;
    if (unused.length !== 1) {
      errors.push(
        `Part 6 must leave exactly one unused option (extra sentence); unused=[${unused.join(',') || 'none'}].`,
      );
    }
  } else if (questions.length === 6 || modelAnswers.length === 6) {
    errors.push(`Part 6 answer key must have exactly 6 A–G letters (got ${answerLetters.length}).`);
  }

  // Soft: too many gaps at paragraph endings (gap as last content before blank line / end).
  const paraEndGaps = [...passage.matchAll(/\(\d{2}\)\s*(?:_{2,}|\.{2,}|…+)?\s*(?:\n\s*\n|$)/g)];
  if (paraEndGaps.length >= 5) {
    warnings.push(
      `Part 6 has ${paraEndGaps.length} gaps that look like paragraph endings — prefer some mid-paragraph gaps.`,
    );
  }

  const cohesionHits = answerLetters.filter((L) => PART6_COHESION_HINTS.test(poolByLetter[L] || '')).length;
  if (answerLetters.length === 6 && cohesionHits < 2) {
    warnings.push(
      `Part 6 options show little cohesive-device variety in correct sentences (${cohesionHits}/6) — soft check.`,
    );
  }

  if (PART6_PLACEHOLDER_RE.test(passage) || PART6_PLACEHOLDER_RE.test(String(gen.title || ''))) {
    errors.push('Part 6 contains placeholder text.');
  }

  warnings.push(...findOverusedPatterns(gen));
  const cambridge = findForbiddenCambridge(gen, 6);
  if (cambridge) errors.push(cambridge);

  return { errors, warnings, metrics };
}

function hasTextLocal(value) {
  return String(value || '').trim().length > 0;
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

const PART7_PLACEHOLDER_RE = /\b(placeholder|lorem ipsum|TODO|question text|option text)\b/i;

function answerLetterForPart7(q, modelAnswers, index) {
  const fromQ = String(q?.answer || '').trim().toUpperCase();
  if (/^[A-D]$/.test(fromQ)) return fromQ;
  const byId = modelAnswers.find((m) => String(m?.id) === String(q?.id));
  const byNum = modelAnswers.find((m) => Number(m?.number) === Number(q?.number));
  const entry = byId || byNum || modelAnswers[index];
  const letter = String(entry?.answer || '').trim().toUpperCase();
  return /^[A-D]$/.test(letter) ? letter : null;
}

export function analyzePart7Quality(gen) {
  const errors = [];
  const warnings = [];
  const metrics = {
    sectionWordCounts: [],
    overlaps: [],
    keywordMatches: [],
    answerLetters: [],
    letterCounts: { A: 0, B: 0, C: 0, D: 0 },
  };

  let sections = asArray(gen.sections);
  if (!sections.length && asArray(gen.texts).length) sections = asArray(gen.texts);

  if (sections.length !== 4) {
    errors.push(`Part 7 must have exactly 4 sections (got ${sections.length}).`);
  }

  const seenLetters = new Set();
  sections.forEach((s, i) => {
    const letter = String(s.letter || s.id || 'ABCD'[i] || '')
      .replace(/[^A-Da-d]/g, '')
      .charAt(0)
      .toUpperCase();
    const text = String(s.text || s.body || '').trim();
    const name = String(s.name || s.title || '').trim();
    const wc = countWords(text);
    metrics.sectionWordCounts.push({ letter, wc });
    const label = `Part 7 section ${letter || i + 1}`;

    if (!/^[A-D]$/.test(letter)) {
      errors.push(`${label}: letter must be A–D.`);
    } else if (seenLetters.has(letter)) {
      errors.push(`${label}: duplicate section letter ${letter}.`);
    } else {
      seenLetters.add(letter);
    }

    if (!name) warnings.push(`${label}: missing person name — soft check.`);
    if (!text) errors.push(`${label}: empty text.`);
    if (PART7_PLACEHOLDER_RE.test(text) || PART7_PLACEHOLDER_RE.test(name)) {
      errors.push(`${label}: placeholder text.`);
    }
    if (wc < 100) errors.push(`${label} is ${wc} words; minimum is 100 (target 120–150).`);
    else if (wc < 120) {
      warnings.push(`${label} is ${wc} words; target is 120–150 (accepted from 100 for generation).`);
    } else if (wc > 170) {
      errors.push(`${label} is ${wc} words; maximum is 170 (target 120–150).`);
    } else if (wc > 150) {
      warnings.push(`${label} is ${wc} words; target is 120–150 (accepted up to 170 for generation).`);
    }
  });

  for (const L of 'ABCD') {
    if (sections.length === 4 && !seenLetters.has(L)) {
      errors.push(`Part 7 is missing section ${L}.`);
    }
  }

  metrics.overlaps = computeSectionPairOverlap(sections);
  const weakOverlap = metrics.overlaps.every((p) => p.sharedCount < 3);
  if (sections.length === 4 && weakOverlap) {
    warnings.push(
      'Part 7 sections show weak lexical overlap — matching may be too easy without nuanced distractors.',
    );
  }

  const questions = asArray(gen.questions);
  const modelAnswers = asArray(gen.modelAnswers);
  const answerLetters = [];

  questions.forEach((q, i) => {
    const label = `Part 7 question ${q?.number ?? i + 1}`;
    const prompt = String(q.prompt || q.question || q.stem || '').trim();
    if (!prompt) errors.push(`${label}: missing question stem (prompt/question).`);
    if (PART7_PLACEHOLDER_RE.test(prompt)) errors.push(`${label}: placeholder text in stem.`);
    if (prompt && !/^who\b/i.test(prompt)) {
      errors.push(`${label}: prompt must start with "Who" (got "${prompt.slice(0, 40)}").`);
    }
    const letter = answerLetterForPart7(q, modelAnswers, i);
    if (!letter) errors.push(`${label}: missing valid A–D answer key.`);
    else {
      answerLetters.push(letter);
      metrics.letterCounts[letter] += 1;
    }

    const kw = detectPart7KeywordMatch(prompt, sections);
    if (kw) {
      metrics.keywordMatches.push({ number: q.number, section: kw.letter, words: kw.matched });
      warnings.push(`${label}: may be solvable by keyword matching in section ${kw.letter}.`);
    }

    // Soft: stem shares a long phrase with a section (copied wording).
    if (prompt.length >= 24) {
      const stemNorm = normalizeForMatch(prompt).replace(/^who\s+/, '');
      const copied = sections.some((s) => {
        const t = normalizeForMatch(s.text || s.body || '');
        return stemNorm.length >= 18 && t.includes(stemNorm.slice(0, Math.min(40, stemNorm.length)));
      });
      if (copied) warnings.push(`${label}: stem may copy wording from a text — soft check.`);
    }
  });

  metrics.answerLetters = answerLetters;
  if (answerLetters.length === 10) {
    const used = new Set(answerLetters);
    for (const L of 'ABCD') {
      if (!used.has(L)) {
        warnings.push(`Part 7 answer key never uses section ${L} — soft check (normally use all four).`);
      }
    }
    for (const L of 'ABCD') {
      if (metrics.letterCounts[L] >= 6) {
        errors.push(
          `Part 7 answer key uses letter ${L} ${metrics.letterCounts[L]} times — max 5 without strong justification.`,
        );
      } else if (metrics.letterCounts[L] >= 5) {
        warnings.push(`Part 7 answer key leans heavily on ${L} (${metrics.letterCounts[L]}/10) — soft check.`);
      }
    }
  }

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

/** Longitudinal control metadata for Part 3 items (v1.1.1). */
export function derivePart3TransformationFamily(stem, answer) {
  const s = String(stem || '').toUpperCase();
  const a = String(answer || '').toLowerCase();
  if (!s || !a) return 'unknown';
  if (s.toLowerCase() === a) return 'no_transform';
  const tags = classifyPart3Derivation(stem, answer);
  if (tags.includes('prefix')) return 'prefix';
  if (/^(un|dis|mis|non)/i.test(a)) return 'negative';
  if (tags.includes('adverb')) return 'adverb';
  if (tags.includes('noun')) return 'noun';
  if (tags.includes('adjective')) return 'adjective';
  if (tags.includes('verb')) return 'verb';
  return tags[0] || 'other';
}

/** Deterministic: CAPITAL stem visibly jammed BEFORE gap marker (not canonical (N) ___ (STEM)). */
export function detectPart3StemForcing(passage, stem, gapNumber) {
  if (!stem || !gapNumber) return false;
  const escaped = String(stem).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Forced: stem glued immediately before (N) e.g. "ADAPT (17) ___" — not "(17) ___ (ADAPT)".
  const stemBeforeGap = new RegExp(`\\b${escaped}\\b\\s*\\(${gapNumber}\\)`, 'i');
  if (stemBeforeGap.test(passage)) return true;
  // Forced: gap marker without blank before stem e.g. "(17) (ADAPT)" skipping ___.
  const gapWithoutBlank = new RegExp(
    `\\(${gapNumber}\\)(?!\\s*(?:_+|\\.{2,}|…+))\\s*\\(${escaped}\\)`,
    'i',
  );
  return gapWithoutBlank.test(passage);
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

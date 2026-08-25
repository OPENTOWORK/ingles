/**
 * Part 6 validators — v1.1.1 severity split.
 * HARD_FAIL: only objectively demonstrable (duplicate in passage, reconstruction duplicate).
 * QUALITY_FAIL: heuristic cohesion / multifit / unused-fit (adversarial review).
 */
import {
  extractPoolLetter,
  extractPoolSentenceText,
  normalizeForMatch,
  significantWords,
  countWords,
} from '@/lib/b2RuoeExamQuality';
import { createFinding, partitionFindings } from '@/lib/ruoeValidationFindings';

const COHESION_HINTS =
  /\b(this|these|that|those|such|however|although|though|yet|nevertheless|therefore|thus|consequently|meanwhile|instead|for example|for instance|in addition|moreover|furthermore|similarly|likewise|as a result|because|since|while|whereas|then|next|later|previously|after all|they|he|she|it|we|their|his|her)\b/i;

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function gapContextSnippet(passage, gapNumber, radius = 120) {
  const re = new RegExp(`\\(${gapNumber}\\)`, 'i');
  const m = String(passage || '').match(re);
  if (!m || m.index == null) return { before: '', after: '' };
  const idx = m.index;
  const before = String(passage).slice(Math.max(0, idx - radius), idx);
  const after = String(passage).slice(idx + m[0].length, idx + m[0].length + radius);
  return { before, after };
}

function normalizeSentence(text) {
  return normalizeForMatch(text).replace(/\s+/g, ' ').trim();
}

/** P6-H03: no option text may remain verbatim in the gapped passage. */
export function findPart6OptionsDuplicatedInPassage(passage, pool) {
  const duplicates = [];
  const normPassage = normalizeSentence(passage);
  pool.forEach((item, i) => {
    const letter = extractPoolLetter(item) || String.fromCharCode(65 + i);
    const text = extractPoolSentenceText(item);
    const norm = normalizeSentence(text);
    if (!norm || norm.length < 12) return;
    if (normPassage.includes(norm)) {
      duplicates.push({ letter, text: text.slice(0, 100) });
    } else {
      const words = norm.split(/\s+/).filter((w) => w.length >= 4);
      if (words.length >= 5) {
        const chunk = words.slice(0, 6).join(' ');
        if (normPassage.includes(chunk)) {
          duplicates.push({ letter, text: text.slice(0, 100), partial: chunk });
        }
      }
    }
  });
  return duplicates;
}

function cohesionScore(contextBefore, contextAfter, sentence) {
  const combined = `${contextBefore} ${contextAfter}`;
  const sent = String(sentence || '');
  let score = 0;
  if (COHESION_HINTS.test(sent)) score += 2;
  const ctxWords = new Set(significantWords(combined, 4));
  const sentWords = significantWords(sent, 4);
  const overlap = sentWords.filter((w) => ctxWords.has(w)).length;
  score += overlap;
  return score;
}

/** Heuristic multifit: option scores highly for more than one gap (P6-H04/H05). */
export function detectPart6Multifit(gen) {
  const passage = String(gen?.passage || '');
  const pool = asArray(gen.sentencePool).length ? asArray(gen.sentencePool) : asArray(gen.options);
  const poolByLetter = {};
  pool.forEach((item, i) => {
    const letter = extractPoolLetter(item) || String.fromCharCode(65 + i);
    poolByLetter[letter] = extractPoolSentenceText(item);
  });

  const gaps = [37, 38, 39, 40, 41, 42];
  const scoresByOption = {};
  for (const letter of Object.keys(poolByLetter)) {
    scoresByOption[letter] = [];
    gaps.forEach((n) => {
      const { before, after } = gapContextSnippet(passage, n);
      const score = cohesionScore(before, after, poolByLetter[letter]);
      scoresByOption[letter].push({ gap: n, score });
    });
  }

  const multifit = [];
  for (const [letter, scores] of Object.entries(scoresByOption)) {
    const strong = scores.filter((s) => s.score >= 4);
    if (strong.length >= 2) {
      multifit.push({ letter, gaps: strong.map((s) => s.gap), scores: strong });
    }
  }
  return multifit;
}

export function reconstructPart6Passage(passage, poolByLetter, answersByGap) {
  let text = String(passage || '');
  for (const [gapNum, letter] of Object.entries(answersByGap)) {
    const sentence = poolByLetter[letter] || '';
    if (!sentence) continue;
    text = text.replace(new RegExp(`\\(${gapNum}\\)\\s*(?:_{2,}|\\.\\.\\.|…+)?`, 'i'), `${sentence} `);
  }
  return text.replace(/\s+/g, ' ').trim();
}

/** Unused option should not fully fit any gap (P6-H06). */
export function detectPart6UnusedFitsGap(gen, unusedLetter) {
  const passage = String(gen?.passage || '');
  const pool = asArray(gen.sentencePool).length ? asArray(gen.sentencePool) : asArray(gen.options);
  const unusedText = pool.find((p) => extractPoolLetter(p) === unusedLetter);
  const sentence = extractPoolSentenceText(unusedText || '');
  if (!sentence) return [];

  const fits = [];
  for (let n = 37; n <= 42; n += 1) {
    const { before, after } = gapContextSnippet(passage, n);
    const score = cohesionScore(before, after, sentence);
    if (score >= 5) fits.push({ gap: n, score });
  }
  return fits;
}

/** Soft: pool sentences too short or generic for Cambridge-like gapped text. */
export function analyzePart6PoolDevelopment(pool) {
  const issues = [];
  const GENERIC_RE =
    /^(this (has|is)|that (is|was)|it (is|was)|there (is|are)|such (efforts|changes)|as a result)\b/i;
  pool.forEach((item, i) => {
    const letter = extractPoolLetter(item) || String.fromCharCode(65 + i);
    const text = extractPoolSentenceText(item);
    const wc = countWords(text);
    if (wc > 0 && wc < 10) {
      issues.push({
        letter,
        rule_id: 'P6-SHORT-OPTION',
        wc,
        reason: `Option ${letter} is only ${wc} words — too short for a developed removed sentence.`,
      });
    } else if (wc >= 10 && wc < 12 && GENERIC_RE.test(text)) {
      issues.push({
        letter,
        rule_id: 'P6-GENERIC-OPTION',
        wc,
        reason: `Option ${letter} looks generic/telegraphic (${wc} words) with weak cohesion potential.`,
      });
    }
  });
  return issues;
}

/**
 * @returns {{ hardFails: string[], qualityFails: string[], warnings: string[], findings: object[], metrics: object }}
 */
export function validatePart6HardRules(gen) {
  const findings = [];
  const metrics = { duplicates: [], multifit: [], unusedFits: [], poolDevIssues: [] };

  const passage = String(gen?.passage || '');
  const pool = asArray(gen.sentencePool).length ? asArray(gen.sentencePool) : asArray(gen.options);
  const poolByLetter = {};
  pool.forEach((item, i) => {
    const letter = extractPoolLetter(item) || String.fromCharCode(65 + i);
    poolByLetter[letter] = extractPoolSentenceText(item);
  });

  const duplicates = findPart6OptionsDuplicatedInPassage(passage, pool);
  metrics.duplicates = duplicates;
  if (duplicates.length) {
    findings.push(
      createFinding({
        rule_id: 'P6-H03',
        severity: 'HARD_FAIL',
        location: 'sentencePool',
        evidence: duplicates.map((d) => d.letter).join(','),
        reason: `${duplicates.length} option(s) still appear verbatim in the gapped passage.`,
        recommended_local_action: 'Physically remove the six sentences before inserting gaps (Architecture v2).',
      }),
    );
  }

  const poolDevIssues = analyzePart6PoolDevelopment(pool);
  metrics.poolDevIssues = poolDevIssues;
  poolDevIssues.forEach((issue) => {
    findings.push(
      createFinding({
        rule_id: issue.rule_id,
        severity: 'QUALITY_FAIL',
        location: `option ${issue.letter}`,
        evidence: `${issue.wc} words`,
        reason: issue.reason,
        recommended_local_action: 'Rewrite as a fuller developed sentence with clear discourse links.',
      }),
    );
  });

  const multifit = detectPart6Multifit(gen);
  metrics.multifit = multifit;
  multifit.forEach((m) => {
    findings.push(
      createFinding({
        rule_id: 'TEST-P6-MULTIFIT',
        severity: 'QUALITY_FAIL',
        location: `option ${m.letter}`,
        evidence: `gaps ${m.gaps.join(',')}`,
        reason: `Option may fully fit multiple gaps (heuristic cohesion score).`,
        recommended_local_action: 'Regenerate cohesion opportunities or unused distractor; run AI adversarial review.',
      }),
    );
  });

  const modelAnswers = asArray(gen.modelAnswers);
  const answerLetters = modelAnswers
    .map((m) => String(m?.answer || '').trim().toUpperCase())
    .filter((l) => /^[A-G]$/.test(l));
  const unused = [...'ABCDEFG'].filter((L) => !answerLetters.includes(L));
  if (unused.length === 1) {
    const fits = detectPart6UnusedFitsGap(gen, unused[0]);
    metrics.unusedFits = fits;
    if (fits.length >= 1 && fits[0].score >= 6) {
      findings.push(
        createFinding({
          rule_id: 'P6-H06',
          severity: 'QUALITY_FAIL',
          location: `unused ${unused[0]}`,
          evidence: `gap ${fits[0].gap}, score ${fits[0].score}`,
          reason: 'Unused option appears to fit a gap fully (heuristic).',
          recommended_local_action: 'Rewrite unused sentence so it fails cohesion in every gap.',
        }),
      );
    }
  }

  if (answerLetters.length === 6 && !duplicates.length) {
    const answersByGap = {};
    modelAnswers.forEach((m) => {
      if (m?.number != null && m?.answer) answersByGap[m.number] = String(m.answer).toUpperCase();
    });
    const reconstructed = reconstructPart6Passage(passage, poolByLetter, answersByGap);
    const norm = normalizeSentence(reconstructed);
    for (const letter of answerLetters) {
      const s = normalizeSentence(poolByLetter[letter] || '');
      if (s.length > 20) {
        const first = norm.indexOf(s);
        const last = norm.lastIndexOf(s);
        if (first >= 0 && last > first) {
          findings.push(
            createFinding({
              rule_id: 'P6-H08',
              severity: 'HARD_FAIL',
              location: `option ${letter}`,
              evidence: 'duplicate sentence in reconstruction',
              reason: 'Reconstructed article contains duplicated option sentence.',
              recommended_local_action: 'Remove duplicate sentence from passage or change option set.',
            }),
          );
        }
      }
    }
  }

  modelAnswers.forEach((m) => {
    const gap = Number(m?.number);
    const letter = String(m?.answer || '').trim().toUpperCase();
    if (!gap || !poolByLetter[letter]) return;
    const { before, after } = gapContextSnippet(passage, gap);
    const score = cohesionScore(before, after, poolByLetter[letter]);
    if (score < 2) {
      findings.push(
        createFinding({
          rule_id: 'P6-H07',
          severity: 'QUALITY_FAIL',
          location: `gap (${gap})`,
          evidence: `cohesion score ${score}`,
          reason: 'Correct option shows weak backward/forward cohesion clues (heuristic).',
          recommended_local_action: 'Improve discourse links or run AI adversarial gap solve.',
        }),
      );
    }
  });

  const partitioned = partitionFindings(findings);
  return { ...partitioned, findings, metrics };
}

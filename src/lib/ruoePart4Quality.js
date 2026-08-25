/**
 * B2 Part 4 — Blueprint metadata, transformation distance, difficulty & quality gates (v1.1).
 */
import { countCambridgeKeyWordWords } from '@/lib/countCambridgeKeyWordWords';
import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { keywordInPart4Answer } from '@/lib/b2RuoeExamQuality';
import { createFinding, partitionFindings } from '@/lib/ruoeValidationFindings';
import { validatePart4SlotKeywordAssignment } from '@/lib/ruoePart4MetadataNormalization';

export const TRANSFORMATION_DISTANCE = {
  LEXICAL: 'lexical_substitution',
  MINOR: 'minor_grammatical',
  SYNTACTIC: 'syntactic_restructuring',
  MULTI_STEP: 'multi_step_transformation',
};

const B2_STRONG_BANDS = new Set(['B2-Standard', 'B2-Strong', 'B2']);
const WEAK_BANDS = new Set(['B1', 'B1+', 'B1-Core', 'B2-Basic']);

const AWKWARD_PATTERNS = [
  /\bplease to\b/i,
  /\bmake a photo\b/i,
  /\bdo a photo\b/i,
  /\bopen the light\b/i,
  /\bclose the light\b/i,
  /\bvery much happy\b/i,
  /\bin order that\b/i,
  /\bfor to\b/i,
  /\bsomeone for to\b/i,
];

const DANGLING_VERB_END = /\b(decided|considered|thought|wondered|planned|intended|hoped|tried|attempted)\s*\.?\s*$/i;

const MULTI_STEP_PATTERNS = [
  /\b(is|are|was|were)\s+(said|thought|believed|known|reported)\s+to\b/i,
  /\bin spite of\b/i,
  /\bnot as\b.*\bas\b/i,
  /\bhad better\b/i,
  /\bneed(?:n't| not)?\s+have\b/i,
  /\blooking forward to\b/i,
  /\bthere is no point\b/i,
  /\bget\s+\w+\s+done\b/i,
];

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') return Object.values(v);
  return [];
}

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function significantWords(text, minLen = 3) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(
      (w) =>
        w.length >= minLen &&
        !/^(the|and|for|that|with|have|been|from|they|this|were|was)$/.test(w),
    );
}

function wordOverlapRatio(a, b) {
  const wa = new Set(significantWords(a));
  const wb = new Set(significantWords(b));
  if (!wa.size || !wb.size) return 0;
  let shared = 0;
  wa.forEach((w) => {
    if (wb.has(w)) shared += 1;
  });
  return shared / Math.max(wa.size, wb.size);
}

function resolveSentence2(q) {
  return String(q?.sentence2Start || q?.sentence2 || '').trim();
}

function resolveMeta(q) {
  return q?.grading_metadata || q?.gradingMetadata || null;
}

function resolveBlueprintFields(q) {
  const meta = resolveMeta(q) || {};
  return {
    family_id: q?.family_id || q?.familyId || meta.family_id || meta.familyId || '',
    target_structure:
      q?.target_structure || q?.targetStructure || meta.target_structure || meta.targetStructure || '',
    difficulty_band:
      q?.difficulty_band || q?.difficultyBand || meta.difficulty_band || meta.difficultyBand || '',
    transformation_distance:
      q?.transformation_distance ||
      q?.transformationDistance ||
      meta.transformation_distance ||
      meta.transformationDistance ||
      '',
    marking_point_plan: q?.marking_point_plan || meta.marking_point_plan || '',
    alternative_route_check: q?.alternative_route_check || meta.alternative_route_check || '',
  };
}

/** Infer transformation distance from linguistic signals. */
export function inferTransformationDistance(sentence1, sentence2, answer, keyword) {
  const s1 = normalizeText(sentence1);
  const ans = normalizeText(answer);
  const wc = countCambridgeKeyWordWords(answer);

  if (MULTI_STEP_PATTERNS.some((re) => re.test(ans))) {
    return TRANSFORMATION_DISTANCE.MULTI_STEP;
  }

  const s1Words = significantWords(s1);
  const ansWords = significantWords(ans);
  const overlapAnsS1 = s1Words.filter((w) => ansWords.includes(w)).length / Math.max(ansWords.length, 1);

  if (wc <= 2 && overlapAnsS1 > 0.6) {
    return TRANSFORMATION_DISTANCE.LEXICAL;
  }

  const structuralShift =
    /\b(had|have|been|being|would|could|should|might|must)\b/.test(ans) ||
    /\b(not|never|no longer)\b/.test(ans) ||
    s1.split(/\s+/).length > 8 && ansWords.length >= 3;

  if (structuralShift && wc >= 3) {
    return TRANSFORMATION_DISTANCE.SYNTACTIC;
  }

  if (wc >= 4 || /\b(to|that|as|than|in|of|for)\b/.test(ans.replace(normalizeText(keyword), ''))) {
    return TRANSFORMATION_DISTANCE.SYNTACTIC;
  }

  if (wc <= 3 && overlapAnsS1 < 0.5) {
    return TRANSFORMATION_DISTANCE.MINOR;
  }

  return TRANSFORMATION_DISTANCE.MINOR;
}

/** Infer difficulty band from distance + restructuring (not declarative metadata alone). */
export function inferDifficultyBand(sentence1, sentence2, answer, keyword, distance) {
  const wc = countCambridgeKeyWordWords(answer);
  const overlap = wordOverlapRatio(sentence1, sentence2.replace(/_+/g, ''));

  if (distance === TRANSFORMATION_DISTANCE.LEXICAL && wc <= 2) return 'B1+';
  if (distance === TRANSFORMATION_DISTANCE.MINOR && wc <= 2 && overlap > 0.55) return 'B1+';
  if (distance === TRANSFORMATION_DISTANCE.MULTI_STEP || wc >= 4) return 'B2-Strong';
  if (distance === TRANSFORMATION_DISTANCE.SYNTACTIC) return 'B2-Standard';
  return 'B2-Core';
}

const TARGET_STRUCTURE_META_WORDS = new Set([
  'conditional',
  'comparative',
  'reported',
  'structure',
  'equivalence',
  'transformation',
  'gerund',
  'noun',
  'verb',
  'adjective',
  'auxiliary',
  'complement',
  'past',
  'perfect',
  'present',
  'modal',
  'causative',
  'request',
  'advice',
  'degree',
  'duration',
  'someone',
  'something',
  'subject',
  'object',
  'prepositional',
  'phrase',
  'route',
  'alternative',
  'third',
  'unreal',
  'hypothetical',
  'consequence',
  'duration',
  'equivalent',
  'accuse',
  'point',
  'mind',
  'expected',
  'since',
  'time',
  'make',
  'up',
  'using',
  'with',
  'than',
]);

const CONTRADICTORY_TARGET_FRAGMENTS = [
  'hardly any',
  'very few',
  'scarcely any',
  'hardly ever',
  'hardly any students',
];

function routeCompatibleWithAnswer(routeNorm, answerNorm) {
  if (routeNorm.includes('very few') && answerNorm.includes('very') && answerNorm.includes('few')) return true;
  if (routeNorm.includes('hardly any') && answerNorm.includes('hardly')) return true;
  if (
    routeNorm.includes('mind') &&
    answerNorm.includes('mind') &&
    (answerNorm.includes('made up') || answerNorm.includes('make up'))
  ) {
    return true;
  }
  if (routeNorm.includes('decision') && answerNorm.includes('decision')) return true;
  if (routeNorm.includes('since') && answerNorm.includes('since')) return true;
  if (routeNorm.includes('need not have') && /need(?: not|n'?t) have/.test(answerNorm)) return true;

  const words = significantWords(routeNorm, 3).filter((w) => !TARGET_STRUCTURE_META_WORDS.has(w));
  if (!words.length) return true;
  const matched = words.filter((w) => answerNorm.includes(w)).length;
  return matched >= Math.min(2, words.length) || (words.length === 1 && matched === 1);
}

function labelContradictsCanonicalAnswer(label, answer) {
  const l = normalizeText(label);
  const a = normalizeText(answer);
  if (l.includes('hardly any') && (a.includes('very few') || (a.includes('very') && a.includes('few')))) {
    return true;
  }
  if (l.includes('very few') && a.includes('hardly any')) return true;
  if (l.includes('passive causative') && !/\b(is|are|was|were|been|expected)\b/.test(a)) return true;
  return false;
}

/** HARD: target_structure must not describe a different lexical route than the canonical answer. */
export function validatePart4MetadataCoherence(q, answer, meta) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const bp = resolveBlueprintFields(q);
  const targetStructure = String(bp.target_structure || '').trim();
  const answerNorm = normalizeText(answer);
  const mpLabels = (meta?.markingPoints || []).map((mp) => String(mp.label || '').trim()).filter(Boolean);

  if (targetStructure) {
    const tsNorm = normalizeText(targetStructure);

    for (const frag of CONTRADICTORY_TARGET_FRAGMENTS) {
      if (tsNorm.includes(frag) && !answerNorm.includes(frag)) {
        const answerUsesOtherQuantifier =
          (frag === 'hardly any' && answerNorm.includes('very') && answerNorm.includes('few')) ||
          (frag === 'very few' && answerNorm.includes('hardly'));
        if (answerUsesOtherQuantifier) {
          findings.push(
            createFinding({
              rule_id: 'P4-METADATA-MISMATCH',
              severity: 'HARD_FAIL',
              location: label,
              evidence: `${targetStructure.slice(0, 60)} vs "${answer}"`,
              reason: `target_structure requires "${frag}" but canonical answer does not contain it.`,
              recommended_local_action: 'Align target_structure to the canonical answer route.',
            }),
          );
          break;
        }
      }
    }

    if (targetStructure.includes('/') || targetStructure.includes('|')) {
      const routes = targetStructure
        .split(/[/|]+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 2);
      const compatible = routes.some((route) => routeCompatibleWithAnswer(normalizeText(route), answerNorm));
      const hasLexicalRoute = routes.some(
        (route) => significantWords(route, 3).filter((w) => !TARGET_STRUCTURE_META_WORDS.has(w)).length > 0,
      );
      if (!compatible && hasLexicalRoute) {
        findings.push(
          createFinding({
            rule_id: 'P4-METADATA-MISMATCH',
            severity: 'HARD_FAIL',
            location: label,
            evidence: `${targetStructure.slice(0, 60)} vs "${answer}"`,
            reason: 'target_structure lists alternative lexical routes none of which match the canonical answer.',
            recommended_local_action: 'Normalize target_structure to the single route used in the canonical answer.',
          }),
        );
      }
    }
  }

  for (const ml of mpLabels) {
    if (labelContradictsCanonicalAnswer(ml, answer)) {
      findings.push(
        createFinding({
          rule_id: 'P4-MARKING-POINT-MISMATCH',
          severity: 'HARD_FAIL',
          location: label,
          evidence: ml.slice(0, 80),
          reason: `Marking point label "${ml}" contradicts the canonical answer route.`,
          recommended_local_action: 'Rewrite marking point label to match the evaluated answer partition.',
        }),
      );
    }
  }

  return findings;
}

const CONTRACTION_PAIRS = [
  [/don't/g, 'do not'],
  [/doesn't/g, 'does not'],
  [/didn't/g, 'did not'],
  [/won't/g, 'will not'],
  [/can't/g, 'cannot'],
  [/couldn't/g, 'could not'],
  [/shouldn't/g, 'should not'],
  [/wouldn't/g, 'would not'],
  [/isn't/g, 'is not'],
  [/aren't/g, 'are not'],
  [/wasn't/g, 'was not'],
  [/weren't/g, 'were not'],
  [/haven't/g, 'have not'],
  [/hasn't/g, 'has not'],
  [/hadn't/g, 'had not'],
  [/needn't/g, 'need not'],
  [/mustn't/g, 'must not'],
];

function expandContractions(text) {
  let s = normalizeText(text);
  for (const [re, expanded] of CONTRACTION_PAIRS) {
    s = s.replace(re, expanded);
  }
  return s.replace(/\s+/g, ' ').trim();
}

/** QUALITY/HARD checks on explicit accepted variants in fullAnswers + marking points. */
export function validatePart4AcceptedVariants(q, answer, meta) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const keyword = String(q?.keyword || '').toUpperCase();
  const fullAnswers = asArray(meta?.fullAnswers).map((a) => String(a || '').trim()).filter(Boolean);
  const canonical = String(answer || '').trim();

  fullAnswers.forEach((fa) => {
    const wc = countCambridgeKeyWordWords(fa);
    if (wc < 2 || wc > 5) {
      findings.push(
        createFinding({
          rule_id: 'TEST-P4-INVALID-VARIANT',
          severity: 'HARD_FAIL',
          location: label,
          evidence: fa,
          reason: 'accepted variant must be 2–5 Cambridge words.',
          recommended_local_action: 'Remove or fix invalid fullAnswer variant.',
        }),
      );
    }
    if (keyword && !keywordInPart4Answer(keyword, fa)) {
      findings.push(
        createFinding({
          rule_id: 'TEST-P4-INVALID-VARIANT',
          severity: 'HARD_FAIL',
          location: label,
          evidence: fa,
          reason: 'accepted variant must contain keyword unchanged.',
          recommended_local_action: 'Fix variant or remove alternate route.',
        }),
      );
    }
    if (expandContractions(fa) !== expandContractions(canonical) && fa.toLowerCase() !== canonical.toLowerCase()) {
      const tokensFa = tokenizeB2KeyWordAnswer(fa);
      const tokensCanon = tokenizeB2KeyWordAnswer(canonical);
      const shared = tokensFa.filter((t) => tokensCanon.includes(t)).length;
      const ratio = shared / Math.max(tokensFa.length, tokensCanon.length);
      if (ratio < 0.45) {
        findings.push(
          createFinding({
            rule_id: 'TEST-P4-INVALID-VARIANT',
            severity: 'HARD_FAIL',
            location: label,
            evidence: fa,
            reason: 'fullAnswer variant is not a superficial contraction/spelling variant of canonical answer.',
            recommended_local_action: 'List only equivalent variants with same structure and meaning.',
          }),
        );
      }
    }
  });

  const expandedCanon = expandContractions(canonical);
  const hasExpanded = fullAnswers.some((fa) => expandContractions(fa) === expandedCanon);
  const hasContractionForm = fullAnswers.some(
    (fa) => fa !== canonical && expandContractions(fa) === expandedCanon,
  );
  const needsContractionPair =
    /\b(do|does|did|is|are|was|were|have|has|had|need|must|can|could|should|would|will)\s+not\b/i.test(
      canonical,
    );
  if (needsContractionPair && hasExpanded && !hasContractionForm && fullAnswers.length === 1) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-VALID-CONTRACTION',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: canonical,
        reason: 'Expanded negative form listed without explicit contraction variant (e.g. need not / needn\'t).',
        recommended_local_action: 'Add explicit contraction variant to fullAnswers and marking accepted lists.',
      }),
    );
  }

  return findings;
}

function analyzeItemChallenge(q, answer, distance, band) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const s1 = String(q?.sentence1 || '');
  const s2 = resolveSentence2(q);
  const keyword = String(q?.keyword || q?.keyWord || '');
  const wc = countCambridgeKeyWordWords(answer);

  const s2Overlap = wordOverlapRatio(s1, s2.replace(/_+/g, ''));
  if (s2Overlap > 0.72) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-TOO-EASY',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: `overlap ${Math.round(s2Overlap * 100)}%`,
        reason: 'Sentence 2 is too parallel to Sentence 1 — little restructuring required.',
        recommended_local_action: 'Rewrite sentence2 frame to require genuine transformation.',
      }),
    );
  }

  if (
    distance === TRANSFORMATION_DISTANCE.LEXICAL ||
    (distance === TRANSFORMATION_DISTANCE.MINOR && wc <= 2)
  ) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-LOW-TRANSFORMATION-DISTANCE',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: distance,
        reason: 'Transformation distance is too low for a demanding B2 Part 4 item.',
        recommended_local_action: 'Require syntactic restructuring or multi-step transformation.',
      }),
    );
  }

  if (WEAK_BANDS.has(band) || band === 'B1+') {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-TOO-EASY',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: band,
        reason: 'Item difficulty reads below B2-Standard for Part 4.',
        recommended_local_action: 'Increase restructuring difficulty to B2-Standard or B2-Strong.',
      }),
    );
  }

  if (wc <= 2 && keywordInPart4Answer(keyword, answer)) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-TOO-EASY',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: answer,
        reason: 'Answer may be too obvious — keyword plus minimal addition.',
        recommended_local_action: 'Expand transformation while staying within 2–5 words.',
      }),
    );
  }

  return findings;
}

function analyzeNaturalness(q) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const blob = `${q?.sentence1 || ''} ${resolveSentence2(q)} ${q?.answer || ''}`;
  for (const re of AWKWARD_PATTERNS) {
    if (re.test(blob)) {
      findings.push(
        createFinding({
          rule_id: 'TEST-P4-UNNATURAL-SENTENCE',
          severity: 'QUALITY_FAIL',
          location: label,
          evidence: re.source,
          reason: 'Awkward or artificial English phrasing detected.',
          recommended_local_action: 'Rewrite for natural British English before transformation fit.',
        }),
      );
      break;
    }
  }
  return findings;
}

function analyzeContextCompleteness(q) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const s1 = String(q?.sentence1 || '').trim();
  if (s1.split(/\s+/).length < 6) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-INCOMPLETE-CONTEXT',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: s1.slice(0, 60),
        reason: 'Sentence 1 is too bare — insufficient context for meaning discrimination.',
        recommended_local_action: 'Add natural context without padding.',
      }),
    );
  }
  if (DANGLING_VERB_END.test(s1) && !/\b(to|about|whether|if|what|how)\b/i.test(s1)) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-INCOMPLETE-CONTEXT',
        severity: 'QUALITY_FAIL',
        location: label,
        evidence: s1.slice(0, 80),
        reason: 'Sentence 1 ends with a verb that needs a complement for semantic completeness.',
        recommended_local_action: 'Complete the idea in sentence1 or ensure sentence2 supplies it naturally.',
      }),
    );
  }
  return findings;
}

/** Heuristic alternative-route detection (deterministic patterns only). */
export function detectPart4AlternativeRoutes(q, answer, meta) {
  const findings = [];
  const label = `Q${q?.number ?? '?'}`;
  const keyword = String(q?.keyword || '').toUpperCase();
  const s1 = String(q?.sentence1 || '').toLowerCase();
  const wc = countCambridgeKeyWordWords(answer);

  const dualRouteKeywords = {
    WISH: /\b(regret|sorry)\b/.test(s1),
    REGRET: /\b(wish|wanted)\b/.test(s1),
    MUST: /\b(need|have to|should)\b/.test(s1) && wc <= 3,
    SHOULD: /\b(must|have to)\b/.test(s1) && wc <= 3,
  };

  if (dualRouteKeywords[keyword]) {
    const documented = String(
      q?.alternative_route_check || resolveMeta(q)?.alternative_route_check || '',
    );
    if (!/no alternative|single route|one route|controlled|clear and controlled/i.test(documented)) {
      findings.push(
        createFinding({
          rule_id: 'TEST-P4-ALTERNATIVE-ROUTE',
          severity: 'QUALITY_FAIL',
          location: label,
          evidence: keyword,
          reason: 'Keyword + sentence1 pattern may allow a second grammatical route.',
          recommended_local_action: 'Tighten sentence frames or document why only one route is valid.',
        }),
      );
    }
  }

  const fullAnswers = asArray(meta?.fullAnswers);
  if (fullAnswers.length >= 2) {
    const routes = fullAnswers.map((fa) => normalizeText(fa));
    const uniqueRoutes = [...new Set(routes)];
    if (uniqueRoutes.length >= 2) {
      const tokensA = tokenizeB2KeyWordAnswer(uniqueRoutes[0]);
      const tokensB = tokenizeB2KeyWordAnswer(uniqueRoutes[1]);
      const shared = tokensA.filter((t) => tokensB.includes(t)).length;
      const ratio = shared / Math.max(tokensA.length, tokensB.length);
      if (ratio < 0.5) {
        findings.push(
          createFinding({
            rule_id: 'TEST-P4-ALTERNATIVE-ROUTE',
            severity: 'HARD_FAIL',
            location: label,
            evidence: fullAnswers.join(' | '),
            reason: 'fullAnswers list contains two distinct grammatical routes (not contraction-only variants).',
            recommended_local_action: 'Keep only superficial contraction variants in fullAnswers.',
          }),
        );
      }
    }
  }

  return findings;
}

function analyzeAnswerLengthDistribution(questions, modelAnswers) {
  const findings = [];
  const lengths = questions.map((q, i) => {
    const answer = String(
      q?.answer || modelAnswers[i]?.answer || '',
    ).trim();
    return answer ? countCambridgeKeyWordWords(answer) : 0;
  });
  const dist = { 2: 0, 3: 0, 4: 0, 5: 0 };
  lengths.forEach((n) => {
    if (n >= 2 && n <= 5) dist[n] += 1;
  });
  const short = lengths.filter((n) => n >= 2 && n <= 3).length;
  if (questions.length === 6 && short >= 5) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-ANSWER-LENGTH-DISTRIBUTION',
        severity: 'QUALITY_FAIL',
        location: 'Part 4',
        evidence: JSON.stringify(dist),
        reason: 'Answers concentrate on 2–3 words — insufficient variety within the 2–5 range.',
        recommended_local_action: 'Include more 4–5 word transformations across the set.',
      }),
    );
  }
  return { findings, distribution: dist, lengths };
}

function analyzePartLevelQuality(questions, itemMeta) {
  const findings = [];
  const bands = itemMeta.map((m) => m.band);
  const distances = itemMeta.map((m) => m.distance);

  const b2Strong = bands.filter((b) => B2_STRONG_BANDS.has(b)).length;
  const weak = bands.filter((b) => WEAK_BANDS.has(b) || b === 'B1+').length;
  if (weak >= 3) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-TOO-EASY',
        severity: 'QUALITY_FAIL',
        location: 'Part 4',
        evidence: `${weak}/6 below B2-Standard`,
        reason: 'Too many items read as B1/B1+ rather than B2-Standard/B2-Strong.',
        recommended_local_action: 'Regenerate weak slots with higher restructuring demand.',
      }),
    );
  }
  if (b2Strong < 2 && questions.length === 6) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-TOO-EASY',
        severity: 'QUALITY_FAIL',
        location: 'Part 4',
        evidence: `${b2Strong}/6 B2-Standard+`,
        reason: 'Part lacks predominance of B2-Standard/B2-Strong items.',
        recommended_local_action: 'Target at least half of items at B2-Standard or B2-Strong.',
      }),
    );
  }

  const lowDistance = distances.filter(
    (d) => d === TRANSFORMATION_DISTANCE.LEXICAL || d === TRANSFORMATION_DISTANCE.MINOR,
  ).length;
  if (lowDistance >= 4) {
    findings.push(
      createFinding({
        rule_id: 'TEST-P4-LOW-TRANSFORMATION-DISTANCE',
        severity: 'QUALITY_FAIL',
        location: 'Part 4',
        evidence: `${lowDistance}/6 low distance`,
        reason: 'Part relies too heavily on simple lexical/minor transformations.',
        recommended_local_action: 'Diversify with syntactic restructuring and multi-step items.',
      }),
    );
  }

  return findings;
}

/** Full Part 4 quality + HARD blueprint coherence validation. */
export function validatePart4Quality(gen, blueprintSlots = null) {
  const findings = [];
  const questions = asArray(gen?.questions);
  const modelAnswers = asArray(gen?.modelAnswers);
  const itemMeta = [];

  questions.forEach((q, i) => {
    const answer = String(
      q?.answer ||
        modelAnswers.find((m) => Number(m?.number) === Number(q?.number))?.answer ||
        modelAnswers[i]?.answer ||
        '',
    ).trim();
    const meta = resolveMeta(q);
    const s2 = resolveSentence2(q);
    const distance =
      resolveBlueprintFields(q).transformation_distance ||
      inferTransformationDistance(q?.sentence1, s2, answer, q?.keyword);
    const band =
      resolveBlueprintFields(q).difficulty_band ||
      inferDifficultyBand(q?.sentence1, s2, answer, q?.keyword, distance);

    itemMeta.push({ distance, band, number: q?.number });

    if (meta && answer) {
      findings.push(...validatePart4MetadataCoherence(q, answer, meta));
      findings.push(...validatePart4AcceptedVariants(q, answer, meta));
      findings.push(...detectPart4AlternativeRoutes(q, answer, meta));
    }
    findings.push(...analyzeItemChallenge(q, answer, distance, band));
    findings.push(...analyzeNaturalness(q));
    findings.push(...analyzeContextCompleteness(q));
  });

  const { findings: distFindings, distribution, lengths } = analyzeAnswerLengthDistribution(
    questions,
    modelAnswers,
  );
  findings.push(...distFindings);
  findings.push(...analyzePartLevelQuality(questions, itemMeta));

  if (blueprintSlots) {
    const slotFindings = validatePart4SlotKeywordAssignment(gen, blueprintSlots);
    for (const f of slotFindings) {
      findings.push(createFinding({ ...f, source: 'deterministic' }));
    }
  }

  const partitioned = partitionFindings(findings);
  return {
    findings,
    ...partitioned,
    metrics: {
      itemMeta,
      answerLengthDistribution: distribution,
      answerLengths: lengths,
    },
  };
}

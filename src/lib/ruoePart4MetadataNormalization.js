/**
 * Part 4 metadata normalization from canonical answer (v1.1.2).
 * Does not modify sentence1, sentence2, keyword, or canonical answer.
 */

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') return Object.values(v);
  return [];
}

function normalizeTextLocal(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @deprecated use normalizeTextLocal in this module only */
export { normalizeTextLocal as normalizePart4Text };

const CONTRACTION_MAP = [
  [/need not have/g, "needn't have"],
  [/need not/g, "needn't"],
  [/do not/g, "don't"],
  [/did not/g, "didn't"],
  [/is not/g, "isn't"],
  [/are not/g, "aren't"],
  [/was not/g, "wasn't"],
  [/have not/g, "haven't"],
  [/has not/g, "hasn't"],
  [/had not/g, "hadn't"],
  [/will not/g, "won't"],
  [/cannot/g, "can't"],
  [/could not/g, "couldn't"],
];

function contractionVariant(expanded) {
  let s = String(expanded || '').trim();
  for (const [re, c] of CONTRACTION_MAP) {
    if (re.test(s)) {
      return s.replace(re, c);
    }
  }
  return null;
}

function expandContractions(text) {
  let s = normalizeTextLocal(text);
  s = s.replace(/needn't/g, 'need not').replace(/don't/g, 'do not');
  s = s.replace(/didn't/g, 'did not').replace(/isn't/g, 'is not');
  s = s.replace(/aren't/g, 'are not').replace(/haven't/g, 'have not');
  s = s.replace(/hasn't/g, 'has not').replace(/hadn't/g, 'had not');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Infer single-route pedagogical target_structure from canonical answer + keyword.
 */
export function inferTargetStructureFromCanonical(answer, keyword, blueprintTarget = '') {
  const a = normalizeTextLocal(answer);
  const kw = String(keyword || '').toUpperCase();
  const bp = String(blueprintTarget || '').trim();

  if (kw === 'FEW') {
    if (a.includes('hardly any')) return 'hardly any + plural noun';
    if (a.includes('very few') || (a.includes('very') && a.includes('few'))) return 'very few + plural noun';
    if (a.includes('few')) return 'few + plural noun';
  }

  if (kw === 'NEED') {
    if (/need(?: not|n'?t) have/.test(a)) return 'need not have + past participle';
    if (/did(?: not|n'?t) need to/.test(a)) return 'did not need to + infinitive';
    if (/do(?: not|n'?t) need to/.test(a)) return 'do not need to + infinitive';
    if (a.includes('need')) return 'need + complement';
  }

  if (kw === 'MIND') {
    if (a.includes('mind') && (a.includes('made up') || a.includes('make up'))) return "make up one's mind";
    if (a.includes('mind') && a.includes('change')) return "change one's mind";
  }

  if (kw === 'SINCE') {
    if (a.includes('since')) return 'present perfect + time period + since';
  }

  if (kw === 'WISH') {
    if (a.includes('wish') && a.includes('had')) return 'wish + past perfect';
  }

  if (kw === 'EXPECTED') {
    if (a.includes('expected') && a.includes('to')) return 'subject + be EXPECTED + to-infinitive';
  }

  if (bp.includes('/') || bp.includes('|')) {
    return collapseBlueprintTargetToSingleRoute(bp, answer, keyword);
  }

  return bp || inferGenericDescriptor(answer, keyword);
}

function collapseBlueprintTargetToSingleRoute(blueprintTarget, answer, keyword) {
  const a = normalizeTextLocal(answer);
  const routes = blueprintTarget
    .split(/[/|]+/)
    .map((r) => r.trim())
    .filter(Boolean);

  for (const route of routes) {
    const r = normalizeTextLocal(route);
    if (r.includes('very few') && a.includes('very') && a.includes('few')) return 'very few + plural noun';
    if (r.includes('hardly any') && a.includes('hardly')) return 'hardly any + plural noun';
    if (r.includes('mind') && a.includes('mind')) return "make up one's mind";
    if (r.includes('decision') && a.includes('decision')) return 'reach a decision';
    if (r.includes('since') && a.includes('since')) return 'present perfect + time period + since';
  }

  return inferTargetStructureFromCanonical(answer, keyword, '');
}

function inferGenericDescriptor(answer, keyword) {
  const inferred = inferTargetStructureFromCanonical(answer, keyword, '');
  if (inferred) return inferred;
  return `${String(keyword || '').toLowerCase()} + complement`;
}

function inferMarkingPointLabels(answer, mps) {
  const a = normalizeTextLocal(answer);
  const labels = [];

  if (!Array.isArray(mps) || mps.length !== 2) return labels;

  const mp1Accepted = (mps[0]?.accepted || []).map(String).join(' ').trim();
  const mp2Accepted = (mps[1]?.accepted || []).map(String).join(' ').trim();

  if (/need(?: not|n'?t) have/.test(a)) {
    return ['need not have (modal perfect)', 'past participle complement'];
  }
  if (a.includes('since')) {
    return ['duration/time frame with since', 'since + past-event clause'];
  }
  if (a.includes('made up') && a.includes('mind')) {
    return ['made up (phrasal verb)', "possessive + mind"];
  }
  if (a.includes('very few') || (a.includes('very') && a.includes('few'))) {
    return ['very few quantifier', 'few + plural continuation'];
  }
  if (a.includes('hardly any')) {
    return ['hardly any quantifier', 'plural noun continuation'];
  }
  if (a.includes('expected') && a.includes('to')) {
    return ['passive be + expected', 'to + infinitive'];
  }
  if (a.includes('wish') && a.includes('had')) {
    return ['wish + subject', 'had + past participle'];
  }

  if (mp1Accepted) labels.push(mp1Accepted);
  else labels.push('marking point 1');
  if (mp2Accepted) labels.push(mp2Accepted);
  else labels.push('marking point 2');
  return labels;
}

function syncFullAnswers(canonical, existingFullAnswers) {
  const canon = String(canonical || '').trim();
  const set = new Set([canon]);
  const contra = contractionVariant(canon);
  if (contra && contra !== canon) set.add(contra);

  for (const fa of asArray(existingFullAnswers)) {
    const t = String(fa || '').trim();
    if (!t) continue;
    if (expandContractions(t) === expandContractions(canon)) set.add(t);
  }

  return [...set];
}

/**
 * Normalize metadata for one Part 4 item from its stable canonical answer.
 */
export function normalizePart4ItemMetadataFromCanonicalAnswer(q, blueprintSlot = null) {
  const changes = [];
  const sentence1 = String(q?.sentence1 || '').trim();
  const sentence2 = String(q?.sentence2Start || q?.sentence2 || '').trim();
  const keyword = String(q?.keyword || q?.keyWord || '').trim();
  const canonical = String(q?.answer || '').trim();

  if (!canonical || !keyword) {
    return { question: q, changes };
  }

  const question = { ...q };
  const meta = {
    ...(question.grading_metadata || question.gradingMetadata || {}),
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: keyword.toUpperCase(),
  };

  const blueprintTarget =
    blueprintSlot?.target_structure || question.target_structure || question.targetStructure || '';

  const prevTarget = String(
    question.target_structure || question.targetStructure || meta.target_structure || '',
  ).trim();
  const newTarget = inferTargetStructureFromCanonical(canonical, keyword, blueprintTarget);

  if (newTarget && newTarget !== prevTarget) {
    question.target_structure = newTarget;
    question.targetStructure = newTarget;
    meta.target_structure = newTarget;
    changes.push(`target_structure → ${newTarget}`);
  }

  const prevFull = asArray(meta.fullAnswers);
  const newFull = syncFullAnswers(canonical, prevFull);
  if (JSON.stringify(prevFull) !== JSON.stringify(newFull)) {
    meta.fullAnswers = newFull;
    changes.push(`fullAnswers synced (${newFull.length})`);
  }

  const mps = Array.isArray(meta.markingPoints) ? meta.markingPoints.map((mp) => ({ ...mp })) : [];
  if (mps.length === 2) {
    const labelPair = inferMarkingPointLabels(canonical, mps);
    if (labelPair.length === 2) {
      const prevLabels = mps.map((mp) => String(mp.label || ''));
      mps[0].label = labelPair[0];
      mps[1].label = labelPair[1];
      if (prevLabels.join('|') !== labelPair.join('|')) {
        changes.push(`MP labels → ${labelPair.join(' | ')}`);
      }
    }
    meta.markingPoints = mps;
  }

  question.grading_metadata = meta;
  if (question.gradingMetadata) question.gradingMetadata = meta;

  if (blueprintSlot?.family_id && !question.family_id) {
    question.family_id = blueprintSlot.family_id;
  }
  if (blueprintSlot?.difficulty_band && !question.difficulty_band) {
    question.difficulty_band = blueprintSlot.difficulty_band;
  }

  // Guard: never mutate core content fields
  question.sentence1 = sentence1;
  question.sentence2Start = sentence2;
  question.sentence2 = sentence2;
  question.keyword = keyword.toUpperCase();
  question.answer = canonical;

  return { question, changes };
}

/**
 * @param {object} gen
 * @param {object[]} [blueprintSlots]
 */
export function normalizePart4MetadataFromCanonicalAnswer(gen, blueprintSlots = null) {
  const questions = Array.isArray(gen?.questions) ? gen.questions : [];
  const modelAnswers = Array.isArray(gen?.modelAnswers) ? [...gen.modelAnswers] : [];
  const slotByNumber = new Map();

  if (Array.isArray(blueprintSlots)) {
    for (const slot of blueprintSlots) {
      slotByNumber.set(Number(slot.question_number), slot);
    }
  }

  const normalizations = [];
  const normalizedQuestions = questions.map((q, i) => {
    const num = Number(q?.number);
    const slot = slotByNumber.get(num) || null;
    const { question, changes } = normalizePart4ItemMetadataFromCanonicalAnswer(q, slot);
    if (changes.length) {
      normalizations.push(`Q${num}: ${changes.join('; ')}`);
    }

    const maIdx = modelAnswers.findIndex((m) => Number(m?.number) === num);
    if (maIdx >= 0) {
      modelAnswers[maIdx] = {
        ...modelAnswers[maIdx],
        answer: question.answer,
        grading_metadata: question.grading_metadata,
      };
    }

    return question;
  });

  return {
    generated: {
      ...gen,
      questions: normalizedQuestions,
      modelAnswers,
    },
    normalizations,
  };
}

/**
 * HARD: keyword must match approved blueprint slot assignment.
 */
export function validatePart4SlotKeywordAssignment(gen, blueprintSlots) {
  const findings = [];
  const slots = Array.isArray(blueprintSlots) ? blueprintSlots : [];
  const expected = new Map(slots.map((s) => [Number(s.question_number), String(s.keyword_constraint?.keyword || '').toUpperCase()]));

  const questions = Array.isArray(gen?.questions) ? gen.questions : [];
  questions.forEach((q) => {
    const num = Number(q?.number);
    if (num < 25 || num > 30) return;
    const expectedKw = expected.get(num);
    const actualKw = String(q?.keyword || q?.keyWord || '').toUpperCase();
    if (expectedKw && actualKw && expectedKw !== actualKw) {
      findings.push({
        rule_id: 'P4-SLOT-KEYWORD-MISMATCH',
        severity: 'HARD_FAIL',
        location: `Q${num}`,
        evidence: `expected ${expectedKw}, got ${actualKw}`,
        reason: `Slot keyword mismatch — Q${num} must use blueprint keyword ${expectedKw}.`,
        recommended_local_action: 'Regenerate item with correct blueprint keyword for this slot.',
      });
    }
  });

  return findings;
}

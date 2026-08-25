/**
 * Local Part 4 marking-point partition repair (v1.1.1).
 * Does not modify sentence1, sentence2, keyword, or canonical answer.
 */
import { tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { gradeB2KeyWordTransformation } from '@/lib/gradeB2KeyWordTransformation';
import { validateB2KeyWordAnswerKey } from '@/lib/validateB2KeyWordAnswerKey';
import { normalizePart4MetadataFromCanonicalAnswer } from '@/lib/ruoePart4MetadataNormalization';

const PLACEHOLDER_FULL_ANSWERS = ['__no_full_match_placeholder__'];

const FUNCTION_WORDS = new Set([
  'to',
  'of',
  'in',
  'at',
  'as',
  'the',
  'a',
  'an',
  'for',
  'on',
  'by',
  'with',
]);

/**
 * @param {string} canonicalAnswer
 * @param {object} meta
 * @param {string} keyword
 */
export function isPart4MarkingPartitionValid(canonicalAnswer, meta, keyword) {
  const answer = String(canonicalAnswer || '').trim();
  if (!answer || !meta?.markingPoints || meta.markingPoints.length !== 2) return false;

  const keyMeta = {
    ...meta,
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: meta.keyword || keyword,
    fullAnswers: PLACEHOLDER_FULL_ANSWERS,
  };

  const grade = gradeB2KeyWordTransformation(answer, keyMeta);
  return grade.score === 2;
}

/**
 * @param {string} canonicalAnswer
 * @param {string[]} fullAnswers
 * @param {object} meta
 * @param {string} keyword
 */
export function arePart4FullAnswersMarkingCompatible(fullAnswers, meta, keyword) {
  const answers = (fullAnswers || []).map((a) => String(a || '').trim()).filter(Boolean);
  if (!answers.length) return false;

  return answers.every((fa) => isPart4MarkingPartitionValid(fa, meta, keyword));
}

/**
 * @param {string} mpText
 * @param {string} canonicalAnswer
 */
export function isMarkingPointWithinAnswer(mpText, canonicalAnswer) {
  const haystack = tokenizeB2KeyWordAnswer(canonicalAnswer);
  const needle = tokenizeB2KeyWordAnswer(mpText);
  if (!needle.length || haystack.length < needle.length) return false;

  for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    let matched = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j].toLowerCase() !== needle[j].toLowerCase()) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

/**
 * @param {string} mp1
 * @param {string} mp2
 * @param {string[]} tokens
 */
function scorePartitionPedagogy(mp1, mp2, tokens) {
  const mp1Tokens = tokenizeB2KeyWordAnswer(mp1);
  const mp2Tokens = tokenizeB2KeyWordAnswer(mp2);
  let score = 0;

  if (mp1Tokens.length >= 1 && mp2Tokens.length >= 1) score += 10;

  if (mp1Tokens.length === 1 && FUNCTION_WORDS.has(mp1Tokens[0])) score -= 6;
  if (mp2Tokens.length === 1 && FUNCTION_WORDS.has(mp2Tokens[0])) score -= 4;

  if (mp2Tokens[0] === 'to' && mp2Tokens.length > 1) score += 4;
  if (mp1.includes('not') || mp1.includes("n't")) score += 3;

  if (tokens.length >= 4) {
    score += Math.min(mp1Tokens.length, mp2Tokens.length);
  }

  if (mp1Tokens.length >= 2 && mp2Tokens.length >= 2) score += 2;

  return score;
}

/**
 * Find a partition aligned across all fullAnswer variants by matching identical MP2 tails.
 * @param {string} canonicalAnswer
 * @param {string[]} fullAnswers
 * @param {string} keyword
 */
function findAlignedPartitionAcrossVariants(canonicalAnswer, fullAnswers, keyword) {
  const canonical = String(canonicalAnswer || '').trim();
  const canonTokens = tokenizeB2KeyWordAnswer(canonical);
  if (canonTokens.length < 2) return null;

  const answers = [...new Set(
    [canonical, ...fullAnswers.map((a) => String(a || '').trim()).filter(Boolean)],
  )];

  /** @type {Array<{ mp1: string, mp2: string, score: number, variants: { mp1: string[], mp2: string[] } }>} */
  const candidates = [];

  for (let i = canonTokens.length - 2; i >= 0; i -= 1) {
    const mp2Canon = canonTokens.slice(i + 1).join(' ');
    if (!mp2Canon) continue;

    /** @type {Array<{ mp1: string, mp2: string }>} */
    const perAnswer = [];

    for (const fa of answers) {
      const faTokens = tokenizeB2KeyWordAnswer(fa);
      let matched = null;
      for (let j = 0; j < faTokens.length - 1; j += 1) {
        const mp2 = faTokens.slice(j + 1).join(' ');
        if (mp2 === mp2Canon) {
          matched = {
            mp1: faTokens.slice(0, j + 1).join(' '),
            mp2,
          };
          break;
        }
      }
      if (!matched) {
        perAnswer.length = 0;
        break;
      }
      perAnswer.push(matched);
    }

    if (!perAnswer.length) continue;

    const mp1Set = new Set(perAnswer.map((p) => p.mp1));
    const mp2Set = new Set(perAnswer.map((p) => p.mp2));
    if (mp2Set.size !== 1) continue;

    const markingPoints = [
      { id: 1, accepted: [...mp1Set] },
      { id: 2, accepted: [...mp2Set] },
    ];

    const variants = collectMarkingPointAcceptedVariants(
      answers,
      markingPoints,
      keyword,
      canonical,
    );
    if (!variants) continue;

    const mp1 = canonTokens.slice(0, i + 1).join(' ');
    candidates.push({
      mp1,
      mp2: mp2Canon,
      score: scorePartitionPedagogy(mp1, mp2Canon, canonTokens),
      variants,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

/**
 * @param {string} canonicalAnswer
 * @param {string} keyword
 * @param {string[]} [fullAnswers]
 * @returns {{ mp1: string, mp2: string, score: number, variants: { mp1: string[], mp2: string[] } } | null}
 */
export function findBestPart4MarkingPartition(canonicalAnswer, keyword, fullAnswers = []) {
  const canonical = String(canonicalAnswer || '').trim();
  const answers = fullAnswers.map((a) => String(a || '').trim()).filter(Boolean);

  const aligned = findAlignedPartitionAcrossVariants(canonical, answers, keyword);
  if (aligned) return aligned;

  const tokens = tokenizeB2KeyWordAnswer(canonical);
  if (tokens.length < 2) return null;

  const allAnswers = [...new Set([canonical, ...answers])];

  /** @type {Array<{ mp1: string, mp2: string, score: number, variants: { mp1: string[], mp2: string[] } }>} */
  const candidates = [];

  for (let i = 0; i < tokens.length - 1; i += 1) {
    const mp1 = tokens.slice(0, i + 1).join(' ');
    const mp2 = tokens.slice(i + 1).join(' ');
    const markingPoints = [
      { id: 1, label: mp1, accepted: [mp1] },
      { id: 2, label: mp2, accepted: [mp2] },
    ];

    const variants = collectMarkingPointAcceptedVariants(
      allAnswers,
      markingPoints,
      keyword,
      canonical,
    );
    if (!variants) continue;

    candidates.push({
      mp1,
      mp2,
      score: scorePartitionPedagogy(mp1, mp2, tokens),
      variants,
    });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

/**
 * @param {string[]} fullAnswers
 * @param {Array<{ id: number, label?: string, accepted: string[] }>} markingPoints
 * @param {string} keyword
 * @param {string} [canonicalAnswer]
 */
export function collectMarkingPointAcceptedVariants(
  fullAnswers,
  markingPoints,
  keyword,
  canonicalAnswer,
) {
  const answers = fullAnswers.map((a) => String(a || '').trim()).filter(Boolean);
  if (!answers.length || markingPoints.length !== 2) return null;
  const canonical = String(canonicalAnswer || answers[0] || '').trim();

  const mp1Accepted = new Set(markingPoints[0].accepted || []);
  const mp2Accepted = new Set(markingPoints[1].accepted || []);

  for (const fa of answers) {
    const grade = gradeB2KeyWordTransformation(fa, {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword,
      fullAnswers: PLACEHOLDER_FULL_ANSWERS,
      markingPoints: [
        { id: 1, accepted: [...mp1Accepted] },
        { id: 2, accepted: [...mp2Accepted] },
      ],
    });
    if (grade.score !== 2) return null;
    const g1 = grade.markingPoints.find((m) => m.id === 1);
    const g2 = grade.markingPoints.find((m) => m.id === 2);
    if (g1?.matchedVariant) mp1Accepted.add(g1.matchedVariant);
    if (g2?.matchedVariant) mp2Accepted.add(g2.matchedVariant);
  }

  const finalMp = [
    { id: 1, accepted: [...mp1Accepted].filter(Boolean) },
    { id: 2, accepted: [...mp2Accepted].filter(Boolean) },
  ];

  if (!finalMp[0].accepted.length || !finalMp[1].accepted.length) return null;

  for (const fa of answers) {
    const grade = gradeB2KeyWordTransformation(fa, {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword,
      fullAnswers: PLACEHOLDER_FULL_ANSWERS,
      markingPoints: finalMp,
    });
    if (grade.score !== 2) return null;
  }

  for (const variant of finalMp[0].accepted) {
    if (!answers.some((a) => isMarkingPointWithinAnswer(variant, a))) return null;
  }
  for (const variant of finalMp[1].accepted) {
    if (!answers.some((a) => isMarkingPointWithinAnswer(variant, a))) return null;
  }

  return {
    mp1: finalMp[0].accepted,
    mp2: finalMp[1].accepted,
  };
}

/**
 * Repair marking points for one Part 4 item without changing sentences/keyword/canonical answer.
 * @param {object} question
 * @param {string} [answerOverride]
 */
export function repairPart4ItemMarkingPoints(question, answerOverride) {
  const keyword = String(question?.keyword || question?.keyWord || '').trim();
  const answer = String(answerOverride || question?.answer || '').trim();
  const meta = question?.grading_metadata || question?.gradingMetadata;

  if (!answer || !keyword) {
    return { ok: false, repaired: false, hardFail: true, reason: 'missing answer or keyword' };
  }

  const existingFullAnswers = Array.isArray(meta?.fullAnswers)
    ? meta.fullAnswers.map((a) => String(a || '').trim()).filter(Boolean)
    : [];
  const fullAnswers = [...existingFullAnswers];
  if (!fullAnswers.some((fa) => fa.toLowerCase() === answer.toLowerCase())) {
    fullAnswers.unshift(answer);
  }

  const canonicalValid =
    meta &&
    isPart4MarkingPartitionValid(answer, meta, keyword) &&
    arePart4FullAnswersMarkingCompatible(fullAnswers, meta, keyword);

  if (canonicalValid) {
    const externalMp = (meta.markingPoints || []).some((mp) =>
      (mp.accepted || []).some(
        (v) => !fullAnswers.some((fa) => isMarkingPointWithinAnswer(v, fa)),
      ),
    );
    if (!externalMp) {
      return { ok: true, repaired: false, question, reason: 'already valid' };
    }
  }

  const partition = findBestPart4MarkingPartition(answer, keyword, fullAnswers);
  if (!partition) {
    return {
      ok: false,
      repaired: false,
      hardFail: true,
      reason: 'no pedagogically valid marking partition',
    };
  }

  const prevMp = meta?.markingPoints || [];
  const markingPoints = [
    {
      id: 1,
      label: prevMp.find((m) => m.id === 1)?.label || prevMp[0]?.label || partition.mp1,
      accepted: partition.variants.mp1,
    },
    {
      id: 2,
      label: prevMp.find((m) => m.id === 2)?.label || prevMp[1]?.label || partition.mp2,
      accepted: partition.variants.mp2,
    },
  ];

  const newMeta = {
    ...meta,
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: meta?.keyword || keyword,
    fullAnswers,
    markingPoints,
  };

  const keyCheck = validateB2KeyWordAnswerKey(newMeta);
  if (!keyCheck.valid) {
    return {
      ok: false,
      repaired: false,
      hardFail: true,
      reason: `invalid repaired metadata: ${keyCheck.errors.join('; ')}`,
    };
  }

  const repairedQuestion = {
    ...question,
    answer,
    grading_metadata: newMeta,
  };

  return {
    ok: true,
    repaired: true,
    hardFail: false,
    question: repairedQuestion,
    partition: { mp1: partition.mp1, mp2: partition.mp2 },
    reason: 'repaired partition',
  };
}

/**
 * @param {object} gen
 */
export function repairPart4MarkingPoints(gen, options = {}) {
  const working = {
    ...gen,
    questions: [...(gen?.questions || [])],
    modelAnswers: [...(gen?.modelAnswers || [])],
  };
  const repairs = [];
  /** @type {Array<{ number: number, reason: string }>} */
  const failed = [];

  working.questions.forEach((q, i) => {
    const answerEntry =
      working.modelAnswers.find((m) => String(m?.id) === String(q?.id)) ||
      working.modelAnswers.find((m) => Number(m?.number) === Number(q?.number)) ||
      working.modelAnswers[i];
    const answer = String(q?.answer || answerEntry?.answer || '').trim();

    const result = repairPart4ItemMarkingPoints(q, answer);
    if (!result.ok) {
      failed.push({ number: q?.number, reason: result.reason || 'repair failed' });
      return;
    }

    if (result.repaired) {
      working.questions[i] = result.question;
      if (answerEntry) {
        answerEntry.answer = result.question.answer;
        if (answerEntry.grading_metadata) {
          answerEntry.grading_metadata = result.question.grading_metadata;
        }
      }
      repairs.push(
        `Q${q?.number}: ${result.partition.mp1} | ${result.partition.mp2}`,
      );
    }
  });

  let outGen = working;
  if (options.normalizeMetadata) {
    const norm = normalizePart4MetadataFromCanonicalAnswer(outGen, options.blueprintSlots);
    outGen = norm.generated;
    for (const n of norm.normalizations) repairs.push(`meta: ${n}`);
    // Re-sync marking partitions after fullAnswer contraction variants are added.
    outGen.questions.forEach((q, i) => {
      const answerEntry =
        outGen.modelAnswers.find((m) => Number(m?.number) === Number(q?.number)) || outGen.modelAnswers[i];
      const answer = String(q?.answer || answerEntry?.answer || '').trim();
      const result = repairPart4ItemMarkingPoints(q, answer);
      if (result.ok && result.repaired) {
        outGen.questions[i] = result.question;
        if (answerEntry) {
          answerEntry.answer = result.question.answer;
          if (answerEntry.grading_metadata) {
            answerEntry.grading_metadata = result.question.grading_metadata;
          }
        }
        repairs.push(`Q${q?.number}: post-meta MP ${result.partition.mp1} | ${result.partition.mp2}`);
      }
    });
  }

  return {
    gen: outGen,
    repairs,
    failed,
    allOk: failed.length === 0,
    needsItemRegeneration: failed.map((f) => f.number),
  };
}

/**
 * Regenerate single Part 4 item via OpenAI when local repair cannot partition.
 * @param {import('openai').OpenAI} openai
 * @param {object} params
 */
export async function regeneratePart4Item(openai, {
  itemNumber,
  topic = 'everyday B2 contexts',
  model = 'gpt-4o-mini',
  existingKeywords = [],
} = {}) {
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.45,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Return ONE B2 Part 4 key word transformation item as JSON. Fields: number, sentence1, keyword (CAPITALS), sentence2Start (with __________________ gap), answer (2–5 Cambridge words), grading_metadata with type b2_key_word_transformation, version 1, keyword, fullAnswers, exactly 2 markingPoints partitioning the answer in order with no leftover words. British English.',
      },
      {
        role: 'user',
        content: `Generate question ${itemNumber} (25–30). Topic: ${topic}. Avoid keywords: ${existingKeywords.join(', ') || 'none'}. Example partition: "do not need to use" → MP1 ["do not need","don't need"] + MP2 ["to use"].`,
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  return JSON.parse(raw);
}

/**
 * @param {import('openai').OpenAI} openai
 * @param {object} gen
 */
export async function repairPart4WithRegeneration(openai, gen, options = {}) {
  let working = { ...gen, questions: [...(gen.questions || [])], modelAnswers: [...(gen.modelAnswers || [])] };
  const allRepairs = [];
  const maxRounds = options.maxRounds ?? 2;

  for (let round = 0; round < maxRounds; round += 1) {
    const result = repairPart4MarkingPoints(working);
    allRepairs.push(...result.repairs);
    working = result.gen;

    if (result.allOk) {
      return { gen: working, repairs: allRepairs, failed: [], allOk: true };
    }

    const keywords = working.questions.map((q) => String(q?.keyword || '').toUpperCase()).filter(Boolean);

    for (const fail of result.failed) {
      const idx = working.questions.findIndex((q) => Number(q.number) === Number(fail.number));
      if (idx < 0) continue;

      const regen = await regeneratePart4Item(openai, {
        itemNumber: fail.number,
        topic: options.topic,
        model: options.model,
        existingKeywords: keywords,
      });

      const repaired = repairPart4ItemMarkingPoints({
        ...working.questions[idx],
        ...regen,
        number: fail.number,
      });

      if (repaired.ok) {
        working.questions[idx] = repaired.question;
        const maIdx = working.modelAnswers.findIndex(
          (m) => Number(m?.number) === Number(fail.number),
        );
        if (maIdx >= 0) {
          working.modelAnswers[maIdx] = {
            ...working.modelAnswers[maIdx],
            answer: repaired.question.answer,
          };
        } else {
          working.modelAnswers.push({
            id: working.questions[idx].id,
            number: fail.number,
            answer: repaired.question.answer,
          });
        }
        if (repaired.repaired) {
          allRepairs.push(`Q${fail.number}: regen + ${repaired.partition.mp1} | ${repaired.partition.mp2}`);
        } else {
          allRepairs.push(`Q${fail.number}: regen item`);
        }
      }
    }
  }

  const final = repairPart4MarkingPoints(working, {
    normalizeMetadata: true,
    blueprintSlots: options.blueprintSlots,
  });
  allRepairs.push(...final.repairs);
  return {
    gen: final.gen,
    repairs: allRepairs,
    failed: final.failed,
    allOk: final.allOk,
  };
}

import { B1_PART3_PASSAGE_LIMITS, B1_PART4_COHESION_DEVICES, B1_PART5_PASSAGE_LIMITS, B1_PART_SHAPE } from './limits.js';

export const B1_READING_RULES_VERSION = 'b1-reading-rules-v1';

/**
 * Exam 8 Parts 1–3 were validated before this rules version.
 * Their shape, key and semantic gates are unchanged, so reuse is explicit.
 * Any other cached part with no rules version is not reused.
 */
export const B1_EXPLICIT_CACHE_COMPATIBILITY = {
  'unversioned-pilot-v7': [1, 2, 3],
};

export const B1_PART5_RISKY_PAIRS = [
  ['explore', 'discover'],
  ['help', 'allow'],
  ['damaged', 'broken'],
  ['think', 'believe'],
  ['rent', 'hire'],
  ['start', 'begin'],
  ['finish', 'end'],
  ['choose', 'select'],
  ['buy', 'purchase'],
  ['like', 'love'],
];

export function b1Part5RiskyPairText() {
  return B1_PART5_RISKY_PAIRS.map(([left, right]) => `${left}/${right}`).join('; ');
}

const SEMANTIC = {
  1: 'Part 1 tests the main message of each short text. Exactly one option is fully supported. Distractors are believable misunderstandings of time, place, person or action. A copied distinctive phrase that gives the answer away is a failure.',
  2: 'Part 2 matches each person on every material requirement. One text is clearly best. If a text is only for adults, the profile states an age that qualifies, and a child or teenager is not made older to force the match. A leave-by time must still be possible.',
  3: `Part 3 uses one passage of ${B1_PART3_PASSAGE_LIMITS.targetMin}–${B1_PART3_PASSAGE_LIMITS.targetMax} words, inside ${B1_PART3_PASSAGE_LIMITS.min}–${B1_PART3_PASSAGE_LIMITS.max}. Q15 is the whole-text question. Exactly one option is defensible. Distractors come from ideas in the passage. The language stays at B1.`,
  4: 'Part 4 removes five sentences from one continuous text and leaves three unused. Each correct sentence fits only one gap. A sentence that is coherent in more than one gap is a multifit and fails. Copied two-word anchors are a defect. Cohesion may be a pronoun, time, contrast, cause or a logical step, judged by reading the reconstructed text. A device name does not have to be proven by one keyword.',
  5: `Part 5 is one connected text of about ${B1_PART5_PASSAGE_LIMITS.targetMin}–${B1_PART5_PASSAGE_LIMITS.targetMax} words. Each gap has exactly one acceptable B1 answer. A tempting distractor is useful. Two options that are both natural British English in that sentence are a failure.`,
  6: 'Part 6 tests six different grammar or fixed-language targets. Each gap accepts exactly one ordinary word. A second ordinary word that keeps the same meaning is a failure. The six answers are different words.',
};

export function b1SemanticCriteria(partNumber) {
  const text = SEMANTIC[Number(partNumber)] || '';
  return `${B1_READING_RULES_VERSION}. ${text}`.trim();
}

export function b1SharedRuleBlock(partNumber) {
  const part = Number(partNumber);
  const shape = B1_PART_SHAPE[part];
  const lines = [
    `Shared B1 Reading rules ${B1_READING_RULES_VERSION}.`,
    b1SemanticCriteria(part),
  ];
  if (shape?.questions) {
    lines.push(`Question numbers run from ${shape.questions[0]} to ${shape.questions[1]}.`);
  }
  if (part === 3) {
    lines.push(`Write ${B1_PART3_PASSAGE_LIMITS.targetMin} to ${B1_PART3_PASSAGE_LIMITS.targetMax} words. Hard limits are ${B1_PART3_PASSAGE_LIMITS.min} and ${B1_PART3_PASSAGE_LIMITS.max}. Do not aim for the minimum.`);
  }
  if (part === 4) {
    lines.push(`Name a cohesion device only when the sentence uses it. Allowed names: ${B1_PART4_COHESION_DEVICES.join(', ')}. Do not assign a device merely to fill the example.`);
  }
  if (part === 5) {
    lines.push(`Aim for ${B1_PART5_PASSAGE_LIMITS.targetMin}–${B1_PART5_PASSAGE_LIMITS.targetMax} words in the completed text. A completed text under ${B1_PART5_PASSAGE_LIMITS.hardMin} words fails.`);
  }
  return lines.join('\n');
}

export function assessB1CacheReuse(payload, partNumber) {
  const version = payload?.rulesVersion || null;
  if (version === B1_READING_RULES_VERSION) {
    return { reuse: true, explicit: false, reason: version };
  }
  const allowed = B1_EXPLICIT_CACHE_COMPATIBILITY['unversioned-pilot-v7'] || [];
  if (!version && allowed.includes(Number(partNumber))) {
    return {
      reuse: true,
      explicit: true,
      reason: `Part ${partNumber} was validated before ${B1_READING_RULES_VERSION}. Reuse is an explicit compatibility decision because its acceptance criteria are unchanged.`,
    };
  }
  return {
    reuse: false,
    explicit: false,
    reason: version
      ? `Cached rules version ${version} does not match ${B1_READING_RULES_VERSION}.`
      : `Cached Part ${partNumber} has no rules version and is not on the explicit compatibility list.`,
  };
}

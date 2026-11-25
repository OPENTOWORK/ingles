import { B1_PART3_PASSAGE_LIMITS, B1_PART4_COHESION_DEVICES, B1_PART5_PASSAGE_LIMITS, B1_PART_SHAPE } from './limits.js';

export const B1_READING_RULES_VERSION = 'b1-reading-rules-v3';

/**
 * Parts validated under an earlier rules version stay on disk.
 * v3 changes how review evidence is read, so v1 and v2 caches are not reused.
 */
export const B1_EXPLICIT_CACHE_COMPATIBILITY = {
  'unversioned-pilot-v7': [],
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
  1: 'Part 1 tests the main message of each short text. Exactly one option is fully supported. The correct option paraphrases that message. Distractors are believable misunderstandings of something the text contains. An option about an event the text never mentions is a failure, as is a correct option that copies the text.',
  2: 'Part 2 matches each person on every material requirement, including age, day, time and restrictions. One text is clearly best. Support must be positive: a shared activity word is not enough. If a text is only for adults, the profile states an age that qualifies, and a child or teenager is not made older to force the match. A leave-by time must still be possible. A stated weekend, weekday or time of day that the keyed text does not make possible is unsupported.',
  3: `Part 3 uses one passage of ${B1_PART3_PASSAGE_LIMITS.targetMin}–${B1_PART3_PASSAGE_LIMITS.targetMax} words, inside ${B1_PART3_PASSAGE_LIMITS.min}–${B1_PART3_PASSAGE_LIMITS.max}. Q15 is the whole-text question. Detail may use a stated fact. Inference, attitude and gist must require a conclusion the passage does not state. If the passage already states the answer, statedDirectly is true even when the question is labelled inference. certainty is certain or uncertain. An uncertain judgement is inconclusive and does not pass. Exactly one option is defensible. Distractors come from ideas in the passage. Each option has one letter label and no second letter inside the wording. The language stays at B1.`,
  4: 'Part 4 removes five sentences from one continuous text and leaves three unused. Each correct sentence fits only one gap and adds information the neighbouring sentences do not already state. A sentence that only repeats the previous or next sentence fails cohesion. A sentence that is coherent in more than one gap is a multifit and fails. Copied two-word anchors are a defect. Cohesion may be a pronoun, time, contrast, cause or a logical step, judged by reading the reconstructed text. A device name does not have to be proven by one keyword.',
  5: `Part 5 is one connected text of about ${B1_PART5_PASSAGE_LIMITS.targetMin}–${B1_PART5_PASSAGE_LIMITS.targetMax} words. Each gap has exactly one answer that is grammatical, idiomatic in that sentence, and faithful to the writer's meaning. A second option that meets that test fails the item even when the keyed word is more common. A near-synonym may be a distractor only when this sentence makes it ungrammatical, unidiomatic, or different in meaning. Frequency is not a reason to reject it. A tempting distractor is useful. Each option records fits and defect. fits true means the option is a possible answer and defect is none. fits false means it was rejected, and defect is grammar, meaning, context, preference or uncertain. The reason is kept for audit and does not change the decision. A preference does not remove a natural option. A missing, uncertain or contradictory judgement is inconclusive.`,
  6: 'Part 6 tests six different grammar or fixed-language targets. Each gap accepts exactly one ordinary B1 word. The reviewer judges each other word on that gap\'s approved target list, and at least one plausible word outside the list, once. It records grammar, meaning, context, B1 appropriateness and accept separately. The keyed word is never compared with itself as a second answer. Duplicate candidate words are judged once. A planned word that was not reviewed makes the review incomplete. It is not turned into an ambiguity. An empty alternatives list is not evidence that the gap is unique. An incomplete or inconclusive test fails closed. A word list cannot by itself prove that no other natural word exists. The six answers are different words.',
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

export {
  B1_PART3_PASSAGE_LIMITS,
  B1_PART4_COHESION_DEVICES,
  B1_PART5_PASSAGE_LIMITS,
  B1_PART_SHAPE,
} from './b1ReadingRules/limits.js';
export {
  B1_EXPLICIT_CACHE_COMPATIBILITY,
  B1_PART5_RISKY_PAIRS,
  B1_READING_RULES_VERSION,
  assessB1CacheReuse,
  b1Part5RiskyPairText,
  b1SemanticCriteria,
  b1SharedRuleBlock,
} from './b1ReadingRules/criteria.js';
export {
  b1Part4DeviceNames,
  b1Part4DevicePlaceholder,
  b1Part4PlanExample,
  b1Part5PlanExample,
  b1Part6PlanExample,
} from './b1ReadingRules/examples.js';
export {
  b1ContentError,
  isB1ContentFailureMessage,
  b1FailureItems,
  b1FailureItemsFromMessages,
  b1ItemSignatureImproved,
  stripB1FailurePrefix,
} from './b1ReadingRules/failures.js';

export function applyB1MotorTransport(options = {}, session = null) {
  if (!session) return options;
  return { ...options, useAssistant: false };
}

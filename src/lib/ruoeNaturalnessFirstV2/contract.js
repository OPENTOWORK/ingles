/**
 * Canonical British-English contract for RUOE naturalness-first v2 (Parts 1–4).
 * Not used by the legacy engine. Not stored in Supabase.
 */
export const RUOE_GENERATION_VERSION_V1 = 'v1';
export const RUOE_GENERATION_VERSION_V2 = 'naturalness-first-v2';

export function resolveRuoeGenerationVersion(value) {
  if (value === RUOE_GENERATION_VERSION_V2) return RUOE_GENERATION_VERSION_V2;
  return RUOE_GENERATION_VERSION_V1;
}

export const NATURALNESS_CONTRACT = `Think, evaluate, and write in natural British English throughout.
Naturalness takes priority over preserving a planned target.
Never force a lexical or grammatical target into an unnatural sentence.
If the planned target cannot be realised in completely natural British English, discard that target and choose another.
Judge every sentence as ordinary English, not as an exercise.
Ask: "Would a competent British English speaker naturally produce this sentence if there were no gap or exam task?"
If the answer is no, reject the item and choose a different target. Do not bend the English to save the target.`;

export const PART1_KNOWLEDGE_TYPES = [
  'collocation',
  'phrasal-verb',
  'fixed-expression',
  'lexical-meaning',
  'dependent-preposition',
  'semantic-distinction',
  'lexical-precision',
];

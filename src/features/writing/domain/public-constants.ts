/**
 * Runtime-safe constants shared by Zod schemas and the Phase-8 client UI.
 *
 * Keep this module free of `zod` imports so preview components never pull the full
 * schema bundle into a browser chunk.
 */

export const CAMBRIDGE_CRITERION_KEYS = [
  'content',
  'communicative_achievement',
  'organisation',
  'language',
] as const;

export type CambridgeCriterionKey = typeof CAMBRIDGE_CRITERION_KEYS[number];

export const WRITING_CATEGORY_KEYS = [
  'grammar',
  'vocabulary',
  'spelling',
  'organisation',
  'content',
  'strength',
] as const;

export type WritingCategoryKey = typeof WRITING_CATEGORY_KEYS[number];

/** The only approved v1 action. It is code-owned, never model-generated. */
export const FINAL_CTA = 'Write another task';

/** A single response is a DRALO correction informed by Cambridge criteria. */
export const DRALO_RESULT_DISCLAIMER =
  'This is a DRALO correction based on the Cambridge B2 First assessment criteria. It is not an official Cambridge result.';

export function isWritingCategoryKey(value: string): value is WritingCategoryKey {
  return (WRITING_CATEGORY_KEYS as readonly string[]).includes(value);
}

/**
 * Interactive Writing Map presentation tokens (Phase 8).
 *
 * `category_key` carries meaning; this module carries presentation. The split is
 * the point: no component asks "is this grammar?" to pick a colour, and no colour
 * value exists in JavaScript at all. Each category resolves to a CSS class, and
 * `src/app/globals.css` owns what that class looks like.
 *
 * PROVISIONAL — REQUIRES R6 VISUAL APPROVAL. The colours behind these classes are
 * derived from the current DRALO writing tokens so the interface can be reviewed.
 * Approving a different palette means editing CSS only: no payload, schema or
 * stored row changes, because none of them ever held a colour.
 *
 * Every category also carries a `marker` glyph and a `label`, so category meaning
 * never depends on colour alone (Doc 06 accessibility).
 */
import { WRITING_CATEGORY_KEYS, type WritingCategoryKey } from '../domain/public-constants';

export interface WritingMapCategoryToken {
  key: WritingCategoryKey;
  /** Learner-facing name. */
  label: string;
  /** One line explaining what the mark means, used by the legend and by ARIA. */
  hint: string;
  /** Redundant non-colour encoding, rendered next to the mark. */
  marker: string;
  className: string;
}

export const WRITING_MAP_CATEGORY_TOKENS: Record<WritingCategoryKey, WritingMapCategoryToken> = {
  grammar: {
    key: 'grammar',
    label: 'Grammar',
    hint: 'A form to correct',
    marker: '§',
    className: 'writing-map-mark--grammar',
  },
  vocabulary: {
    key: 'vocabulary',
    label: 'Vocabulary',
    hint: 'A word choice to sharpen',
    marker: 'W',
    className: 'writing-map-mark--vocabulary',
  },
  spelling: {
    key: 'spelling',
    label: 'Spelling',
    hint: 'A spelling slip',
    marker: 'Sp',
    className: 'writing-map-mark--spelling',
  },
  organisation: {
    key: 'organisation',
    label: 'Organisation',
    hint: 'How the ideas are linked',
    marker: '¶',
    className: 'writing-map-mark--organisation',
  },
  content: {
    key: 'content',
    label: 'Content',
    hint: 'An idea to develop',
    marker: '+',
    className: 'writing-map-mark--content',
  },
  strength: {
    key: 'strength',
    label: 'Strength',
    hint: 'Something that works well',
    marker: '★',
    className: 'writing-map-mark--strength',
  },
};

/** Legend order is fixed, so the map reads the same way on every correction. */
export const WRITING_MAP_LEGEND: WritingMapCategoryToken[] = WRITING_CATEGORY_KEYS.map(
  (key) => WRITING_MAP_CATEGORY_TOKENS[key],
);

export function resolveCategoryToken(key: string): WritingMapCategoryToken {
  const token = WRITING_MAP_CATEGORY_TOKENS[key as WritingCategoryKey];
  if (!token) {
    throw new Error(`unknown writing map category "${key}"; the six keys are closed`);
  }
  return token;
}

/** What each feedback kind is called for the learner — never the raw enum value. */
export const FEEDBACK_KIND_LABELS = {
  correction: 'Correction',
  suggestion: 'Suggestion',
  explanation: 'Explanation',
  teaching_prompt: 'Think about this',
  strength: 'What works',
} as const;

export const CRITERION_LABELS = {
  content: 'Content',
  communicative_achievement: 'Communicative Achievement',
  organisation: 'Organisation',
  language: 'Language',
} as const;

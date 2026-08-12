/**
 * Version registry for engine provenance (Doc 05 §13, Phase 1 test #10).
 * Prompt bodies live in Phase 2+; only version identifiers are pinned here.
 */

export const WRITING_ENGINE_VERSION = '3.0.0';

export const SCHEMA_VERSION = '1.0.0';

/** Approved source document versions (Docs 01–06). */
export const SOURCE_DOC_VERSIONS = {
  task_requirements: '1.0',
  teacher_dna: '1.0',
  cambridge_assessment: '1.0',
  feedback_ux: '1.0',
  technical_handoff: '1.0',
  acceptance_validation: '1.0',
} as const;

export type SourceDocKey = keyof typeof SOURCE_DOC_VERSIONS;

/** Independent prompt template versions (Doc 05 §11). */
export const PROMPT_VERSIONS = {
  task_analysis: '1.0.0',
  /** Layer 2 — Teacher DNA observation extraction. */
  observation_assessment: '1.0.0',
  /** Layer 3 — Cambridge scoring. Versioned apart so a scoring change is visible. */
  cambridge_assessment: '1.0.0',
  feedback_composition: '1.0.0',
} as const;

export type PromptVersionKey = keyof typeof PROMPT_VERSIONS;

export const TASK_ANALYSIS_SCHEMA_VERSION = '1.0.0';

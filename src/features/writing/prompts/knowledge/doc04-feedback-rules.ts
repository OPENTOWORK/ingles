/**
 * Doc 04 — DRALO Writing Feedback UX, encoded as composition knowledge.
 *
 * This file owns how a finished assessment is *communicated*. It owns nothing
 * about how it was scored: by the time any of this runs the four marks are
 * frozen, and the composer's job is to explain them, never to revisit them.
 */
import type { ObservationDomain, WritingCategoryKey } from '../../domain/types';

/**
 * Internal pedagogical domains and the six Interactive Writing Map categories
 * are different vocabularies, so the projection is deliberately partial.
 *
 * `communicative_appropriacy` and `punctuation` are absent on purpose. A
 * register or reader-relationship problem is usually a property of the whole
 * text and belongs in criterion feedback; forcing it into a coloured local span
 * would invent a precision the observation does not have. Doc 04 defines no
 * semantic category for punctuation either, and adding a seventh category or
 * bending an existing one to fit would be inventing UX, not implementing it.
 * Such observations stay valid internally and simply carry no local annotation.
 */
export const DOMAIN_TO_CATEGORY: Partial<Record<ObservationDomain, WritingCategoryKey>> = {
  grammar: 'grammar',
  spelling: 'spelling',
  vocabulary_collocation: 'vocabulary',
  naturalness: 'vocabulary',
  organisation_cohesion: 'organisation',
  content_development: 'content',
  strength: 'strength',
};

export function projectDomainToCategory(domain: ObservationDomain): WritingCategoryKey | null {
  return DOMAIN_TO_CATEGORY[domain] ?? null;
}

/** Domains Doc 04 keeps in criterion feedback rather than on the text. */
export const GLOBAL_ONLY_DOMAINS: ObservationDomain[] = ['communicative_appropriacy', 'punctuation'];

/**
 * Doc 04 §3 — Positive Reinforcement First. Cardinality follows the evidence:
 * praise is never manufactured to fill a slot.
 */
export const OPENING_STRENGTH_RULES = [
  'Open with genuine strengths before any correction.',
  'Zero eligible strengths means zero opening strengths; one means one; two or more means two or three.',
  'Every opening strength must name concrete evidence from the response and say what it achieves.',
  'Never celebrate ordinary correctness as an exceptional achievement.',
  'Never invent praise to satisfy the interface.',
] as const;

/** Doc 04 §5 — explanation depth follows the issue, not a template. */
export const ANNOTATION_DEPTH_RULES = [
  'A spelling or single-word replacement needs the corrected form and, at most, a short reason.',
  'A vocabulary or collocation issue needs the suggested form and a compact explanation of why it fits better.',
  'A grammar, organisation or development issue may identify what is happening, explain it concisely and give an actionable route.',
  'A strength explains specifically what worked and carries no correction.',
  'Bubbles must vary in length according to the issue; none of them is an essay.',
] as const;

/** Doc 04 §6 — progressive disclosure. */
export const CRITERION_DISCLOSURE_RULES = [
  'The summary is a short, plain statement of how the criterion went.',
  'The expanded layer must add what worked, what limited the current band, evidence from the writing and where to focus next.',
  'Everything in both layers must be grounded in the final Assessment Decision Record.',
  'Never re-assess, never issue a new mark and never promise a band in exchange for an action.',
  'For a band 5 criterion, discuss consolidation and refinement; there is no band 6.',
] as const;

/** Doc 04 §6 — next_focus must teach, not recycle the limitation line. */
export const NEXT_FOCUS_RULES = [
  'next_focus is an independent, actionable teaching point — never a restatement of what_limited_the_band.',
  'Do not prefix next_focus with "To move closer to the next band" or paste the limitation sentence after "work on".',
  'Write natural teacher language the learner can transfer to another task: concise, complete and criterion-specific.',
] as const;

/** Clarity over cleverness in criterion summaries and explanations. */
export const CRITERION_CLARITY_RULES = [
  'Prefer direct pedagogical language over clever or cryptic phrasing.',
  'Say plainly what worked, what was unreliable or limited, and what to practise next.',
  'Avoid opaque copy such as "the tone almost holds" or "the accuracy has not caught up with the ambition" when a clearer explanation exists.',
] as const;

/** Doc 04 §8 — what to review next. */
export const REVIEW_NEXT_RULES = [
  'List concepts or skills worth revisiting, chosen from what this response actually shows.',
  'Prioritise transferable value, important patterns, assessment limitations and verified recurrence.',
  'Each reason must explain why that particular concept matters for the learner — not repeat the same sentence across items.',
  'Do not paste a generic examiner-facing line that could apply to any issue in any script.',
  'There is no fixed mix and no quota: not one grammar plus one vocabulary plus one content item.',
  'v1 carries no links and no DRALO materials; resource_key stays null.',
] as const;

/** Doc 04 §2 — the teacher's voice. */
export const VOICE_RULES = [
  'Write as an experienced teacher speaking to this student about this piece of writing.',
  'Never refer to yourself as an AI, a model, an algorithm or a system.',
  'Never claim Cambridge affiliation and never say an official examiner produced the result.',
  'This is a DRALO correction informed by the Cambridge criteria.',
  'Avoid generic praise and avoid repeating the same template for every point.',
  'Address the learner directly and keep the tone constructive.',
] as const;

/** Doc 02 §4 — authorship survives the correction. */
export const VOICE_PRESERVATION_RULES = [
  "Preserve the learner's opinion, stance, factual content and personal experience.",
  'Never rewrite the whole response and never produce an improved or model version.',
  'A local suggested change is allowed when it is proportionate and keeps the original meaning.',
  'When a safe correction would require guessing what the learner meant, ask a useful guiding question instead.',
] as const;

/** Doc 02 §5.4 — selectivity is pedagogical, not cosmetic. */
export const SELECTIVITY_RULES = [
  'Recorded observations and visible annotations are not the same thing.',
  'There is no minimum or maximum number of annotations, and no required mix of categories.',
  'Choose what genuinely deserves this learner’s attention on this script.',
  'Every locally renderable meaning-blocking or meaning-unreliable issue must still be treated, even under a focused strategy.',
] as const;

/**
 * Doc 02 §3.5 — longitudinal claims need verified history. Repetition inside a
 * single script is not history, and these phrasings must never appear without
 * a supplied overlay entry backed by evidence.
 */
export const FORBIDDEN_HISTORY_PHRASES: RegExp[] = [
  /\byou always\b/i,
  /\byou keep (?:making|doing|writing)\b/i,
  /\b(?:this|that) is a recurring (?:error|mistake|problem) for you\b/i,
  /\byou (?:often|repeatedly|constantly) (?:make|write|forget)\b/i,
  /\bwe (?:worked on|studied|covered|practised) this before\b/i,
  /\bas (?:we|you) (?:discussed|saw) (?:last time|previously|before)\b/i,
  /\byou have improved since\b/i,
  /\byour previous (?:writing|essay|work|task)\b/i,
  /\blast time you\b/i,
  /\bagain\b(?=[^.]{0,30}\b(?:like|as) (?:last|previous)\b)/i,
];

/** Doc 04 §2 — the machine must not speak about itself. */
export const FORBIDDEN_VOICE_PHRASES: RegExp[] = [
  /\bas an ai\b/i,
  /\bthe model (?:thinks|believes|considers|says)\b/i,
  /\bbased on my algorithm\b/i,
  /\baccording to the system\b/i,
  /\bi am (?:a|an) (?:ai|language model|assistant)\b/i,
  /\bmy training data\b/i,
];

/**
 * Nothing here may imply an official Cambridge judgement. The lookbehinds
 * matter: the required disclaimer *denies* being an official Cambridge result,
 * and a detector that cannot tell a claim from its denial would ban the very
 * sentence Doc 04 requires.
 */
export const FORBIDDEN_AUTHORITY_PHRASES: RegExp[] = [
  /\bcambridge (?:has |have )?(?:certified|awarded|approved)\b/i,
  /(?<!\bnot\s)(?<!\bnot\san\s)(?<!\bnot\sa\s)\bofficial (?:cambridge )?(?:examiner|result|score|certificate)\b/i,
  /\bon behalf of cambridge\b/i,
  /\bcambridge english assessment (?:says|states|confirms)\b/i,
  /\bthis is your official\b/i,
];

/** A full rewrite would replace the learner's authorship with ours. */
export const FORBIDDEN_REWRITE_PHRASES: RegExp[] = [
  /\bstronger b2 version\b/i,
  /\bimproved version\b/i,
  /\bmodel answer\b/i,
  /\bhere is (?:the |a )?(?:rewritten|corrected|improved) (?:version|response|essay|text)\b/i,
  /\brewritten (?:version|response|essay)\b/i,
];

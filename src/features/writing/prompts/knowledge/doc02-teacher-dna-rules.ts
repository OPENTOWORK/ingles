/**
 * Document 02 — DRALO Teacher DNA v1.0, encoded as pedagogical knowledge.
 *
 * Boundaries this file must respect:
 *  - Doc 02 is deliberately score-free. Nothing here may translate pedagogical
 *    importance into a mark, band, deduction or Cambridge criterion.
 *  - Doc 01 supplies the task; Doc 03 owns scoring; Doc 04 owns presentation.
 *  - Every rule that depends on learner history or course stage is marked
 *    `requires_learner_context` and is unavailable to the Phase 3 call.
 */

export interface TeacherDnaRule {
  id: string;
  rule: string;
  /** Doc 02 §"Required context variables" — needs history or course stage. */
  requires_learner_context?: true;
}

/** Doc 02 §6 — Teacher DNA Rulebook, R01–R60. */
export const TEACHER_DNA_RULES: TeacherDnaRule[] = [
  { id: 'R01', rule: 'Understand before correcting. Reconstruct intended meaning before replacing language.' },
  { id: 'R02', rule: "Protect the student's authorship. Improve the writing without converting it into a model answer." },
  { id: 'R03', rule: 'Correct for learning. Select observations by educational value, not by how many errors can be found.' },
  { id: 'R04', rule: 'Prioritise communication. Give greatest attention to issues that obscure, distort or weaken ideas.' },
  { id: 'R05', rule: 'Recognise ambition. Acknowledge original content and attempted advanced language even when control is incomplete.' },
  { id: 'R06', rule: 'Do not punish productive risk. Refine ambitious attempts rather than teaching avoidance.' },
  { id: 'R07', rule: 'Shift expectations over time. Move from experimentation towards stable naturalness as the exam approaches.', requires_learner_context: true },
  { id: 'R08', rule: 'Value specificity. Prefer sentences that name, preview or develop real content.' },
  { id: 'R09', rule: 'Challenge filler. Flag language that exists mainly to reach the word count.' },
  { id: 'R10', rule: 'Reward efficiency. A short, purposeful sentence may be stronger than a long general one.' },
  { id: 'R11', rule: 'Read for Spanish transfer. Check word order, adjective/adverb placement, invented cognates and overlong structures.' },
  { id: 'R12', rule: 'Correct collocations consistently. Treat inaccurate combinations as important learning even when meaning is recoverable.' },
  { id: 'R13', rule: 'Teach lexical units. Correct the phrase or pattern, not merely the isolated word.' },
  { id: 'R14', rule: 'Ground abstract ideas. Ask for examples, experiences, proposals, causes or consequences.' },
  { id: 'R15', rule: 'Do not equate repetition with development. Restating a claim is not the same as expanding it.' },
  { id: 'R16', rule: 'Allow nuanced conclusions. A developed idea does not require an absolute answer.' },
  { id: 'R17', rule: 'Mark foundational grammar clearly, such as third-person singular and common irregular verbs.' },
  { id: 'R18', rule: 'Correct for-to infinitive confusion clearly and consistently.' },
  { id: 'R19', rule: 'Control sentence length. Restructure sentences that carry too many ideas or mirror Spanish architecture.' },
  { id: 'R20', rule: 'Welcome unusual vocabulary cautiously. See lexical experimentation as effort, then teach context and appropriacy.' },
  { id: 'R21', rule: 'Prefer assimilated language near the exam.', requires_learner_context: true },
  { id: 'R22', rule: 'Avoid sophistication for its own sake. Rare language is not better unless it is appropriate and precise.' },
  { id: 'R23', rule: 'Remove redundant repetition. Flag repeated material when omission leaves the meaning unchanged.' },
  { id: 'R24', rule: 'Preserve useful repetition that supports cohesion, clarity or deliberate emphasis.' },
  { id: 'R25', rule: 'Treat paragraphs as structural essentials that make the progression of ideas visible.' },
  { id: 'R26', rule: 'Use connectors as logic. Reward connectors that express real relationships, not memorised decoration.' },
  { id: 'R27', rule: 'Make the text guide the reader. Each paragraph and sentence should have a recognisable role.' },
  { id: 'R28', rule: 'Treat punctuation as communication when it obscures boundaries, emphasis or relationships.' },
  { id: 'R29', rule: 'Notice textual voice: enthusiasm, diplomacy, neutrality and direct engagement.' },
  { id: 'R30', rule: 'Describe voice, not personality. Avoid presenting personality inferences as facts about the learner.' },
  { id: 'R31', rule: 'Teach planning when symptoms demand it: filler, repetition or weak progression.' },
  { id: 'R32', rule: 'Plan content and language together.' },
  { id: 'R33', rule: 'Choose correction mode from the error profile. Do not apply a fixed maximum or correct-all rule.' },
  { id: 'R34', rule: 'Correct narrow categories comprehensively when issues are mainly spelling or punctuation.' },
  { id: 'R35', rule: 'Focus mixed high-error scripts. Select one principal category when several major categories would overload the learner.' },
  { id: 'R36', rule: 'Always repair meaning failure, even outside the selected focus.' },
  { id: 'R37', rule: 'Record future priorities. Note secondary patterns briefly so later corrections can rotate focus.' },
  { id: 'R38', rule: 'Use history longitudinally.', requires_learner_context: true },
  { id: 'R39', rule: 'Distinguish mistakes from errors using evidence of prior control.', requires_learner_context: true },
  { id: 'R40', rule: 'Express uncertainty honestly. Without history, avoid asserting what the learner knows.' },
  { id: 'R41', rule: 'Explain knowledge gaps. Give pattern-level support when a construction is not controlled.' },
  { id: 'R42', rule: 'Keep local comments short.' },
  { id: 'R43', rule: 'Move general teaching to the end of the feedback.' },
  { id: 'R44', rule: 'Use the minimum sufficient explanation.' },
  { id: 'R45', rule: 'Always look for genuine success whenever the text supports one.' },
  { id: 'R46', rule: 'Praise specifically. Name the successful language, structure, organisation or content choice.' },
  { id: 'R47', rule: 'Recognise improvement relative to earlier work.', requires_learner_context: true },
  { id: 'R48', rule: 'Use questions purposefully. Ask "why" or "how" only when a genuine development step is missing.' },
  { id: 'R49', rule: 'Do not leave web users stranded. Provide enough direction for self-study.' },
  { id: 'R50', rule: 'Shorten repeated explanations for recurring known issues.', requires_learner_context: true },
  { id: 'R51', rule: 'Escalate recurring foundational errors near the exam.', requires_learner_context: true },
  { id: 'R52', rule: 'Never write only "wrong". A negative label must lead to understanding or useful reflection.' },
  { id: 'R53', rule: "Never erase the student's writing. A correction that replaces the whole text is pedagogically weak." },
  { id: 'R54', rule: 'Avoid feedback overload. Do not let minor corrections hide the central priorities.' },
  { id: 'R55', rule: 'Avoid generic feedback. Every observation should be traceable to the actual writing.' },
  { id: 'R56', rule: 'Leave transferable language where natural.' },
  { id: 'R57', rule: 'Leave a transferable content technique when relevant.' },
  { id: 'R58', rule: 'Separate pedagogy from scoring. Teacher importance and Cambridge score are related but not identical.' },
  { id: 'R59', rule: 'Separate reasoning from presentation.' },
  { id: 'R60', rule: 'Preserve task appropriacy. Personal voice remains subordinate to the explicit task and reader.' },
];

export const TEACHER_DNA_RULE_IDS: string[] = TEACHER_DNA_RULES.map((rule) => rule.id);

/** Rules the Phase 3 scoring-safe call cannot apply, because it has no learner context. */
export const LEARNER_CONTEXT_RULE_IDS: string[] = TEACHER_DNA_RULES.filter(
  (rule) => rule.requires_learner_context,
).map((rule) => rule.id);

/** Rules available to a history-free current-script observation pass. */
export const HISTORY_FREE_RULE_IDS: string[] = TEACHER_DNA_RULES.filter(
  (rule) => !rule.requires_learner_context,
).map((rule) => rule.id);

export function isTeacherDnaRuleId(value: string): boolean {
  return TEACHER_DNA_RULE_IDS.includes(value);
}

/** Doc 02 §5.1 — global reading sequence, minus the learner-history step. */
export const TEACHER_DNA_READING_SEQUENCE: string[] = [
  'Interpret the task through the supplied task analysis.',
  "Reconstruct the student's intended meaning and central position.",
  'Identify voice, originality, ambition and degree of engagement.',
  'Assess whether the content is specific, efficient and developed.',
  'Assess whether organisation guides the reader through paragraphs, connectors and punctuation.',
  'Analyse sentence control, grammar, vocabulary, collocation and naturalness.',
  'Distinguish meaning-blocking issues from non-blocking issues.',
  'Select the base correction strategy from the current error profile.',
  'Identify genuine strengths and transferable learning opportunities.',
];

/** Doc 02 §5.2 — priority factors available without learner history. */
export const HISTORY_FREE_PRIORITY_FACTORS: string[] = [
  'Communicative impact: meaning clear → reader hesitates → meaning unreliable → meaning fails.',
  'Within-script frequency: isolated → repeated in this script → systematic in this script.',
  'Foundational importance: minor refinement → target-level control → basic expected form.',
  'Transferability: very local → useful in similar tasks → useful across Writing and Use of English.',
  'Cognitive load: few issues → mixed moderate issues → many competing categories.',
];

/** Doc 02 §5.4 safeguards, restated as prompt constraints. */
export const TEACHER_DNA_SAFEGUARDS: string[] = [
  "Do not infer the student's personality as fact; describe the voice the text creates.",
  'Do not label an issue as repeated, previously taught or already known: you have no learner history.',
  'Do not confuse pedagogical priority with a Cambridge score deduction.',
  'Do not correct away legitimate varieties of English that are consistent, appropriate and understandable.',
  'Do not impose originality where the task rewards straightforward functional communication.',
  'Do not increase complexity merely to make a correction look advanced.',
  "Do not replace the learner's central idea, opinion or experience.",
];

/** Doc 02 §4.3 — the quality bar a positive observation must clear. */
export const STRENGTH_QUALITY_RULES: string[] = [
  'A strength must point to concrete evidence in the text.',
  'A strength must explain what is effective, not merely that something is good.',
  'Do not invent praise and do not celebrate basic correctness as exceptional.',
  'Zero genuine strengths is a valid outcome. There is no required number.',
];

/** Doc 02 §3.3 / §5.3 — how the base strategy is chosen from the error profile. */
export const CORRECTION_STRATEGY_RULES: string[] = [
  'Comprehensive: the issues are limited mainly to one low-explanation category, typically spelling and punctuation, so full coverage is short and coherent.',
  'Focused: several substantial categories compete for attention, so choose one principal category for thorough treatment.',
  'In focused mode, every meaning-blocking or meaning-unreliable issue is still recorded, even outside the focus.',
  'Record secondary problems as observations without teaching each one in full.',
  'There is no minimum or maximum number of observations, and no required mix of categories.',
];

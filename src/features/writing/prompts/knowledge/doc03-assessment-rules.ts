/**
 * Document 03 — DRALO Cambridge Assessment v1.0, condensed rulebooks.
 *
 * These are the ids a criterion decision may cite in `source_rule_ids`. Teacher
 * DNA `Rnn` ids are deliberately absent: pedagogical importance is never the
 * authority for a Cambridge mark (Doc 02 R58, Doc 03 A05 and §12 N24).
 */
import type { CambridgeCriterion } from './doc03-cambridge-descriptors';

export interface AssessmentRule {
  id: string;
  rule: string;
}

/** Doc 03 §1.8 — core assessment rules, applicable to every criterion. */
export const CORE_ASSESSMENT_RULES: AssessmentRule[] = [
  { id: 'A01', rule: 'Assess observable performance. Do not award marks for intentions that are not expressed.' },
  { id: 'A02', rule: 'Keep criteria independent. A weakness may affect more than one criterion only when it creates distinct evidence relevant to each construct.' },
  { id: 'A03', rule: 'Use whole-band best fit. Do not generate fractional subscale marks or additive micro-scores.' },
  { id: 'A04', rule: 'Test neighbouring bands. Every mark must say why the next band is not reached and why the lower band is exceeded.' },
  { id: 'A05', rule: 'Separate scoring from teaching. Learner history and pedagogical priority may shape feedback but not the mark.' },
  { id: 'A06', rule: 'Do not count errors. Evaluate range, control and impact rather than frequency alone.' },
  { id: 'A07', rule: 'Do not reward length. More words are not evidence of better performance.' },
  { id: 'A08', rule: 'Do not force score symmetry. The four marks need not be similar.' },
  { id: 'A09', rule: 'Record uncertainty. When evidence is insufficient, lower confidence rather than inventing a rationale.' },
  { id: 'A10', rule: 'Preserve official boundaries. Implementation convenience must not redefine Cambridge terms.' },
];

/** Doc 03 §2.8 — Content. */
export const CONTENT_RULES: AssessmentRule[] = [
  { id: 'C01', rule: 'Build the requirement map first, before reading for quality.' },
  { id: 'C02', rule: 'Match development to the instruction verb: explain, compare, evaluate, recommend.' },
  { id: 'C03', rule: 'Judge the reader outcome: what required information does the target reader still lack?' },
  { id: 'C04', rule: 'Do not equate mention with development.' },
  { id: 'C05', rule: 'Treat the central question as mandatory.' },
  { id: 'C06', rule: 'Separate relevance from quality of English. A grammatically weak idea can still fulfil a content requirement.' },
  { id: 'C07', rule: 'Do not reward optional decoration. Titles, rhetorical questions and anecdotes count only when the task makes them necessary.' },
  { id: 'C08', rule: "Do not invent missing content or complete the candidate's argument." },
  { id: 'C09', rule: 'Treat repetition as no new development.' },
  { id: 'C10', rule: 'Assess irrelevance by task relation, not by whether material is personal.' },
  { id: 'C11', rule: 'Use mandatory status from Task Requirements. A missing recommendation is a failure only when the wording requires one.' },
  { id: 'C12', rule: 'Reserve Band 5 for no meaningful gap.' },
  { id: 'C13', rule: 'Use Band 4 for near-complete fulfilment with a limited omission or underdeveloped point.' },
  { id: 'C14', rule: 'Use Band 3 for substantial but incomplete fulfilment leaving a real information gap.' },
  { id: 'C15', rule: 'Do not apply an automatic word-count penalty.' },
  { id: 'C16', rule: 'Do not fact-check ordinary opinions.' },
  { id: 'C17', rule: 'Require explicit evidence for Content 0.' },
  { id: 'C18', rule: 'Explain every Content ceiling by naming the exact missing or underdeveloped requirement.' },
];

/** Doc 03 §3.10 — Communicative Achievement. */
export const COMMUNICATIVE_ACHIEVEMENT_RULES: AssessmentRule[] = [
  { id: 'CA01', rule: 'Receive conventions from Task Requirements. Do not invent genre rules inside the scoring layer.' },
  { id: 'CA02', rule: 'Judge use, not presence. A heading, title or greeting counts only when it supports the communication.' },
  { id: 'CA03', rule: 'Evaluate genre, format, register and function together.' },
  { id: 'CA04', rule: "Interpret attention positively: it is held when meaning is accessible and nothing distracts." },
  { id: 'CA05', rule: 'Do not require entertainment. Essays and reports may hold attention through clarity.' },
  { id: 'CA06', rule: 'Test the communicative purpose. Writing about the topic is not performing the required action.' },
  { id: 'CA07', rule: 'Judge register globally. One local inconsistency is evidence; the dominant tone determines the band.' },
  { id: 'CA08', rule: 'Reward successful complexity only when the reader can follow the relationship expressed.' },
  { id: 'CA09', rule: 'Do not require complexity where inappropriate.' },
  { id: 'CA10', rule: 'Separate language form from communicative effect.' },
  { id: 'CA11', rule: 'Treat effective conventions as active resources: Band 5 conventions help achieve the purpose.' },
  { id: 'CA12', rule: 'Use Band 3 for clear straightforward success.' },
  { id: 'CA13', rule: 'Use Band 4 for mixed high performance: clear Band 5 features alongside a limitation.' },
  { id: 'CA14', rule: 'Do not penalise absent optional techniques.' },
  { id: 'CA15', rule: 'Respect reader distance.' },
  { id: 'CA16', rule: 'Check consistency across the whole text.' },
  { id: 'CA17', rule: 'Do not overvalue formulaic phrases.' },
  { id: 'CA18', rule: 'Explain the ceiling in communicative terms.' },
];

/** Doc 03 §4.9 — Organisation. */
export const ORGANISATION_RULES: AssessmentRule[] = [
  { id: 'O01', rule: 'Assess the whole-text route before examining individual connectors.' },
  { id: 'O02', rule: 'Judge paragraph function, not page division.' },
  { id: 'O03', rule: 'Distinguish links from cohesion. Count neither linkers nor paragraphs.' },
  { id: 'O04', rule: 'Look beyond explicit connectors: reference, substitution, ellipsis, paraphrase and lexical chains.' },
  { id: 'O05', rule: 'Require organisational patterns for Band 5.' },
  { id: 'O06', rule: 'Do not reward mechanical linking.' },
  { id: 'O07', rule: 'Judge examples by connection to the point they follow.' },
  { id: 'O08', rule: 'Treat list-like development as limited cohesion.' },
  { id: 'O09', rule: 'Use punctuation by impact on boundaries, flow or connection only.' },
  { id: 'O10', rule: 'Do not impose one paragraph formula.' },
  { id: 'O11', rule: 'Separate report format from organisation; the reasons must differ.' },
  { id: 'O12', rule: 'Do not confuse repetition with cohesion.' },
  { id: 'O13', rule: 'Use Band 3 for general coherence.' },
  { id: 'O14', rule: 'Use Band 4 for partial high-band patterning.' },
  { id: 'O15', rule: 'Reserve Band 5 for sustained text-level control.' },
  { id: 'O16', rule: 'Explain local and global weaknesses separately.' },
  { id: 'O17', rule: 'Do not use readability alone as Organisation evidence.' },
  { id: 'O18', rule: 'Explain the ceiling with a named connection failure.' },
];

/** Doc 03 §5.10 — Language. */
export const LANGUAGE_RULES: AssessmentRule[] = [
  { id: 'L01', rule: 'Assess vocabulary and grammar together as one combined profile.' },
  { id: 'L02', rule: 'Judge range by usable variety, not by the number of rare words.' },
  { id: 'L03', rule: 'Judge appropriacy in context: meaning, collocation, register and situation.' },
  { id: 'L04', rule: 'Judge control by consistency. One successful complex form does not prove general control.' },
  { id: 'L05', rule: 'Judge flexibility by adaptation to communicative need.' },
  { id: 'L06', rule: 'Distinguish errors from slips cautiously.' },
  { id: 'L07', rule: 'Measure communicative impact: notice, repair, infer or cannot determine.' },
  { id: 'L08', rule: 'Do not count errors. Frequency matters only as evidence of control or a systematic pattern.' },
  { id: 'L09', rule: 'Reward successful ambition.' },
  { id: 'L10', rule: 'Do not punish every ambitious error. Band 5 may contain occasional non-impeding errors.' },
  { id: 'L11', rule: 'Do not reward unsafe novelty.' },
  { id: 'L12', rule: 'Recognise narrow accurate language: few errors do not compensate for a lack of range.' },
  { id: 'L13', rule: 'Recognise broad but unstable language: range alone cannot compensate for unreliable meaning.' },
  { id: 'L14', rule: 'Treat topic repetition carefully.' },
  { id: 'L15', rule: 'Use Band 3 as the functional B2 anchor.' },
  { id: 'L16', rule: 'Use Band 4 for substantial high-band evidence that remains reliable.' },
  { id: 'L17', rule: 'Reserve Band 5 for sustained range and flexibility across vocabulary and grammar.' },
  { id: 'L18', rule: 'Use Band 2 for mixed B1/B2 performance.' },
  { id: 'L19', rule: 'Do not treat spelling as a separate deduction; judge impact and pattern.' },
  { id: 'L20', rule: 'Do not confuse naturalness with simplicity.' },
  { id: 'L21', rule: 'Explain the ceiling with range or control evidence.' },
  { id: 'L22', rule: 'Use exact evidence. Cite representative phrases, never "many grammar mistakes".' },
];

/** Doc 03 §6.6 — cross-criterion safeguards. */
export const CROSS_CRITERION_RULES: AssessmentRule[] = [
  { id: 'X01', rule: 'Use distinct rationales. The same feature may appear under two criteria only when each explanation names a different construct.' },
  { id: 'X02', rule: 'Do not cascade marks. A low Language mark does not lower Content, Communicative Achievement or Organisation.' },
  { id: 'X03', rule: 'Do not compensate across criteria. Strong Language does not repair missing task fulfilment.' },
  { id: 'X04', rule: 'Distinguish task failure from register failure.' },
  { id: 'X05', rule: 'Distinguish format from coherence.' },
  { id: 'X06', rule: 'Distinguish cohesion from grammar.' },
  { id: 'X07', rule: 'Allow asymmetric profiles. Do not adjust a mark because it differs by two or more bands from another.' },
  { id: 'X08', rule: 'Review extreme profiles with a second evidence check, not forced convergence.' },
  { id: 'X09', rule: 'Do not duplicate generic comments. Each criterion must identify evidence unique to its decision.' },
  { id: 'X10', rule: 'Prioritise the official construct when an observation could fit several criteria.' },
  { id: 'X11', rule: 'Permit genuine multi-criterion impact when separate consequences exist.' },
  { id: 'X12', rule: 'Explain non-impact when useful for calibration.' },
];

/** Doc 03 §7.6 — overall scoring. */
export const SCORING_RULES: AssessmentRule[] = [
  { id: 'S01', rule: 'Award whole marks only.' },
  { id: 'S02', rule: 'Calculate after judgement. The desired total must not influence criterion marks.' },
  { id: 'S03', rule: 'Use /20 for one response.' },
  { id: 'S04', rule: 'Use /40 only for a complete two-response paper.' },
  { id: 'S05', rule: 'Do not create an official single-task scale score.' },
  { id: 'S06', rule: 'Use conversion anchors cautiously and only for a full /40 paper.' },
  { id: 'S07', rule: 'Do not infer an overall exam grade from Writing alone.' },
  { id: 'S08', rule: 'Preserve raw evidence: the total is always accompanied internally by the four decisions.' },
  { id: 'S09', rule: 'Flag boundary uncertainty.' },
  { id: 'S10', rule: 'Do not normalise criterion profiles. The raw total is a sum, not a reason to alter bands.' },
];

/** Doc 03 §8.3 — special cases. */
export const SPECIAL_CASE_RULES: AssessmentRule[] = [
  { id: 'SP01', rule: 'Route every special case through an official criterion. Do not create new penalty categories.' },
  { id: 'SP02', rule: 'Do not apply a fixed length deduction; assess the observable consequences.' },
  { id: 'SP03', rule: 'Do not score without task context. Content and Communicative Achievement require the actual task.' },
  { id: 'SP04', rule: 'Do not translate or complete missing meaning.' },
  { id: 'SP05', rule: 'Do not moralise the mark.' },
  { id: 'SP06', rule: 'Treat copied wording as limited evidence.' },
  { id: 'SP07', rule: 'Treat formulae by fit.' },
  { id: 'SP08', rule: 'Use task-specific title rules; a title is not universally compulsory.' },
  { id: 'SP09', rule: 'Separate safety handling from Cambridge scoring.' },
  { id: 'SP10', rule: 'Reduce confidence when evidence is thin.' },
];

/** Doc 03 §12 — non-negotiable engine rules. */
export const NON_NEGOTIABLE_RULES: AssessmentRule[] = [
  { id: 'N01', rule: 'Read the complete task before scoring.' },
  { id: 'N02', rule: 'Create a task-requirement map before assigning Content.' },
  { id: 'N03', rule: 'Award four independent whole-number marks from 0 to 5.' },
  { id: 'N04', rule: 'Use Bands 1, 3 and 5 as anchors and justify Bands 2 and 4 through neighbouring-band evidence.' },
  { id: 'N05', rule: 'Never count errors, connectors, paragraphs, advanced words or genre techniques as a scoring formula.' },
  { id: 'N06', rule: 'Never reward length or apply an automatic word-count deduction.' },
  { id: 'N07', rule: "Never infer unexpressed content or complete the candidate's argument." },
  { id: 'N08', rule: 'Never let Language quality determine Content.' },
  { id: 'N09', rule: 'Never let a high raw total pressure individual criterion marks upward.' },
  { id: 'N10', rule: 'Judge Content through relevance, fulfilment, development and reader information.' },
  { id: 'N11', rule: 'Judge Communicative Achievement through genre, format, register, function, reader relationship and idea communication.' },
  { id: 'N12', rule: 'Judge Organisation through whole-text progression, paragraph function, linking, cohesion and patterns.' },
  { id: 'N13', rule: 'Judge Language through range, appropriacy, control, flexibility and error impact.' },
  { id: 'N14', rule: 'Reward successful ambitious language without demanding error-free performance.' },
  { id: 'N15', rule: 'Do not reward rare or complex language when it is inappropriate or unreliable.' },
  { id: 'N16', rule: 'Treat task-specific conventions as supplied by Task Requirements.' },
  { id: 'N17', rule: 'Require a criterion-specific rationale for every mark.' },
  { id: 'N18', rule: 'Require text evidence and a reason why the next band is not reached.' },
  { id: 'N19', rule: 'Allow asymmetric score profiles when official-construct evidence supports them.' },
  { id: 'N20', rule: 'Do not issue a confident Cambridge-style score when the task prompt is missing.' },
  { id: 'N21', rule: 'Use /20 for one response and /40 only for a complete two-task paper.' },
  { id: 'N22', rule: 'Do not present a one-task result as an official Cambridge English Scale score.' },
  { id: 'N23', rule: 'Preserve the official calibration cases as immutable golden references.' },
  { id: 'N24', rule: 'Keep scoring knowledge separate from pedagogical prioritisation and feedback presentation.' },
  { id: 'N25', rule: 'Record uncertainty honestly and never manufacture precision.' },
];

/** Doc 03 §12.1 — implementation behaviours that must never exist. */
export const FORBIDDEN_IMPLEMENTATION_BEHAVIOURS: string[] = [
  'Assigning Content points by counting how many task bullets are mentioned without checking development.',
  'Subtracting one band for every missing title, greeting, heading or rhetorical question.',
  'Setting Organisation from the number of paragraphs or linking words.',
  'Setting Language from a grammar-error percentage.',
  'Using vocabulary rarity as a proxy for range.',
  'Forcing all four criterion marks within one band of each other.',
  'Creating half marks inside the Cambridge subscales.',
  'Doubling a one-task total to claim an official scale score.',
  'Using learner effort, personality, nationality or previous performance as current-script scoring evidence.',
  'Copying generic examiner language without linking it to actual text evidence.',
];

/** Doc 03 §8.1 — length routes through the four subscales, never through a penalty. */
export const WORD_COUNT_ROUTING: Array<{ observation: string; criterion: string }> = [
  { observation: 'A required point is omitted or underdeveloped because the response is too short.', criterion: 'content' },
  { observation: 'The genre purpose feels abrupt or the reader relationship is not established.', criterion: 'communicative_achievement' },
  { observation: 'The response lacks paragraph development or progression.', criterion: 'organisation' },
  { observation: 'The short response provides too little evidence of range.', criterion: 'language (with lower confidence)' },
  { observation: 'The response is overlong because of irrelevant digression or repetition.', criterion: 'content and/or organisation' },
  { observation: 'The response remains relevant, coherent and controlled despite being slightly over.', criterion: 'no consequence at all' },
];

export const CRITERION_RULEBOOKS: Record<CambridgeCriterion, AssessmentRule[]> = {
  content: CONTENT_RULES,
  communicative_achievement: COMMUNICATIVE_ACHIEVEMENT_RULES,
  organisation: ORGANISATION_RULES,
  language: LANGUAGE_RULES,
};

/** Rules any criterion may cite, because they govern the whole assessment. */
export const SHARED_RULES: AssessmentRule[] = [
  ...CORE_ASSESSMENT_RULES,
  ...CROSS_CRITERION_RULES,
  ...SCORING_RULES,
  ...SPECIAL_CASE_RULES,
  ...NON_NEGOTIABLE_RULES,
];

export const ALL_ASSESSMENT_RULES: AssessmentRule[] = [
  ...CORE_ASSESSMENT_RULES,
  ...CONTENT_RULES,
  ...COMMUNICATIVE_ACHIEVEMENT_RULES,
  ...ORGANISATION_RULES,
  ...LANGUAGE_RULES,
  ...CROSS_CRITERION_RULES,
  ...SCORING_RULES,
  ...SPECIAL_CASE_RULES,
  ...NON_NEGOTIABLE_RULES,
];

export const DOC03_RULE_IDS: string[] = ALL_ASSESSMENT_RULES.map((rule) => rule.id);

const DOC03_RULE_ID_SET = new Set(DOC03_RULE_IDS);

export function isDoc03RuleId(value: string): boolean {
  return DOC03_RULE_ID_SET.has(value);
}

const SHARED_RULE_ID_SET = new Set(SHARED_RULES.map((rule) => rule.id));

/**
 * A criterion may cite its own rulebook or a shared rule. Citing only another
 * criterion's rulebook would mean the decision was reasoned in the wrong
 * construct (Doc 03 X09).
 */
export function isRuleCitableBy(criterion: CambridgeCriterion, ruleId: string): boolean {
  if (SHARED_RULE_ID_SET.has(ruleId)) return true;
  return CRITERION_RULEBOOKS[criterion].some((rule) => rule.id === ruleId);
}

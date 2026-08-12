/**
 * Document 03 — DRALO Cambridge Assessment v1.0: the official B2 First Writing
 * band anchors and the DRALO operational interpretation of each one.
 *
 * Bands 1, 3 and 5 carry explicit official descriptors. Bands 2 and 4 are mixed
 * profiles that share features of their neighbours — they are neither midpoints
 * nor "the band above minus one mistake" (Doc 03 §1.2), so each requires
 * concrete evidence from both adjacent bands.
 *
 * This file is scoring knowledge only. It contains no pedagogical priority, no
 * learner history and no presentation rules.
 */

export const CAMBRIDGE_CRITERIA = [
  'content',
  'communicative_achievement',
  'organisation',
  'language',
] as const;

export type CambridgeCriterion = (typeof CAMBRIDGE_CRITERIA)[number];

export type BandAnchorKind = 'official_descriptor' | 'mixed_profile';

export interface BandAnchor {
  band: 0 | 1 | 2 | 3 | 4 | 5;
  kind: BandAnchorKind;
  /** The official descriptor, or the official "shares features of" statement. */
  official: string;
  /** DRALO's operational reading of the anchor. Never a new Cambridge rule. */
  operational: string;
}

export interface CriterionDescriptorSet {
  criterion: CambridgeCriterion;
  label: string;
  core_question: string;
  must_not_be_replaced_by: string;
  bands: BandAnchor[];
  /** Doc 03 §7.5 — the rationale patterns that invalidate a mark. */
  invalid_rationale: string[];
}

const CONTENT: CriterionDescriptorSet = {
  criterion: 'content',
  label: 'Content',
  core_question:
    'Did the candidate address and develop the required content so that the target reader is informed?',
  must_not_be_replaced_by: 'Grammar accuracy, sophistication or length.',
  bands: [
    {
      band: 5,
      kind: 'official_descriptor',
      official: 'All content is relevant to the task. Target reader is fully informed.',
      operational:
        'Every mandatory point and function is recognisably fulfilled and developed to the degree required. No meaningful content gap remains. Minor linguistic ambiguity belongs elsewhere unless it prevents the content from being understood.',
    },
    {
      band: 4,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 3 and 5.',
      operational:
        'The response is close to complete but contains a limited omission, underdeveloped point or small relevance problem. The reader is more than merely "on the whole" informed, but not unequivocally fully informed.',
    },
    {
      band: 3,
      kind: 'official_descriptor',
      official:
        'Minor irrelevances and/or omissions may be present. Target reader is on the whole informed.',
      operational:
        'The task is substantially completed, but at least one notable point, function or required development is missing, limited or only indirectly addressed. The reader understands the response but has a real information gap.',
    },
    {
      band: 2,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 1 and 3.',
      operational:
        'The response completes a meaningful part of the task but has a substantial omission, misinterpretation or development failure. The reader receives more than minimal information but less than a generally complete response.',
    },
    {
      band: 1,
      kind: 'official_descriptor',
      official:
        'Irrelevances and misinterpretation of task may be present. Target reader is minimally informed.',
      operational:
        'Only a small part of the task is successfully addressed. Major required points are absent or misunderstood, but some relevant information can still be recovered.',
    },
    {
      band: 0,
      kind: 'official_descriptor',
      official: 'Content is totally irrelevant. Target reader is not informed.',
      operational:
        'The response does not address the task in any meaningful way, or the submitted content is wholly unrelated to the required communication.',
    },
  ],
  invalid_rationale: [
    'The rationale mentions grammar or vocabulary quality instead of task fulfilment.',
    'Band 5 is awarded while a mandatory task point or function remains missing or underdeveloped.',
    'Band 0 is awarded without explicitly showing total irrelevance.',
  ],
};

const COMMUNICATIVE_ACHIEVEMENT: CriterionDescriptorSet = {
  criterion: 'communicative_achievement',
  label: 'Communicative Achievement',
  core_question:
    'Did the candidate use the task conventions, register and functions effectively for the intended reader and purpose?',
  must_not_be_replaced_by: 'A checklist of decorative genre techniques.',
  bands: [
    {
      band: 5,
      kind: 'official_descriptor',
      official:
        'Uses the conventions of the communicative task effectively to hold the target reader’s attention and communicate straightforward and complex ideas, as appropriate.',
      operational:
        'Genre, format, register and function consistently support the communication. The writer controls the reader relationship and can bring together both simple and more demanding ideas when the task provides an opportunity.',
    },
    {
      band: 4,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 3 and 5.',
      operational:
        'The response is clearly successful and often effective, but either complexity, flexibility, consistency or reader impact is not sustained enough for Band 5.',
    },
    {
      band: 3,
      kind: 'official_descriptor',
      official:
        'Uses the conventions of the communicative task to hold the target reader’s attention and communicate straightforward ideas.',
      operational:
        'The requested genre and register are recognisable and suitable overall. The reader can follow and remains engaged, but communication relies mainly on straightforward ideas or shows some inconsistency when more demanding ideas are attempted.',
    },
    {
      band: 2,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 1 and 3.',
      operational:
        'The task conventions are partly successful, but mismatches, unclear expression or inconsistent reader awareness regularly weaken the effect.',
    },
    {
      band: 1,
      kind: 'official_descriptor',
      official:
        'Uses the conventions of the communicative task in generally appropriate ways to communicate straightforward ideas.',
      operational:
        'The basic genre or relationship is recognisable, but control is limited and the response only minimally achieves the communicative purpose.',
    },
    {
      band: 0,
      kind: 'official_descriptor',
      official: 'Performance below Band 1.',
      operational:
        'The response does not establish a usable communicative relationship or task convention profile.',
    },
  ],
  invalid_rationale: [
    'The rationale merely lists a title, greeting or rhetorical question without explaining communicative effect.',
    'Band 5 is awarded with no sustained evidence of effective conventions and successful idea communication.',
    'A mark is reduced because an optional technique is absent.',
  ],
};

const ORGANISATION: CriterionDescriptorSet = {
  criterion: 'organisation',
  label: 'Organisation',
  core_question:
    'Is the text coherent and organised through appropriate linking, cohesion and organisational patterns?',
  must_not_be_replaced_by: 'Counting paragraphs or connectors.',
  bands: [
    {
      band: 5,
      kind: 'official_descriptor',
      official:
        'Text is well organised and coherent, using a variety of cohesive devices and organisational patterns to generally good effect.',
      operational:
        'The reader can follow the whole text easily. Connections operate within and across paragraphs through more than explicit linkers. Organisational choices support the task and are flexible enough to avoid mechanical repetition.',
    },
    {
      band: 4,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 3 and 5.',
      operational:
        'The text is clearly well organised and contains some higher-band cohesion or patterning, but cross-paragraph connection, consistency or flexibility is not fully sustained.',
    },
    {
      band: 3,
      kind: 'official_descriptor',
      official:
        'Text is generally well organised and coherent, using a variety of linking words and cohesive devices.',
      operational:
        'The response has a clear structure and is easy to follow overall. Connections may be conventional and some local links may be weak, but the text functions coherently.',
    },
    {
      band: 2,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 1 and 3.',
      operational:
        'A recognisable structure exists, but coherence is mainly local. Limited or misused cohesion, list-like development, repetition or weak paragraph relationships regularly make the reader reconstruct the progression.',
    },
    {
      band: 1,
      kind: 'official_descriptor',
      official:
        'Text is connected and coherent, using basic linking words and a limited number of cohesive devices.',
      operational:
        'Simple connections allow the reader to follow a basic sequence, but organisation is limited and may operate mainly sentence by sentence.',
    },
    {
      band: 0,
      kind: 'official_descriptor',
      official: 'Performance below Band 1.',
      operational:
        'The response lacks sufficient connection or structure for the reader to follow a coherent text.',
    },
  ],
  invalid_rationale: [
    'The mark is based on connector count or paragraph count.',
    'Band 5 is awarded with no organisational patterns or cross-text cohesion identified.',
    'Readability alone is used as organisation evidence without naming the organisational mechanism.',
  ],
};

const LANGUAGE: CriterionDescriptorSet = {
  criterion: 'language',
  label: 'Language',
  core_question:
    'Does the response demonstrate an appropriate range of vocabulary and grammar with sufficient control?',
  must_not_be_replaced_by: 'Counting errors or rare words.',
  bands: [
    {
      band: 5,
      kind: 'official_descriptor',
      official:
        'Uses a range of vocabulary, including less common lexis, appropriately. Uses a range of simple and complex grammatical forms with control and flexibility. Occasional errors may be present but do not impede communication.',
      operational:
        'Vocabulary and grammar show sustained range, appropriacy and adaptable control. Errors are limited in impact and do not undermine the successful expression of more demanding ideas. Band 5 is not error-free performance.',
    },
    {
      band: 4,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 3 and 5.',
      operational:
        'The response contains substantial Band 5 evidence but lacks full consistency, breadth or flexibility. Some less common lexis or complex grammar may be less secure, yet communication remains reliable.',
    },
    {
      band: 3,
      kind: 'official_descriptor',
      official:
        'Uses everyday vocabulary generally appropriately, while occasionally overusing certain lexis. Uses simple grammatical forms with a good degree of control. While errors are noticeable, meaning can still be determined.',
      operational:
        'The writer has a functional B2 range and can use some more demanding resources. Errors are visible but meaning remains clear.',
    },
    {
      band: 2,
      kind: 'mixed_profile',
      official: 'Performance shares features of Bands 1 and 3.',
      operational:
        'Some range beyond the Band 1 anchor is visible, but control, breadth or sentence reliability is too uneven for Band 3.',
    },
    {
      band: 1,
      kind: 'official_descriptor',
      official:
        'Uses basic vocabulary reasonably appropriately. Uses simple grammatical forms with some degree of control. Errors may impede meaning at times.',
      operational:
        'The response communicates using mainly simple resources. The reader can determine meaning, but range and/or control remain B1-like.',
    },
    {
      band: 0,
      kind: 'official_descriptor',
      official: 'Performance below Band 1.',
      operational:
        'Language resources are too limited or unreliable for meaning to be determined sufficiently.',
    },
  ],
  invalid_rationale: [
    'The rationale uses an error total or praises rare words without appropriacy and control.',
    'Band 5 is awarded without range, control and flexibility all being evidenced.',
    'Accuracy alone is treated as evidence of a high band.',
  ],
};

export const CRITERION_DESCRIPTORS: Record<CambridgeCriterion, CriterionDescriptorSet> = {
  content: CONTENT,
  communicative_achievement: COMMUNICATIVE_ACHIEVEMENT,
  organisation: ORGANISATION,
  language: LANGUAGE,
};

export function getBandAnchor(criterion: CambridgeCriterion, band: number): BandAnchor | undefined {
  return CRITERION_DESCRIPTORS[criterion].bands.find((anchor) => anchor.band === band);
}

/** Bands 2 and 4 are mixed profiles requiring evidence from both neighbours. */
export const MIXED_PROFILE_BANDS = [2, 4] as const;

export function neighbouringBands(band: number): { lower: number; higher: number } | null {
  if (band !== 2 && band !== 4) return null;
  return { lower: band - 1, higher: band + 1 };
}

/**
 * Doc 03 §10.1 — the twelve official calibration profiles.
 *
 * **Calibration labels only.** Expected marks and examiner lessons live in
 * `src/features/writing/calibration/golden-cases.ts` for Phase 9 harnesses.
 * They must never be injected into Task Analysis, Observation or Assessment prompts.
 */
export interface CalibrationProfile {
  id: string;
  source: string;
  task: string;
  marks: { content: number; communicative_achievement: number; organisation: number; language: number };
  raw_total: number;
  lesson: string;
}

const profile = (
  id: string,
  source: string,
  task: string,
  marks: [number, number, number, number],
  lesson: string,
): CalibrationProfile => ({
  id,
  source,
  task,
  marks: {
    content: marks[0],
    communicative_achievement: marks[1],
    organisation: marks[2],
    language: marks[3],
  },
  raw_total: marks[0] + marks[1] + marks[2] + marks[3],
  lesson,
});

export const OFFICIAL_CALIBRATION_PROFILES: CalibrationProfile[] = [
  profile('G-01', 'HB 2025 digital', 'environmental essay A', [4, 3, 3, 3],
    'Near-complete Content can stop at 4 when a third aspect and full solutions are missing.'),
  profile('G-02', 'HB 2025 digital', 'environmental essay B', [3, 3, 3, 3],
    'Relevant discussion does not fully answer the central question.'),
  profile('G-03', 'HB 2025 digital', 'environmental essay C', [5, 5, 4, 5],
    'High performance can still have Organisation 4 when paragraphs are not fully linked.'),
  profile('G-04', 'HB 2025 digital', 'book review D', [5, 3, 3, 3],
    'Complete task fulfilment with appropriate review conventions can remain a straightforward Band 3 profile.'),
  profile('G-05', 'HB 2025 digital', 'useful-thing article E', [5, 3, 3, 3],
    'Detailed task completion does not automatically raise other subscales above 3.'),
  profile('G-06', 'HB 2025 digital', 'informal email F', [5, 3, 4, 3],
    'Strong response structure and reference to the input can produce Organisation 4.'),
  profile('G-07', 'HB 2025 paper', 'fashion essay A', [5, 2, 2, 2],
    'Content is independent of unclear expression, limited cohesion and weak language.'),
  profile('G-08', 'HB 2025 paper', 'fashion essay B', [5, 3, 4, 3],
    'Clear cross-sentence referencing can raise Organisation above CA and Language.'),
  profile('G-09', 'HB 2025 paper', 'fashion essay C', [5, 5, 5, 5],
    'A full high-band profile requires separate evidence in every subscale.'),
  profile('G-10', 'HB 2025 paper', 'technology report D', [5, 4, 4, 3],
    'Effective report format and organisation can coexist with Band 3 language.'),
  profile('G-11', 'HB 2025 paper', 'music article E', [4, 3, 2, 2],
    'An underdeveloped task relationship and list-like organisation produce an asymmetric profile.'),
  profile('G-12', 'SS 2015 paper', 'course review F', [5, 3, 4, 3],
    'Clear paragraph functions and referencing can support Organisation 4 in a straightforward review.'),
];

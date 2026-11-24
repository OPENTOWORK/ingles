/**
 * Local preview only. Shown when the writing page is opened with
 * ?sampleCorrection=1 during development, so the colour map and the side
 * bubble can be reviewed without a live Dralo check. Production never mounts it.
 */

const ESSAY = [
  'Plastic waste is a serious problem in many cities. People has throw too much packaging away every day, and the enviroment is paying the price. A lot of stuff ends up in the sea because there are not enough bins.',
  'Also also, companies should use less plastic. Individuals can carry a reusable bag, and governments can charge for single-use cups. These steps are simple, but they only work when everyone takes part.',
  'In conclusion, reducing plastic waste needs people, companies and clear government rules. If we start with small daily habits, the amount of waste can fall quickly.',
].join('\n\n');

function mark(quote, fields) {
  const span_start = ESSAY.indexOf(quote);
  if (span_start < 0) {
    throw new Error(`Sample writing is missing “${quote}”`);
  }
  return {
    annotation_id: fields.id,
    observation_id: fields.id,
    category_key: fields.category,
    feedback_kind: fields.kind,
    original_text: quote,
    span_start,
    span_end: span_start + quote.length,
    local_explanation: fields.why,
    suggested_change: fields.suggestion,
    teaching_prompt: null,
  };
}

function criterion(key, markValue, summary, expanded) {
  return {
    criterion: key,
    mark: markValue,
    summary,
    expanded: {
      what_worked: expanded.worked,
      what_limited_the_band: expanded.limited,
      evidence: expanded.evidence.map((quote) => ({ quote })),
      next_focus: expanded.next,
    },
  };
}

const criteria = {
  content: 3,
  communicative_achievement: 4,
  organisation: 3,
  language: 3,
};

export const WRITING_SAMPLE_CORRECTION = {
  essay: ESSAY,
  v3: {
    candidate_response: ESSAY,
    task_prompt_snapshot: '',
    feedback_payload: {
      global_result: { raw_total: 13, criteria },
      opening_strengths: [],
      review_next: [],
      annotations: [
        mark('People has throw', {
          id: 'sample-grammar',
          category: 'grammar',
          kind: 'correction',
          why: 'The subject is “People”, so the verb needs a plural form, and “throw” is the bare infinitive rather than the present.',
          suggestion: 'People throw',
        }),
        mark('enviroment', {
          id: 'sample-spelling',
          category: 'spelling',
          kind: 'correction',
          why: 'This word is missing an “n”. The noun is spelled with “-onment”.',
          suggestion: 'environment',
        }),
        mark('A lot of stuff', {
          id: 'sample-vocabulary',
          category: 'vocabulary',
          kind: 'suggestion',
          why: '“Stuff” is too vague for an essay. Name the thing you mean so the reader can picture it.',
          suggestion: 'A great deal of waste',
        }),
        mark('Also also', {
          id: 'sample-organisation',
          category: 'organisation',
          kind: 'correction',
          why: 'Repeating “also” does not show how this paragraph connects to the one before it.',
          suggestion: 'In addition',
        }),
        mark('These steps are simple', {
          id: 'sample-content',
          category: 'content',
          kind: 'suggestion',
          why: 'The idea is clear, but it stays general. One concrete example would show the reader what “simple” looks like.',
          suggestion: 'These steps are simple — for example, taking a bag to the supermarket',
        }),
        mark('In conclusion, reducing plastic waste needs people, companies and clear government rules.', {
          id: 'sample-strength',
          category: 'strength',
          kind: 'strength',
          why: 'This sentence closes the essay by bringing the three ideas back together in a clear order.',
          suggestion: null,
        }),
      ],
      criterion_feedback: [
        criterion('content', criteria.content, 'The essay answers the question and covers individuals, companies and government, but some points stay general.', {
          worked: 'All three notes in the task appear in the answer.',
          limited: 'The middle paragraph lists ideas without developing one of them.',
          evidence: ['These steps are simple'],
          next: 'Add one short example after each suggestion.',
        }),
        criterion('communicative_achievement', criteria.communicative_achievement, 'The tone is suitable for an essay and the reader can follow the point of view.', {
          worked: 'The opening states the problem and the ending gives a clear opinion.',
          limited: 'A few phrases are more spoken than written.',
          evidence: ['A lot of stuff'],
          next: 'Prefer precise written phrases such as “a great deal of waste”.',
        }),
        criterion('organisation', criteria.organisation, 'There is a beginning, a middle and an end, with one link that does not yet do its job.', {
          worked: 'The conclusion returns to the three groups named in the task.',
          limited: 'The second paragraph opens with a repeated linker.',
          evidence: ['Also also'],
          next: 'Use one linker, such as “In addition”, and then start the new point.',
        }),
        criterion('language', criteria.language, 'Most sentences are clear. Grammar and spelling slips are local and easy to repair.', {
          worked: 'Sentence length varies, and the conclusion is accurate.',
          limited: 'The verb after “People” and one spelling error stand out.',
          evidence: ['People has throw', 'enviroment'],
          next: 'Check subject–verb agreement and the spelling of “environment” before you finish.',
        }),
      ],
    },
  },
};

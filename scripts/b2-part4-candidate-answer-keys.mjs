/**
 * Candidate answer keys for B2 Part 4 (Exams 1–3, Q25–30).
 * Phase 2B design — not wired to Supabase or UI yet.
 */

/** @typedef {'APPROVED_KEY' | 'NEEDS_HUMAN_REVIEW' | 'REWRITE_REQUIRED'} ReviewStatus */

/**
 * @typedef {object} B2Part4TestCase
 * @property {string} label
 * @property {string} answer
 * @property {0 | 1 | 2} expectedScore
 * @property {string} note
 */

/**
 * @typedef {object} B2Part4CandidateItem
 * @property {number} examSlot
 * @property {number} questionNumber
 * @property {string} id
 * @property {ReviewStatus} reviewStatus
 * @property {string} pedagogyNotes
 * @property {string[]} reviewFlags
 * @property {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey} answerKey
 * @property {B2Part4TestCase[]} testCases
 */

/** @type {B2Part4CandidateItem[]} */
export const B2_PART4_CANDIDATE_ANSWER_KEYS = [
  {
    examSlot: 1,
    questionNumber: 25,
    id: 'E1Q25',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Negative/limiting quantifier with HARDLY + subject; third-person singular verb agreement on finds.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'HARDLY',
      fullAnswers: ['hardly anyone finds', 'hardly anybody finds'],
      markingPoints: [
        {
          id: 1,
          label: 'negative/limiting quantifier with HARDLY',
          accepted: ['hardly anyone', 'hardly anybody'],
        },
        { id: 2, label: 'third-person singular verb agreement', accepted: ['finds'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'hardly anyone finds', expectedScore: 2, note: 'canonical' },
      { label: 'variant', answer: 'hardly anybody finds', expectedScore: 2, note: 'anybody variant' },
      { label: 'keyword_missing', answer: 'few people find', expectedScore: 0, note: 'no HARDLY token' },
      { label: 'keyword_modified', answer: 'hardly finding anyone', expectedScore: 0, note: 'no exact HARDLY token sequence' },
      { label: 'too_long', answer: 'hardly anyone ever really finds it', expectedScore: 0, note: '6 Cambridge words' },
      { label: 'typical_error', answer: 'hardly no one finds', expectedScore: 1, note: 'double negative but MP2 finds still scores 1/2' },
    ],
  },
  {
    examSlot: 1,
    questionNumber: 26,
    id: 'E1Q26',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Passive agent marker with BY; nominalised phrase the introduction of completing the agent.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'BY',
      fullAnswers: ['by the introduction of'],
      markingPoints: [
        { id: 1, label: 'passive agent marker with BY', accepted: ['by'] },
        { id: 2, label: 'nominalised phrase the introduction of', accepted: ['the introduction of'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'by the introduction of', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'by the introduction', expectedScore: 1, note: 'MP1 only — missing of' },
      { label: 'keyword_missing', answer: 'through the introduction of', expectedScore: 0, note: 'BY absent' },
      { label: 'too_long', answer: 'by the very recent introduction of', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'by introducing of', expectedScore: 1, note: 'wrong verb form but MP2 still matches' },
    ],
  },
  {
    examSlot: 1,
    questionNumber: 27,
    id: 'E1Q27',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Wish/regret: wishes she had (past perfect frame) + past participle moved.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'WISHES',
      fullAnswers: ['wishes she had moved'],
      markingPoints: [
        { id: 1, label: 'wish + past perfect frame', accepted: ['wishes she had'] },
        { id: 2, label: 'past participle', accepted: ['moved'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'wishes she had moved', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'wishes she had', expectedScore: 1, note: 'missing participle' },
      { label: 'keyword_missing', answer: 'regrets she had moved', expectedScore: 0, note: 'WISHES absent' },
      { label: 'keyword_modified', answer: 'wish she had moved', expectedScore: 0, note: 'wish vs wishes' },
      { label: 'too_long', answer: 'wishes she had already really moved', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'wishes she has moved', expectedScore: 1, note: 'wrong tense in MP1 but MP2 scores 1/2' },
    ],
  },
  {
    examSlot: 1,
    questionNumber: 28,
    id: 'E1Q28',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Comparative quantity: fewer public parks + than linker.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'FEWER',
      fullAnswers: ['fewer public parks than'],
      markingPoints: [
        { id: 1, label: 'fewer + noun phrase', accepted: ['fewer public parks'] },
        { id: 2, label: 'comparative linker', accepted: ['than'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'fewer public parks than', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'fewer public parks', expectedScore: 1, note: 'missing than' },
      { label: 'keyword_missing', answer: 'less public parks than', expectedScore: 0, note: 'FEWER absent' },
      { label: 'too_long', answer: 'fewer nice public parks than ever', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'fewer public park than', expectedScore: 1, note: 'agreement error but MPs partially match' },
    ],
  },
  {
    examSlot: 1,
    questionNumber: 29,
    id: 'E1Q29',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Negative necessity: do not/don\'t need + to-infinitive complement to use.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'NEED',
      fullAnswers: ['do not need to use', "don't need to use"],
      markingPoints: [
        { id: 1, label: 'negative necessity', accepted: ['do not need', "don't need"] },
        { id: 2, label: 'infinitive complement', accepted: ['to use'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'do not need to use', expectedScore: 2, note: 'canonical' },
      { label: 'variant', answer: "don't need to use", expectedScore: 2, note: 'contraction' },
      { label: 'partial', answer: "don't need", expectedScore: 1, note: 'missing infinitive complement' },
      { label: 'keyword_missing', answer: 'do not have to use', expectedScore: 0, note: 'NEED absent' },
      { label: 'keyword_modified', answer: 'needed to use', expectedScore: 0, note: 'inflected NEED' },
      { label: 'too_long', answer: 'do not really need to use', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'do not need using', expectedScore: 1, note: 'gerund error but MP1 scores 1/2' },
    ],
  },
  {
    examSlot: 1,
    questionNumber: 30,
    id: 'E1Q30',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'In spite of frame (spite of) + gerund concession clause (the subway being).',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'SPITE',
      fullAnswers: ['spite of the subway being'],
      markingPoints: [
        { id: 1, label: 'in spite of frame', accepted: ['spite of'] },
        { id: 2, label: 'gerund concession clause', accepted: ['the subway being'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'spite of the subway being', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'spite of', expectedScore: 1, note: 'missing gerund clause' },
      { label: 'keyword_missing', answer: 'despite the subway being', expectedScore: 0, note: 'SPITE absent' },
      { label: 'too_long', answer: 'spite of the very crowded subway being', expectedScore: 0, note: '8 words' },
      { label: 'typical_error', answer: 'spite the subway being', expectedScore: 1, note: 'missing of but MP2 scores 1/2' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 25,
    id: 'E2Q25',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Hardly ever frequency block + main verb travels.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'HARDLY',
      fullAnswers: ['hardly ever travels'],
      markingPoints: [
        { id: 1, label: 'hardly ever frequency block', accepted: ['hardly ever'] },
        { id: 2, label: 'main verb', accepted: ['travels'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'hardly ever travels', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'hardly ever', expectedScore: 1, note: 'missing main verb' },
      { label: 'keyword_missing', answer: 'rarely ever travels', expectedScore: 0, note: 'HARDLY absent' },
      { label: 'too_long', answer: 'hardly ever really travels abroad now', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'hardly travels ever', expectedScore: 1, note: 'adverb order error but partial MP match' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 26,
    id: 'E2Q26',
    reviewStatus: 'REWRITE_REQUIRED',
    reviewFlags: ['live question: forbidden by the guide — weak MP2; see E2Q26_PROPOSED_REWRITE'],
    pedagogyNotes:
      'Live item kept for reference only. Approved replacement uses STRICTLY → is strictly forbidden (see proposed rewrite).',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'FORBIDDEN',
      fullAnswers: ['forbidden by the guide'],
      markingPoints: [
        { id: 1, label: 'passive adjective + agent preposition', accepted: ['forbidden by'] },
        { id: 2, label: 'agent NP (weak — live only)', accepted: ['the guide'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'forbidden by the guide', expectedScore: 2, note: 'canonical live answer' },
      { label: 'partial', answer: 'forbidden by', expectedScore: 1, note: 'agent NP missing' },
      { label: 'keyword_missing', answer: 'not allowed by the guide', expectedScore: 0, note: 'FORBIDDEN absent' },
      { label: 'typical_error', answer: 'forbidden from the guide', expectedScore: 1, note: 'wrong preposition but MP2 the guide scores 1/2' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 27,
    id: 'E2Q27',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Modal perfect I could have + past participle attended.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'COULD',
      fullAnswers: ['I could have attended'],
      markingPoints: [
        { id: 1, label: 'subject + modal perfect', accepted: ['I could have'] },
        { id: 2, label: 'past participle', accepted: ['attended'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'I could have attended', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'I could have', expectedScore: 1, note: 'missing participle' },
      { label: 'keyword_missing', answer: 'I would have attended', expectedScore: 0, note: 'COULD absent' },
      { label: 'too_long', answer: 'I could have actually attended it', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'I could attend', expectedScore: 0, note: 'missing perfect aspect' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 28,
    id: 'E2Q28',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Past perfect had never + past participle visited.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'NEVER',
      fullAnswers: ['had never visited'],
      markingPoints: [
        { id: 1, label: 'past perfect + never', accepted: ['had never'] },
        { id: 2, label: 'past participle', accepted: ['visited'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'had never visited', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'had never', expectedScore: 1, note: 'missing participle' },
      { label: 'keyword_missing', answer: 'had not visited', expectedScore: 0, note: 'NEVER absent' },
      { label: 'too_long', answer: 'had never ever visited before today', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'has never visited', expectedScore: 1, note: 'wrong auxiliary but MP2 scores 1/2' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 29,
    id: 'E2Q29',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Reporting passive are thought + infinitive marker to.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'THOUGHT',
      fullAnswers: ['are thought to'],
      markingPoints: [
        { id: 1, label: 'passive reporting verb', accepted: ['are thought'] },
        { id: 2, label: 'infinitive marker', accepted: ['to'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'are thought to', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'are thought', expectedScore: 1, note: 'missing infinitive marker' },
      { label: 'keyword_missing', answer: 'are said to', expectedScore: 0, note: 'THOUGHT absent' },
      { label: 'too_long', answer: 'are widely thought to succeed now', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'are thought that', expectedScore: 1, note: 'wrong complementizer but MP1 scores 1/2' },
    ],
  },
  {
    examSlot: 2,
    questionNumber: 30,
    id: 'E2Q30',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Inversion after No sooner (had we) + past participle completing the past perfect.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'HAD',
      fullAnswers: ['had we arrived'],
      markingPoints: [
        { id: 1, label: 'inversion after No sooner', accepted: ['had we'] },
        { id: 2, label: 'past participle completing the past perfect', accepted: ['arrived'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'had we arrived', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'had we', expectedScore: 1, note: 'inversion without participle' },
      { label: 'keyword_missing', answer: 'we arrived early', expectedScore: 0, note: 'no inverted HAD' },
      { label: 'too_long', answer: 'had we already arrived early today', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'did we arrived', expectedScore: 0, note: 'wrong auxiliary' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 25,
    id: 'E3Q25',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Future passive auxiliary will be + informed about (keyword + complement).',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'INFORMED',
      fullAnswers: ['will be informed about'],
      markingPoints: [
        { id: 1, label: 'future passive auxiliary', accepted: ['will be'] },
        { id: 2, label: 'past participle + preposition complement', accepted: ['informed about'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'will be informed about', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'will be informed', expectedScore: 1, note: 'missing about complement' },
      { label: 'keyword_missing', answer: 'will be told about', expectedScore: 0, note: 'INFORMED absent' },
      { label: 'keyword_modified', answer: 'will be informing about', expectedScore: 0, note: 'active -ing form' },
      { label: 'too_long', answer: 'will be fully informed about it', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'will inform about', expectedScore: 0, note: 'active instead of passive' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 26,
    id: 'E3Q26',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Conditional unless you + main verb improve.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'UNLESS',
      fullAnswers: ['unless you improve'],
      markingPoints: [
        { id: 1, label: 'unless + subject', accepted: ['unless you'] },
        { id: 2, label: 'main verb', accepted: ['improve'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'unless you improve', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'unless you', expectedScore: 1, note: 'missing main verb' },
      { label: 'keyword_missing', answer: 'if you improve', expectedScore: 0, note: 'UNLESS absent' },
      { label: 'too_long', answer: 'unless you really improve soon now', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'unless you improved', expectedScore: 1, note: 'wrong tense but MP1 scores 1/2' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 27,
    id: 'E3Q27',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Present perfect continuous has been + present participle learning.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'BEEN',
      fullAnswers: ['has been learning'],
      markingPoints: [
        { id: 1, label: 'present perfect continuous auxiliary', accepted: ['has been'] },
        { id: 2, label: 'present participle', accepted: ['learning'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'has been learning', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'has been', expectedScore: 1, note: 'missing participle' },
      { label: 'keyword_missing', answer: 'has started learning', expectedScore: 0, note: 'BEEN absent' },
      { label: 'too_long', answer: 'has been actively learning code now', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'is been learning', expectedScore: 1, note: 'wrong auxiliary but MP2 scores 1/2' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 28,
    id: 'E3Q28',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Present perfect negative have not/haven\'t + been to locative pattern.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'BEEN',
      fullAnswers: ['have not been to', "haven't been to"],
      markingPoints: [
        { id: 1, label: 'present perfect negative auxiliary', accepted: ['have not', "haven't"] },
        { id: 2, label: 'been to locative pattern', accepted: ['been to'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'have not been to', expectedScore: 2, note: 'canonical' },
      { label: 'variant', answer: "haven't been to", expectedScore: 2, note: 'contraction' },
      { label: 'partial', answer: 'have not been', expectedScore: 1, note: 'missing to — BEEN present in been' },
      { label: 'keyword_missing', answer: 'have not gone to', expectedScore: 0, note: 'BEEN absent' },
      { label: 'too_long', answer: 'have not ever been to one', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'have not been at', expectedScore: 1, note: 'wrong preposition but MP1 scores 1/2' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 29,
    id: 'E3Q29',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes:
      'Negative past comparison (was not/wasn\'t) + as hard as comparison block containing the second as.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'AS',
      fullAnswers: ['was not as hard as', "wasn't as hard as"],
      markingPoints: [
        {
          id: 1,
          label: 'negative past comparison',
          accepted: ['was not', "wasn't"],
        },
        { id: 2, label: 'as ... as comparison', accepted: ['as hard as'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'was not as hard as', expectedScore: 2, note: 'canonical' },
      { label: 'variant', answer: "wasn't as hard as", expectedScore: 2, note: 'contraction' },
      {
        label: 'partial',
        answer: 'was not as hard',
        expectedScore: 1,
        note: 'MP1 only — missing second as in MP2; keyword AS present once',
      },
      { label: 'keyword_missing', answer: 'was not hard', expectedScore: 0, note: 'AS token absent' },
      {
        label: 'so_variant_rejected',
        answer: 'was not so hard as',
        expectedScore: 1,
        note: 'so not accepted in MPs but MP1 scores 1/2; AS keyword present once',
      },
      { label: 'too_long', answer: 'was not as very hard as', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'was not harder as', expectedScore: 1, note: 'wrong comparative but MP1 was not scores 1/2' },
    ],
  },
  {
    examSlot: 3,
    questionNumber: 30,
    id: 'E3Q30',
    reviewStatus: 'APPROVED_KEY',
    reviewFlags: [],
    pedagogyNotes: 'Wish/regret wishes she had + past participle chosen.',
    answerKey: {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'WISHES',
      fullAnswers: ['wishes she had chosen'],
      markingPoints: [
        { id: 1, label: 'wish + past perfect frame', accepted: ['wishes she had'] },
        { id: 2, label: 'past participle', accepted: ['chosen'] },
      ],
    },
    testCases: [
      { label: 'full', answer: 'wishes she had chosen', expectedScore: 2, note: 'canonical' },
      { label: 'partial', answer: 'wishes she had', expectedScore: 1, note: 'missing participle' },
      { label: 'keyword_missing', answer: 'regrets she had chosen', expectedScore: 0, note: 'WISHES absent' },
      { label: 'too_long', answer: 'wishes she had already chosen one', expectedScore: 0, note: '6 words' },
      { label: 'typical_error', answer: 'wishes she has chosen', expectedScore: 1, note: 'wrong tense in MP1 but MP2 scores 1/2' },
    ],
  },
];

/**
 * Approved rewrite for Exam 2 Q26 (not yet in Supabase).
 * Live item remains REWRITE_REQUIRED until written to production.
 */
export const E2Q26_PROPOSED_REWRITE = {
  id: 'E2Q26-PROPOSED',
  reviewStatus: 'APPROVED_KEY',
  sentence1: 'The guide said, "Visitors must not take photos inside the museum."',
  keyword: 'STRICTLY',
  sentence2: 'According to the guide, taking photos inside the museum ______.',
  pedagogyNotes:
    'Passive structure with STRICTLY adverb (is strictly) + past participle forbidden expressing prohibition.',
  answerKey: {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: 'STRICTLY',
    fullAnswers: ['is strictly forbidden'],
    markingPoints: [
      {
        id: 1,
        label: 'passive structure with the given adverb',
        accepted: ['is strictly'],
      },
      {
        id: 2,
        label: 'past participle expressing prohibition',
        accepted: ['forbidden'],
      },
    ],
  },
  testCases: [
    { label: 'full', answer: 'is strictly forbidden', expectedScore: 2, note: 'canonical proposed answer' },
    { label: 'wrong_tense', answer: 'was strictly forbidden', expectedScore: 1, note: 'MP2 only — never full match' },
    { label: 'keyword_missing', answer: 'is completely forbidden', expectedScore: 0, note: 'STRICTLY absent' },
    { label: 'bare_adjective', answer: 'strictly forbidden', expectedScore: 1, note: '2 words — MP2 forbidden only' },
    { label: 'too_long', answer: 'is strictly completely forbidden right now', expectedScore: 0, note: '6 words' },
  ],
};

/** @deprecated Use E2Q26_PROPOSED_REWRITE */
export const E2Q26_REWRITE_PROPOSALS = [E2Q26_PROPOSED_REWRITE];

export function getCandidateById(id) {
  return B2_PART4_CANDIDATE_ANSWER_KEYS.find((item) => item.id === id) ?? null;
}

export function summarizeReviewCounts() {
  const counts = { APPROVED_KEY: 0, NEEDS_HUMAN_REVIEW: 0, REWRITE_REQUIRED: 0 };
  for (const item of B2_PART4_CANDIDATE_ANSWER_KEYS) {
    counts[item.reviewStatus] += 1;
  }
  return counts;
}

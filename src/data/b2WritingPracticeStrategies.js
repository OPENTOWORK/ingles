/** Strategy & tips + structure checklists for B2 Writing practice (Parts 1–2). */

const PART1_ESSAY = {
  label: 'Writing Part 1 — Essay',
  strategy:
    'Read the question and the three notes first. Plan 4–5 paragraphs before writing: introduction, one paragraph per note, and a conclusion with your opinion. Use linking words (However, In addition, On the other hand) and keep a neutral or semi-formal register.',
  commonMistakes: [
    'Ignoring one of the three notes — all of them must appear in the essay.',
    'Forgetting the "your own idea" point or repeating one of the given notes.',
    'Writing far below 140 words or far above 190 words.',
    'Using informal language (contractions everywhere, slang) in an essay.',
    'Giving an opinion only in the conclusion without supporting reasons.',
  ],
  checklist: [
    'Clear introduction that presents the topic',
    'Note 1 covered in its own paragraph',
    'Note 2 covered in its own paragraph',
    'Your own idea included',
    'Conclusion with your opinion',
    'Linking words used (However, In addition, Firstly…)',
    'Word count between 140 and 190',
  ],
  studyTip:
    'Before checking with Dralo, re-read your essay once and tick the checklist yourself. Finding your own missing note is the fastest way to improve Content scores.',
};

const PART2_GENERAL = {
  label: 'Writing Part 2 — Choose one task',
  strategy:
    'Read both options before you choose. Pick the task type you feel most confident with (article, email, review, report or story). Plan your structure and target 140–190 words — you cannot write both tasks in the exam.',
  commonMistakes: [
    'Choosing without reading both options carefully.',
    'Starting to write before deciding which task suits you best.',
    'Trying to combine ideas from both options into one answer.',
    'Writing far below 140 words or far above 190 words.',
  ],
  checklist: [
    'Both options read and understood',
    'One task chosen (not both)',
    'Task type identified (article, email, review, report or story)',
    'Structure planned before writing',
    'All points in the chosen prompt covered',
    'Word count between 140 and 190',
  ],
  studyTip:
    'If you are unsure, pick the option with the clearest bullet points — it is easier to tick off every requirement as you write.',
};

const PART2_BY_TYPE = {
  article: {
    label: 'Writing Part 2 — Article',
    strategy:
      'Catch the reader’s attention with a title and an engaging first line (a question works well). Use a friendly, lively style, give personal examples, and finish with a short conclusion or recommendation.',
    commonMistakes: [
      'Writing it like an essay — articles should engage and entertain.',
      'No title or opening hook.',
      'Forgetting to answer every question in the prompt.',
    ],
    checklist: [
      'Title included',
      'Engaging opening (question or strong statement)',
      'All prompt questions answered',
      'Personal examples or advice included',
      'Short conclusion or final recommendation',
      'Word count between 140 and 190',
    ],
    studyTip: 'Practise opening lines: a direct question to the reader instantly improves Communicative Achievement.',
  },
  email: {
    label: 'Writing Part 2 — Email / Letter',
    strategy:
      'Identify who you are writing to and why. Open and close appropriately (Hi Sam, … / Best wishes,), answer every question in the input email, and keep a consistent informal or formal register.',
    commonMistakes: [
      'Not answering all the questions from the friend’s email.',
      'Mixing formal and informal register.',
      'Missing opening greeting or closing phrase.',
    ],
    checklist: [
      'Greeting appropriate to the reader',
      'Reference to their email ("Great to hear from you…")',
      'Every question from the input answered',
      'Consistent register throughout',
      'Closing phrase and sign-off',
      'Word count between 140 and 190',
    ],
    studyTip: 'Underline each question in the input email and tick it off as you answer it in your reply.',
  },
  review: {
    label: 'Writing Part 2 — Review',
    strategy:
      'Name what you are reviewing and give context in the first paragraph. Describe it with specific details and opinion vocabulary, then end with a clear recommendation (or not) for the reader.',
    commonMistakes: [
      'Describing without evaluating — a review needs opinions.',
      'No final recommendation.',
      'Repetitive vocabulary (nice, good, bad) instead of richer adjectives.',
    ],
    checklist: [
      'What you are reviewing is clear from the start',
      'Specific details and examples included',
      'Positive and/or negative opinions expressed',
      'Clear recommendation at the end',
      'Varied descriptive vocabulary',
      'Word count between 140 and 190',
    ],
    studyTip: 'Build a bank of evaluation adjectives (impressive, disappointing, outstanding, mediocre) and use 3–4 per review.',
  },
  report: {
    label: 'Writing Part 2 — Report',
    strategy:
      'Use headings (Introduction, Current situation, Recommendations). Keep the register formal and impersonal, describe facts first, and finish with clear recommendations introduced by phrases like "I would suggest…" or "It would be advisable to…".',
    commonMistakes: [
      'Writing one solid block of text without headings.',
      'Being too informal or personal for a report.',
      'Recommendations missing or vague.',
    ],
    checklist: [
      'Headings used to organise sections',
      'Purpose of the report stated in the introduction',
      'Facts/current situation described',
      'Clear recommendations at the end',
      'Formal, impersonal register',
      'Word count between 140 and 190',
    ],
    studyTip: 'Memorise 3 recommendation structures (It would be advisable to…, I would suggest + -ing, The best option would be…).',
  },
  story: {
    label: 'Writing Part 2 — Story',
    strategy:
      'Use the given opening line exactly. Plan a beginning, a problem and a resolution. Use narrative tenses (past simple, past continuous, past perfect) and time expressions to move the story forward.',
    commonMistakes: [
      'Changing or omitting the given first line.',
      'Staying only in the past simple — examiners look for a range of narrative tenses.',
      'An ending that feels rushed or unfinished.',
    ],
    checklist: [
      'Given opening line used exactly',
      'Clear beginning, middle and end',
      'Range of narrative tenses',
      'Time expressions (suddenly, later that day, as soon as…)',
      'Satisfying ending',
      'Word count between 140 and 190',
    ],
    studyTip: 'Practise rewriting simple sentences with past perfect + past simple combinations to add depth.',
  },
};

/**
 * @param {number} partNumber Dralo part number (8 = Part 1, 9 = Part 2)
 * @param {string} [writingType] Part 2 option type (article, email, review, report, story)
 */
export function getB2WritingStrategyPack(partNumber, writingType = '') {
  if (Number(partNumber) === 8) return PART1_ESSAY;
  if (Number(partNumber) === 9) {
    const type = String(writingType || '').toLowerCase();
    if (!type) return PART2_GENERAL;
    return PART2_BY_TYPE[type] || PART2_BY_TYPE.article;
  }
  return null;
}

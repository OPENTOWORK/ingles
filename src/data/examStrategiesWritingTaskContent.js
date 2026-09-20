const TASK_COLUMNS = ['Item', 'Detail', 'Note'];

/**
 * Capítulos de Writing Part 2: cada tipo de tarea con el mismo formato
 * que «Overall Strategy» (qué es, estructura, lenguaje útil, fallos, consejo).
 */
const RAW_TASK_CONTENT = {
  'part-2-review': {
    overview:
      'You review a book, film, restaurant, app or course for a magazine or website. The reader wants your opinion and a clear recommendation, not just a description. Semi-formal and personal, 140–190 words.',
    timing: [
      { part: 'Reader', time: 'Magazine / website', note: 'Semi-formal, personal tone' },
      { part: 'Length', time: '140–190 words', note: 'About 40 minutes' },
      { part: 'Must include', time: 'Opinion', note: 'Plus a clear recommendation' },
    ],
    approach: [
      'Title: short and inviting, naming what you reviewed.',
      'Paragraph 1: what it is, where and when you experienced it.',
      'Paragraph 2: what you liked, with one concrete detail.',
      'Paragraph 3: one weak point, then your recommendation and who it suits.',
    ],
    crossPart: [
      'Opinion: What impressed me most was… / The highlight for me was…',
      'Balance: The only drawback is… / It is not perfect, but…',
      'Recommendation: I would definitely recommend it to… / It is well worth…',
      'Evaluative adjectives: gripping, disappointing, outstanding, overpriced.',
    ],
    mistakes: [
      'Retelling the plot or describing the menu instead of evaluating.',
      'Praising everything — a small criticism makes a review credible.',
      'Finishing without saying whether you recommend it and to whom.',
    ],
    studyTip:
      'Write only the last sentence of five different reviews. A clear recommendation is what raises the Content mark fastest.',
  },

  'part-2-report': {
    overview:
      'You report to a teacher, boss or club president on a situation, a facility or an event and suggest what to do next. It is the most formal Part 2 task: neutral, factual and organised with headings. 140–190 words.',
    timing: [
      { part: 'Reader', time: 'Teacher / manager', note: 'Formal, impersonal tone' },
      { part: 'Length', time: '140–190 words', note: 'About 40 minutes' },
      { part: 'Layout', time: 'Headings', note: 'Two or three short sections' },
    ],
    approach: [
      'Open with the purpose: say what the report covers and where the information comes from.',
      'Use two content sections with headings that match the task bullets.',
      'Give facts first, then your evaluation of each point.',
      'Finish with a Recommendations heading and one or two concrete suggestions.',
    ],
    crossPart: [
      'Purpose: The aim of this report is to… / This report is based on…',
      'Findings: The majority of students felt… / It was generally agreed that…',
      'Evaluating: One clear advantage is… / A significant drawback is…',
      'Recommending: I would suggest that… / It would be advisable to…',
    ],
    mistakes: [
      'Writing in a chatty, personal style with contractions.',
      'Omitting headings and turning the report into an essay.',
      'Ending without recommendations, which the task always asks for.',
    ],
    studyTip:
      'Memorise one heading set — Introduction / Findings / Recommendations — and adapt it. Organisation marks come almost free.',
  },

  'part-2-article': {
    overview:
      'You write for a magazine, newsletter or website read by people like you. The article must sound personal and engaging, and it must answer the question in the task. Semi-formal or informal, 140–190 words.',
    timing: [
      { part: 'Reader', time: 'Magazine readers', note: 'Engaging, semi-formal' },
      { part: 'Length', time: '140–190 words', note: 'About 40 minutes' },
      { part: 'Must include', time: 'A title', note: 'Plus a personal angle' },
    ],
    approach: [
      'Give it a title, then open with a question or a surprising statement.',
      'Answer the question in the task directly — that is the Content mark.',
      'Develop two ideas, each with a short personal example.',
      'Close by involving the reader: a question, a suggestion or a final thought.',
    ],
    crossPart: [
      'Engaging the reader: Have you ever…? / Imagine for a moment that…',
      'Personal voice: In my experience… / What I have learnt is that…',
      'Adding interest: Surprisingly, … / To be honest, … / What is more, …',
      'Closing: So why not give it a try? / The choice, in the end, is yours.',
    ],
    mistakes: [
      'Writing a formal essay instead of an article with personality.',
      'Forgetting the title, which is part of the expected layout.',
      'Using rhetorical questions in every paragraph until it feels forced.',
    ],
    studyTip:
      'Collect three strong opening lines and three closing lines. Having them ready saves the minutes you need for content.',
  },

  'part-2-email': {
    overview:
      'You reply to an email or letter from a friend, an English-speaking contact or an organisation. The register depends on who wrote to you, and you must respond to every point they raised. 140–190 words.',
    timing: [
      { part: 'Reader', time: 'Friend or organisation', note: 'Register follows the reader' },
      { part: 'Length', time: '140–190 words', note: 'About 40 minutes' },
      { part: 'Must include', time: 'All points', note: 'Answer every question asked' },
    ],
    approach: [
      'Underline every question or request in the input before you write.',
      'Open by reacting to their message: thank them or say how good it was to hear from them.',
      'Give one paragraph per point, in the order they were raised.',
      'Close with a forward-looking line and a sign-off matching the register.',
    ],
    crossPart: [
      'Informal opening: Thanks for your email — it was great to hear from you!',
      'Formal opening: I am writing in response to your email of 3 May.',
      'Giving news: You will never guess what… / I thought you might like to know…',
      'Sign-offs: Best wishes / Take care (informal) — Yours sincerely (formal).',
    ],
    mistakes: [
      'Mixing registers: a formal opening followed by slang and contractions.',
      'Answering only two of the three points in the input.',
      'Forgetting the greeting or the sign-off, which cost Organisation marks.',
    ],
    studyTip:
      'Before writing, number the points in the input and tick them off as you cover them. It is the cheapest way to secure Content.',
  },
};

/**
 * @param {string} skill
 * @param {string} chapter
 */
export function getExamStrategiesWritingTaskContent(skill, chapter) {
  if (skill !== 'writing') return null;
  const entry = RAW_TASK_CONTENT[chapter];
  if (!entry) return null;
  return {
    ...entry,
    overviewTitle: 'What is this task?',
    timingTitle: 'Task at a glance',
    timingColumns: TASK_COLUMNS,
    approachTitle: 'How to structure it',
    crossPartTitle: 'Useful language',
  };
}

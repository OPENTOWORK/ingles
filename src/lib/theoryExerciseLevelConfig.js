export const THEORY_CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const SKILL_SLUGS = new Set([
  'reading',
  'listening',
  'writing',
  'speaking',
  'use-of-english',
  'multiple-choice-cloze',
  'open-cloze',
  'key-word-transformations',
  'gapped-text',
  'multiple-matching',
  'cross-text-multiple-matching',
  'multiple-choice-questions',
  'advanced-word-formation',
  'reading-for-gist',
  'skimming-scanning-techni',
  'reading-for-detail',
  'vocabulary-in-context',
  'inference-and-implication',
  'opinion-and-attitude',
  'text-organization-struct',
  'cohesion-and-coherence',
]);

export function parseTopicLevels(levelStr) {
  if (!levelStr) return [...THEORY_CEFR_LEVELS];
  const matches = String(levelStr).match(/\b(A2|B1|B2|C1|C2)\b/gi);
  if (!matches?.length) return [...THEORY_CEFR_LEVELS];
  const unique = [...new Set(matches.map((level) => level.toUpperCase()))];
  return THEORY_CEFR_LEVELS.filter((level) => unique.includes(level));
}

export function defaultExerciseLevel(levelStr) {
  const available = parseTopicLevels(levelStr);
  if (available.includes('B2')) return 'B2';
  return available[0] || 'B2';
}

export function getPrimaryHandcraftedLevel(levelStr) {
  return defaultExerciseLevel(levelStr);
}

function slugToTitle(slug) {
  return String(slug || 'this topic')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function detectSectionFromSlug(slug) {
  const value = String(slug || '').toLowerCase();
  if (SKILL_SLUGS.has(value) || /reading|listening|writing|speaking|cloze|matching|gist|scanning|inference/.test(value)) {
    return 'skill';
  }
  return 'grammar';
}

function isLevelKeyedConfig(config) {
  return THEORY_CEFR_LEVELS.some(
    (level) => config?.[level] && typeof config[level] === 'object' && config[level].multipleChoice,
  );
}

function rotateItems(items, offset, count) {
  if (!items?.length) return [];
  const size = items.length;
  return Array.from({ length: count }, (_, index) => items[(index + offset) % size]);
}

function levelMcBank(topicTitle, level) {
  const label = `[${level}]`;
  return [
    {
      question: `${label} Which statement about "${topicTitle}" is most accurate at ${level} level?`,
      options: [
        'It is never tested in Cambridge exams',
        'It is an important topic for exam preparation',
        'It replaces all grammar on the paper',
        'It only appears at C2',
      ],
      correctAnswer: 1,
      explanation: `"${topicTitle}" is relevant for ${level} exam preparation.`,
    },
    {
      question: `${label} When studying "${topicTitle}", you should:`,
      options: [
        'Memorise rules without examples',
        'Combine rules with practice and feedback',
        'Ignore mistakes completely',
        'Only read, never practise',
      ],
      correctAnswer: 1,
      explanation: 'Active practice with feedback is the most effective approach.',
    },
    {
      question: `${label} At ${level}, a strong strategy for "${topicTitle}" is to:`,
      options: [
        'Work with level-appropriate examples',
        'Skip easier patterns entirely',
        'Avoid timed practice',
        'Never review errors',
      ],
      correctAnswer: 0,
      explanation: 'Level-appropriate examples and review build accuracy.',
    },
    {
      question: `${label} Which habit best supports progress in "${topicTitle}"?`,
      options: [
        'Random guessing under time pressure',
        'Regular short practice sessions',
        'Studying once before the exam only',
        'Avoiding all mock tasks',
      ],
      correctAnswer: 1,
      explanation: 'Consistent practice improves speed and confidence.',
    },
    {
      question: `${label} In "${topicTitle}", exam tasks usually reward candidates who:`,
      options: [
        'Ignore instructions',
        'Apply the skill with evidence from context',
        'Choose the longest option every time',
        'Never check their answers',
      ],
      correctAnswer: 1,
      explanation: 'Context and evidence-based answers are essential at every level.',
    },
  ];
}

function levelTrueFalseBank(topicTitle, level) {
  const label = level;
  return [
    {
      statements: [
        {
          text: `${label}: Understanding "${topicTitle}" helps exam performance.`,
          isTrue: true,
          explanation: 'Strong topic knowledge improves accuracy in all papers.',
        },
        {
          text: `${label}: You never need to review this topic after learning it once.`,
          isTrue: false,
          explanation: 'Spaced review is essential for long-term retention.',
        },
        {
          text: `${label}: Examples are as important as rules.`,
          isTrue: true,
          explanation: 'Examples show how rules work in real language.',
        },
      ],
    },
    {
      statements: [
        {
          text: `${label}: Timed practice is useful for "${topicTitle}".`,
          isTrue: true,
          explanation: 'Exam conditions require both accuracy and speed.',
        },
        {
          text: `${label}: All ${level} tasks use exactly the same format.`,
          isTrue: false,
          explanation: 'Task formats vary; always read the instructions.',
        },
        {
          text: `${label}: Feedback helps you avoid repeating the same mistake.`,
          isTrue: true,
          explanation: 'Error correction strengthens learning.',
        },
      ],
    },
  ];
}

function grammarSupplements(topicTitle, level) {
  const tag = `[${level}]`;
  return {
    fillBlanks: [
      {
        text: `${tag} Good study of ${topicTitle} helps you ___0___ fewer mistakes in exams.`,
        blanks: [{ answer: 'make' }],
      },
      {
        text: `${tag} Practise ${topicTitle} until the rules feel ___0___ and natural.`,
        blanks: [{ answer: 'clear' }],
      },
      {
        text: `${tag} Review your notes on ${topicTitle} ___0___ week.`,
        blanks: [{ answer: 'every' }],
      },
    ],
    matching: [
      {
        title: `${tag} Match the concept to its role`,
        pairs: [
          { left: 'Rule', right: 'Explains the pattern' },
          { left: 'Example', right: 'Shows real usage' },
          { left: 'Practice', right: 'Builds automaticity' },
          { left: 'Feedback', right: 'Corrects mistakes' },
        ],
        explanation: 'Rules, examples, practice, and feedback work together.',
      },
      {
        title: `${tag} Match the term to ${topicTitle}`,
        pairs: [
          { left: 'Form', right: 'How it is built' },
          { left: 'Meaning', right: 'What it expresses' },
          { left: 'Use', right: 'When to choose it' },
          { left: 'Mistake', right: 'What learners often get wrong' },
        ],
        explanation: 'Form, meaning, use, and typical errors are the four pillars.',
      },
    ],
    findError: [
      {
        title: `${tag} Find the mistake`,
        sentence: "She don't understand the rule.",
        options: ['She', "don't", 'understand', 'the rule'],
        correctIndex: 1,
        explanation: "With she/he/it use doesn't, not don't.",
      },
      {
        title: `${tag} Find the mistake`,
        sentence: 'He have finished the exercise.',
        options: ['He', 'have', 'finished', 'the exercise'],
        correctIndex: 1,
        explanation: 'With he/she/it use has, not have.',
      },
      {
        title: `${tag} Find the mistake`,
        sentence: 'They was studying all evening.',
        options: ['They', 'was', 'studying', 'all evening'],
        correctIndex: 1,
        explanation: 'With they/we/you use were, not was.',
      },
    ],
    sentenceOrder: [
      {
        title: `${tag} Order the study steps`,
        words: ['Read', 'the', 'rule', 'carefully', 'first'],
        explanation: 'Start with the rule before practising.',
      },
      {
        title: `${tag} Order the sentence`,
        words: ['Practice', 'makes', 'your', 'English', 'stronger'],
        explanation: 'Regular practice improves performance.',
      },
      {
        title: `${tag} Order the question`,
        words: ['Do', 'you', 'understand', 'this', 'topic', '?'],
        explanation: 'Yes/no questions: Do + subject + base verb.',
      },
    ],
    selectAll: [
      {
        title: `${tag} Select all good strategies for ${topicTitle}`,
        prompt: 'Tick every effective study habit.',
        options: [
          { text: 'Use varied example sentences', isCorrect: true },
          { text: 'Never check your answers', isCorrect: false },
          { text: 'Review mistakes after practice', isCorrect: true },
          { text: 'Skip explanation and only guess', isCorrect: false },
        ],
        explanation: 'Examples and error review strengthen learning.',
      },
      {
        title: `${tag} Select all true statements`,
        prompt: 'Which statements are correct?',
        options: [
          { text: 'Context helps you choose the right form', isCorrect: true },
          { text: 'One rule covers every situation in English', isCorrect: false },
          { text: 'Time expressions often signal the tense', isCorrect: true },
          { text: 'Listening and reading expose you to real usage', isCorrect: true },
        ],
        explanation: 'English requires context; time words and input matter.',
      },
    ],
  };
}

function skillSupplements(topicTitle, level) {
  const tag = `[${level}]`;
  return {
    fillBlanks: [
      {
        text: `${tag} When applying ${topicTitle}, first ___0___ what you need to find.`,
        blanks: [{ answer: 'identify' }],
      },
      {
        text: `${tag} Skim the text to get the ___0___ idea quickly.`,
        blanks: [{ answer: 'main' }],
      },
      {
        text: `${tag} Then read ___0___ for the specific details you need.`,
        blanks: [{ answer: 'carefully' }],
      },
    ],
    matching: [
      {
        title: `${tag} Match the strategy to its purpose`,
        pairs: [
          { left: 'Skimming', right: 'Get the gist fast' },
          { left: 'Scanning', right: 'Find specific information' },
          { left: 'Close reading', right: 'Analyse detail and nuance' },
          { left: 'Checking', right: 'Verify your answer' },
        ],
        explanation: 'Each reading/listening strategy has a distinct goal.',
      },
      {
        title: `${tag} Match the signal to what it shows`,
        pairs: [
          { left: 'However', right: 'Contrast' },
          { left: 'Therefore', right: 'Result' },
          { left: 'For example', right: 'Illustration' },
          { left: 'In contrast', right: 'Opposition' },
        ],
        explanation: 'Discourse markers guide interpretation.',
      },
    ],
    findError: [
      {
        title: `${tag} Find the weak advice`,
        sentence: 'You should read every word at the same slow speed.',
        options: ['You', 'should', 'every word', 'slow speed'],
        correctIndex: 2,
        explanation: 'Adjust speed: skim/scan first, then read carefully where needed.',
      },
      {
        title: `${tag} Find the weak advice`,
        sentence: 'Never read the question before the text.',
        options: ['Never', 'read', 'the question', 'before the text'],
        correctIndex: 0,
        explanation: 'Always read the task/question first to know what to look for.',
      },
      {
        title: `${tag} Find the weak advice`,
        sentence: 'If you are unsure, always choose the longest option.',
        options: ['If you are unsure', 'always', 'choose', 'the longest option'],
        correctIndex: 3,
        explanation: 'Length is not a reliable clue; use evidence from the text.',
      },
    ],
    sentenceOrder: [
      {
        title: `${tag} Order the exam steps`,
        words: ['Read', 'the', 'instructions', 'carefully', 'first'],
        explanation: 'Instructions tell you exactly what to do.',
      },
      {
        title: `${tag} Order the process`,
        words: ['Locate', 'the', 'relevant', 'section', 'of', 'the', 'text'],
        explanation: 'Find where the answer likely appears before answering.',
      },
      {
        title: `${tag} Order the checking steps`,
        words: ['Check', 'your', 'answer', 'against', 'the', 'text'],
        explanation: 'Always verify with evidence.',
      },
    ],
    selectAll: [
      {
        title: `${tag} Select all effective ${topicTitle} techniques`,
        prompt: 'Tick every good technique.',
        options: [
          { text: 'Underline key words in the question', isCorrect: true },
          { text: 'Ignore the time limit completely', isCorrect: false },
          { text: 'Use context to infer meaning', isCorrect: true },
          { text: 'Guess without returning to the text', isCorrect: false },
        ],
        explanation: 'Keywords, context, and evidence-based answers are essential.',
      },
      {
        title: `${tag} Select all true statements`,
        prompt: 'Which are correct?',
        options: [
          { text: 'Paraphrasing is common in exam texts', isCorrect: true },
          { text: 'The exact same words always appear in the answer', isCorrect: false },
          { text: 'Tone and attitude can be tested', isCorrect: true },
          { text: 'Practice improves speed and accuracy', isCorrect: true },
        ],
        explanation: 'Exams use paraphrase; tone matters; practice helps.',
      },
    ],
  };
}

function supplementsForLevel(section, topicTitle, level) {
  const base = section === 'skill' ? skillSupplements(topicTitle, level) : grammarSupplements(topicTitle, level);
  const offset = THEORY_CEFR_LEVELS.indexOf(level);

  return {
    fillBlanks: rotateItems(base.fillBlanks, offset, 3),
    matching: rotateItems(base.matching, offset, 2),
    findError: rotateItems(base.findError, offset, 3),
    sentenceOrder: rotateItems(base.sentenceOrder, offset, 3),
    selectAll: rotateItems(base.selectAll, offset, 2),
  };
}

function buildMultipleChoiceForLevel(baseConfig, level, topicTitle, primaryLevel) {
  const handcrafted = baseConfig?.multipleChoice?.length >= 5;

  if (handcrafted && level === primaryLevel) {
    return baseConfig.multipleChoice.slice(0, 5);
  }

  return levelMcBank(topicTitle, level);
}

function buildTrueFalseForLevel(baseConfig, level, topicTitle, primaryLevel) {
  if (baseConfig?.trueFalse?.length >= 2 && level === primaryLevel) {
    return baseConfig.trueFalse.slice(0, 2);
  }
  return levelTrueFalseBank(topicTitle, level);
}

function buildLevelPack(config, level, slug, primaryLevel) {
  const topicTitle = slugToTitle(slug);
  const section = detectSectionFromSlug(slug);
  const supplements = supplementsForLevel(section, topicTitle, level);
  const handcrafted = (config?.multipleChoice?.length ?? 0) >= 5;

  if (handcrafted && level === primaryLevel) {
    return config;
  }

  return {
    multipleChoice: buildMultipleChoiceForLevel(config, level, topicTitle, primaryLevel),
    fillBlanks: supplements.fillBlanks,
    trueFalse: buildTrueFalseForLevel(config, level, topicTitle, primaryLevel),
    matching: supplements.matching,
    findError: supplements.findError,
    sentenceOrder: supplements.sentenceOrder,
    selectAll: supplements.selectAll,
  };
}

export function resolveExerciseConfig(config, level, slug, primaryLevel = 'B2') {
  if (!config) return config;
  if (config.byLevel?.[level]) return config.byLevel[level];
  if (isLevelKeyedConfig(config) && config[level]) return config[level];
  return buildLevelPack(config, level, slug, primaryLevel);
}

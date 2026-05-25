/** Configuración por apartado del menú Dralo AI */

export const DRALO_AI_CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

export const DRALO_AI_HUB = {
  title: 'Dralo AI',
  description:
    'Practise every exam skill with exercises generated on demand and instant AI feedback.',
  items: [
    {
      id: 'use-of-english',
      href: '/dralo-ai/use-of-english',
      label: 'Use of English',
      icon: '✏️',
      tagline: 'Grammar, transformations and vocabulary in context',
      accent: 'indigo',
    },
    {
      id: 'reading',
      href: '/dralo-ai/reading',
      label: 'Reading',
      icon: '📖',
      tagline: 'Short texts with comprehension and vocabulary',
      accent: 'ocean',
    },
    {
      id: 'writing',
      href: '/dralo-ai/writing',
      label: 'Writing',
      icon: '📝',
      tagline: 'Guided writing with exam-style correction',
      accent: 'amber',
    },
    {
      id: 'listening',
      href: '/dralo-ai/listening',
      label: 'Listening',
      icon: '🎧',
      tagline: 'Dialogues and audio comprehension',
      accent: 'emerald',
    },
    {
      id: 'speaking',
      href: '/dralo-ai/speaking',
      label: 'Speaking',
      icon: '🎤',
      tagline: 'Oral practice with your AI voice coach',
      accent: 'rose',
    },
    {
      id: 'grammar-coach',
      href: '/dralo-ai/grammar-coach',
      label: 'Grammar coach',
      icon: '💡',
      tagline: 'Clear grammar explanations with examples for your level',
      accent: 'lime',
    },
    {
      id: 'dictionary',
      href: '/dralo-ai/dictionary',
      label: 'Dictionary',
      icon: '📕',
      tagline: 'Definitions, pronunciation and Spanish translation',
      accent: 'violet',
    },
  ],
};

export const DRALO_AI_MODES = {
  'use-of-english': {
    id: 'use-of-english',
    title: 'Use of English',
    eyebrow: 'Dralo AI · Grammar & vocabulary',
    description:
      'Cambridge-style transformations, cloze tasks and multiple choice. Dralo generates each exercise and checks your answer with instant feedback.',
    accent: 'indigo',
    mascotVariant: 6,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'multiple-choice-cloze',
        label: 'Multiple-choice cloze',
        icon: '🎯',
        hint: 'Choose the correct word from four options (vocabulary and collocations).',
      },
      {
        id: 'open-cloze',
        label: 'Open cloze',
        icon: '🕳️',
        hint: 'One gap per sentence; write ONE word only (no options).',
      },
      {
        id: 'word-formation',
        label: 'Word formation',
        icon: '🧩',
        hint: 'Form the correct word from the stem in capitals.',
      },
      {
        id: 'key-word',
        label: 'Key word transformation',
        icon: '🔑',
        hint: 'Complete the second sentence with the keyword (2–5 words).',
      },
    ],
  },
  reading: {
    id: 'reading',
    title: 'Reading',
    eyebrow: 'Dralo AI · Comprehension',
    description:
      'Cambridge-style reading texts for your level. Answer the questions and get clear feedback in English — whether you are right or wrong.',
    accent: 'ocean',
    mascotVariant: 2,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'multiple-choice',
        label: 'Multiple-choice (reading)',
        icon: '📖',
        hint: 'Read the text and choose the best answer (A–D) for each question.',
      },
      {
        id: 'gapped-text',
        label: 'Gapped text',
        icon: '🧩',
        hint: 'Choose which sentence fits each gap to rebuild the text logically.',
      },
      {
        id: 'multiple-matching',
        label: 'Multiple matching',
        icon: '🔗',
        hint: 'Match statements to the correct section of the text.',
      },
    ],
  },
  writing: {
    id: 'writing',
    title: 'Writing',
    eyebrow: 'Dralo AI · Production',
    description:
      'Pick a task type, write your text, and receive exam-style feedback from Dralo with strengths, weaknesses and practical tips.',
    accent: 'amber',
    mascotVariant: 8,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'essay',
        label: 'Compulsory essay',
        icon: '📄',
        hint: 'Opinion essay with introduction, body paragraphs and conclusion.',
      },
      {
        id: 'part-2',
        label: 'Article / letter / review',
        icon: '✉️',
        hint: 'Choose the right register and include all points in the task.',
      },
    ],
  },
  listening: {
    id: 'listening',
    title: 'Listening',
    eyebrow: 'Dralo AI · Audio comprehension',
    description:
      'Listen to the recording (male and female voices in dialogues), answer the questions, and review explanations after each check.',
    accent: 'emerald',
    mascotVariant: 7,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'short-extracts',
        label: 'Short extracts',
        icon: '🎧',
        hint: 'Brief recordings with multiple-choice comprehension questions.',
      },
      {
        id: 'sentence-completion',
        label: 'Sentence completion',
        icon: '🗣️',
        hint: 'Monologue or talk — complete sentences while you listen.',
      },
      {
        id: 'conversation',
        label: 'Conversation',
        icon: '💬',
        hint: 'Dialogue between speakers; detail and attitude questions.',
      },
      {
        id: 'multiple-matching',
        label: 'Multiple matching',
        icon: '📋',
        hint: 'Match each speaker or topic to the correct statement.',
      },
    ],
  },
  speaking: {
    id: 'speaking',
    title: 'Speaking',
    eyebrow: 'Dralo AI · Oral production',
    description:
      'Practise with your AI coach by voice or text: free conversation, detailed correction, or a full exam simulation with report.',
    accent: 'rose',
    mascotVariant: 5,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'practice',
        label: 'Practice',
        icon: '💬',
        hint: 'Free conversation with your AI coach on Cambridge-style topics.',
      },
      {
        id: 'correction',
        label: 'Correction',
        icon: '📋',
        hint: 'Detailed feedback on grammar, vocabulary, discourse and fluency after each answer.',
      },
      {
        id: 'exam',
        label: 'Exam simulation',
        icon: '🏆',
        hint: 'Official-style speaking exam by parts, with timer and final band report.',
      },
    ],
  },
  'grammar-coach': {
    id: 'grammar-coach',
    title: 'Grammar coach',
    eyebrow: 'Dralo AI · Grammar coach',
    description:
      'Ask Dralo anything about English grammar — tenses, conditionals, passive voice, word order and more. Explanations in clear English, tailored to your CEFR level.',
    accent: 'lime',
    mascotVariant: 4,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'tenses',
        label: 'Tenses',
        icon: '⏱️',
        hint: 'Present, past and future forms — when to use each one.',
        starterQuestion:
          'Can you explain when to use present perfect vs past simple? Give examples at my level.',
      },
      {
        id: 'conditionals',
        label: 'Conditionals',
        icon: '🔀',
        hint: 'Zero, first, second, third and mixed conditionals.',
        starterQuestion:
          'Explain the main types of conditionals with one example each for my level.',
      },
      {
        id: 'passive-reported',
        label: 'Passive & reported',
        icon: '🔄',
        hint: 'Passive voice, reported speech and causative structures.',
        starterQuestion:
          'How do I form the passive voice in the main tenses? Give short examples.',
      },
      {
        id: 'modals',
        label: 'Modals',
        icon: '🎛️',
        hint: 'Can, could, must, should, might and exam-style nuance.',
        starterQuestion:
          'What is the difference between must and have to? When should I use each?',
      },
      {
        id: 'articles',
        label: 'Articles & determiners',
        icon: '📌',
        hint: 'A, an, the, quantifiers and common exam traps.',
        starterQuestion:
          'When do I use the definite article "the" and when no article? Explain simply.',
      },
      {
        id: 'word-order',
        label: 'Word order',
        icon: '🧱',
        hint: 'Questions, negatives, adverbs and sentence structure.',
        starterQuestion:
          'What is the standard word order in English questions and negative sentences?',
      },
    ],
  },
};

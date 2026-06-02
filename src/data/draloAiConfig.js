/** Configuración por apartado del menú Dralo AI */

export const DRALO_AI_CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

export const DRALO_AI_HUB = {
  title: 'Dralo AI',
  description:
    'Practise every exam skill with exercises generated on demand and instant AI feedback.',
  items: [
    {
      id: 'writing',
      href: '/dralo-ai/writing',
      label: 'Writing',
      icon: '📝',
      tagline: 'Exam Coach correction and real-world writing practice',
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
      label: 'Speaking Coach',
      icon: '🎙️',
      tagline: 'Missions, roleplays and exam speaking with voice or text',
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
      id: 'pronunciation-coach',
      href: '/dralo-ai/pronunciation-coach',
      label: 'Pronunciation coach',
      icon: '🔊',
      tagline: 'Sounds, stress, rhythm and intonation for your level',
      accent: 'ocean',
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
      'Practise with your AI voice coach in real-life role plays: airport, hotel, interviews, or your own scenario.',
    accent: 'rose',
    mascotVariant: 5,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'part-1',
        label: 'Part 1: Interview',
        icon: '🗣️',
        hint: 'Questions about yourself, your life and your opinions.',
      },
      {
        id: 'part-2',
        label: 'Part 2: Long turn',
        icon: '🖼️',
        hint: 'Compare photographs and answer a follow-up question.',
      },
      {
        id: 'part-3',
        label: 'Part 3: Collaborative task',
        icon: '🤝',
        hint: 'Discuss a situation with the examiner and reach a decision.',
      },
      {
        id: 'part-4',
        label: 'Part 4: Discussion',
        icon: '💬',
        hint: 'Develop the topic from Part 3 with further questions.',
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
  'pronunciation-coach': {
    id: 'pronunciation-coach',
    title: 'Pronunciation coach',
    eyebrow: 'Dralo AI · Pronunciation',
    description:
      'Ask Dralo about English sounds, word stress, sentence rhythm and intonation. Paste a word or sentence and get clear guidance for your CEFR level.',
    accent: 'ocean',
    mascotVariant: 6,
    levels: DRALO_AI_CEFR_LEVELS,
    defaultLevel: 'B2',
    activities: [
      {
        id: 'vowels',
        label: 'Vowels',
        icon: '🅰️',
        hint: 'Short and long vowels, diphthongs and common L1 traps.',
        starterQuestion:
          'What are the main English vowel sounds I should master at my level? Give examples.',
      },
      {
        id: 'consonants',
        label: 'Consonants',
        icon: '🔤',
        hint: 'Th, r, l, w, final consonants and voicing.',
        starterQuestion:
          'How do I pronounce the "th" sounds in English? Explain with practice tips.',
      },
      {
        id: 'word-stress',
        label: 'Word stress',
        icon: 'ˈ◌',
        hint: 'Which syllable is stressed in multi-syllable words.',
        starterQuestion:
          'Where is the stress in the word "photograph" and related words (photography, photographer)?',
      },
      {
        id: 'sentence-stress',
        label: 'Sentence stress',
        icon: '📢',
        hint: 'Content words vs function words in natural speech.',
        starterQuestion:
          'Which words are usually stressed in an English sentence? Give a short example.',
      },
      {
        id: 'connected-speech',
        label: 'Connected speech',
        icon: '🔗',
        hint: 'Linking, elision, weak forms and rhythm.',
        starterQuestion:
          'What is linking in connected speech? Give two everyday examples.',
      },
      {
        id: 'intonation',
        label: 'Intonation',
        icon: '🎵',
        hint: 'Rising and falling tones for questions and attitude.',
        starterQuestion:
          'When does intonation rise or fall in English questions? Explain simply.',
      },
    ],
  },
};

export const LEVELS = [
  {
    code: 'A2',
    name: 'Waystage',
    description: 'Elementary — Simple, direct communication',
    color: '#58cc02',
    skills: 'Routine tasks, exchanging information, describing your environment',
  },
  {
    code: 'B1',
    name: 'Threshold',
    description: 'Intermediate — Familiar topics and everyday situations',
    color: '#ff9900',
    skills: 'Travel, experiences, plans, justified opinions',
  },
  {
    code: 'B2',
    name: 'Vantage',
    description: 'Upper intermediate — Complex texts and fluency',
    color: '#1cb0f6',
    skills: 'Fluent interaction, detailed texts, argumentation',
  },
  {
    code: 'C1',
    name: 'Effective Operational Proficiency',
    description: 'Advanced — Long texts and implied meaning',
    color: '#8e44ad',
    skills: 'Fluent expression, flexible language use, complex texts',
  },
  {
    code: 'C2',
    name: 'Mastery',
    description: 'Proficient — Full comprehension and precise expression',
    color: '#e74c3c',
    skills: 'Full comprehension, spontaneous expression, subtle meaning',
  },
];

export const SECTIONS = {
  Grammar: [
    { text: 'Articles, Determiners and Quantifiers', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/1-Articles-Determiners-and-Quantifiers' },
    { text: 'Verb "to be"', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/2-Verb-to-be' },
    { text: 'Pronouns', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/3-Pronouns' },
    { text: 'Question Formation', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Question-Formation' },
    { text: 'Adverbs and Adjectives', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/4-Adverbs-and-Adjectives' },
    { text: 'Prepositions', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/5-Prepositions' },
    { text: 'Present Tenses', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/7-Present-Tenses' },
    { text: 'Past Tenses', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/8-PastTenses' },
    { text: 'Future Tenses', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/9-Future-Tenses' },
    { text: 'Comparatives and Superlatives', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/comparatives-superlatives' },
    { text: 'Modal Verbs', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Modal-Verbs' },
    { text: 'Infinitive vs Gerund', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/10-Infinitive-vs-Gerund' },
    { text: 'Relative Clauses', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Relative-Clauses' },
    { text: 'Passive Voice', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Passive-Voice' },
    { text: 'Reported Speech', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Reported-Speech' },
    { text: 'Conditionals', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Conditionals' },
    { text: 'Sentence Structures', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/11-Sentence-Structures' },
    { text: 'Linking Words', levels: ['B2', 'C1', 'C2'], href: '/teoria/Linking-Words' },
    { text: 'Word Formation', levels: ['B2', 'C1', 'C2'], href: '/teoria/6-Word-Formation' },
    { text: 'Advanced Conditionals', levels: ['B2', 'C1', 'C2'], href: '/teoria/Advanced-Conditionals' },
    { text: 'Subjunctive and Unreal Past', levels: ['B2', 'C1', 'C2'], href: '/teoria/Subjunctive-and-Unreal-Past' },
    { text: 'Collocations and Phrasal Verbs', levels: ['B2', 'C1', 'C2'], href: '/teoria/collocations-phrasal-verbs' },
    { text: 'False Friends', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/false-friends' },
  ],
  Vocabulary: [
    { text: 'Synonyms and Antonyms', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Synonyms-and-Antonyms' },
    { text: 'Word Families and Prefixes', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Word-Families-and-Prefixes' },
    { text: 'Phrasal Verbs Essentials', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Phrasal-Verbs-Essentials' },
    { text: 'Vocabulary in Context', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Vocabulary-in-Context' },
    { text: 'Academic Vocabulary', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Academic-Vocabulary' },
    { text: 'Topic Lexis: Education and Work', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Topic-Lexis-Education-Work' },
    { text: 'Topic Lexis: Health and Lifestyle', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Topic-Lexis-Health-Lifestyle' },
    { text: 'Topic Lexis: Technology and Media', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Topic-Lexis-Technology-Media' },
    { text: 'Topic Lexis: Environment and Society', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Topic-Lexis-Environment-Society' },
    { text: 'Idioms and Expressions', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Idioms-and-Expressions' },
    { text: 'Vocabulary by Register', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Vocabulary-by-Register' },
    { text: 'Confusing Word Pairs', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Confusing-Word-Pairs' },
    { text: 'Emotions and Personality', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Emotions-and-Personality' },
  ],
  Pronunciation: [
    { text: 'Pronunciation', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Pronunciation' },
    { text: 'Pronunciation and Connected Speech', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Connected-Speech' },
    { text: 'Stress, Rhythm and Intonation', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Stress-Rhythm-and-Intonation' },
    { text: 'English Varieties and Accents', levels: ['B2', 'C1', 'C2'], href: '/teoria/English-Varieties' },
    { text: 'Minimal Pairs and Problem Sounds', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Minimal-Pairs-and-Problem-Sounds' },
  ],
  'Use of English': [
    { text: 'Multiple Choice Cloze', levels: ['B2', 'C1', 'C2'], href: '/teoria/Multiple-Choice-Cloze' },
    { text: 'Open Cloze', levels: ['B2', 'C1', 'C2'], href: '/teoria/Open-Cloze' },
    { text: 'Word Formation', levels: ['B2', 'C1', 'C2'], href: '/teoria/Advanced-Word-Formation' },
    { text: 'Key Word Transformations', levels: ['B2', 'C1', 'C2'], href: '/teoria/Key-Word-Transformations' },
    { text: 'Multiple Choice Questions', levels: ['B2', 'C1', 'C2'], href: '/teoria/Multiple-Choice-Questions' },
    { text: 'Gapped Text', levels: ['B2', 'C1', 'C2'], href: '/teoria/Gapped-Text' },
    { text: 'Multiple Matching', levels: ['B2', 'C1', 'C2'], href: '/teoria/Multiple-Matching' },
    { text: 'Cross-text Multiple Matching', levels: ['C2'], href: '/teoria/Cross-Text-Multiple-Matching' },
  ],
  Reading: [
    { text: 'Reading for Gist', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Reading-for-Gist' },
    { text: 'Skimming and Scanning Techniques', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Skimming-Scanning-Techniques' },
    { text: 'Reading for Detail', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Reading-for-Detail' },
    { text: 'Vocabulary in Context', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Vocabulary-in-Context' },
    { text: 'Inference and Implication', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Inference-and-Implication' },
    { text: 'Opinion and Attitude', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Opinion-and-Attitude' },
    { text: 'Text Organization and Structure', levels: ['B2', 'C1', 'C2'], href: '/teoria/Text-Organization-Structure' },
    { text: 'Cohesion and Coherence', levels: ['B2', 'C1', 'C2'], href: '/teoria/Cohesion-and-Coherence' },
  ],
  Listening: [
    { text: 'Types of Understanding: Main Idea, Details, Contrast, Tone', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Listening-Types' },
    { text: 'Short Dialogues', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Short-Dialogues' },
    { text: 'Contextual Vocabulary', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Contextual-Vocabulary' },
    { text: 'Pronunciation and Connected Speech', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Connected-Speech' },
    { text: 'Monologues', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Monologues' },
    { text: 'Long Conversations', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Long-Conversations' },
    { text: 'Note-Taking Techniques', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Note-Taking-Techniques' },
    { text: 'Active Listening Strategies', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Active-Listening-Strategies' },
    { text: 'Multi-speaker Dialogues', levels: ['B2', 'C1', 'C2'], href: '/teoria/Multi-speaker-Dialogues' },
    { text: 'English Varieties', levels: ['B2', 'C1', 'C2'], href: '/teoria/English-Varieties' },
  ],
  Writing: [
    { text: 'Text Types and Structure', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Text-Types-and-Structure' },
    { text: 'Key Resources to Improve', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Key-Resources-to-Improve' },
    { text: 'Cohesion and Connectors', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Cohesion-and-Connectors' },
    { text: 'Useful Grammar and Structures', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Useful-Grammar-and-Structures' },
    { text: 'Vocabulary by Register', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Vocabulary-by-Register' },
    { text: 'Essay Writing Techniques', levels: ['B2', 'C1', 'C2'], href: '/teoria/Essay-Writing-Techniques' },
    { text: 'Planning, Reviewing, and Self-Editing', levels: ['B2', 'C1', 'C2'], href: '/teoria/Planning-Reviewing-and-Self-Editing' },
  ],
  Speaking: [
    { text: 'Connectors', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Speaking-Connectors' },
    { text: 'Set Phrases', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Set-Phrases' },
    { text: 'Functional and Thematic Vocabulary', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Functional-and-Thematic-Vocabulary' },
    { text: 'Active Grammar and Useful Structures', levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: '/teoria/Active-Grammar-and-Useful-Structures' },
    { text: 'Interaction and Conversational Strategies', levels: ['B1', 'B2', 'C1', 'C2'], href: '/teoria/Interaction-and-Conversational-Strategies' },
    { text: 'Advanced Speaking Strategies', levels: ['B2', 'C1', 'C2'], href: '/teoria/Advanced-Speaking-Strategies' },
  ],
};

SECTIONS['Reading and Use of English'] = (() => {
  const seen = new Set();
  return [...SECTIONS['Use of English'], ...SECTIONS['Reading']].filter((topic) => {
    if (seen.has(topic.href)) return false;
    seen.add(topic.href);
    return true;
  });
})();

const EXAM_SECTION_META = [
  {
    key: 'Reading and Use of English',
    slug: 'reading-and-use-of-english',
    description:
      'Description and interactive tips for every part — grammar, vocabulary in context, and reading comprehension.',
    accent: '#2563eb',
    heroAccent: 'indigo',
  },
  {
    key: 'Listening',
    slug: 'listening',
    description:
      'Description and interactive tips for short extracts, monologues, conversations, and multiple matching.',
    accent: '#d97706',
    heroAccent: 'amber',
  },
  {
    key: 'Writing',
    slug: 'writing',
    description:
      'Description and interactive tips for compulsory essays and choice tasks — register, structure, and exam criteria.',
    accent: '#dc2626',
    heroAccent: 'rose',
  },
  {
    key: 'Speaking',
    slug: 'speaking',
    description:
      'Description and interactive tips for the interview, long turn, collaborative task, and discussion.',
    accent: '#db2777',
    heroAccent: 'ocean',
  },
];

const THEORY_SECTION_META = [
  {
    key: 'Grammar',
    slug: 'grammar',
    description: 'Grammar structures, verb tenses, and sentence formation.',
    accent: '#2563eb',
    heroAccent: 'violet',
  },
  {
    key: 'Vocabulary',
    slug: 'vocabulary',
    description: 'Word building, topic lexis, idioms, and exam-ready vocabulary.',
    accent: '#0d9488',
    heroAccent: 'emerald',
  },
  {
    key: 'Pronunciation',
    slug: 'pronunciation',
    description: 'Sounds, stress, connected speech, rhythm, and intelligibility.',
    accent: '#ea580c',
    heroAccent: 'amber',
  },
];

/** Apartados en /teoria (solo Grammar y Vocabulary). */
export const THEORY_SECTION_CATALOG = THEORY_SECTION_META;

/** Apartados en /niveles → Exam theory (4 skills de examen). */
export const EXAM_THEORY_CATALOG = EXAM_SECTION_META;

/** Slugs antiguos que apuntan al bloque combinado Reading and Use of English. */
export const EXAM_SECTION_SLUG_ALIASES = {
  'use-of-english': 'reading-and-use-of-english',
  reading: 'reading-and-use-of-english',
};

export const EXAM_SECTION_LEGACY_SLUGS = Object.keys(EXAM_SECTION_SLUG_ALIASES);

/** Todos los apartados (teoría de examen + hub de temas). */
export const SECTION_CATALOG = [...THEORY_SECTION_META, ...EXAM_SECTION_META];

const slugToKey = Object.fromEntries(SECTION_CATALOG.map((s) => [s.slug, s.key]));

export function resolveExamTheorySectionSlug(slug) {
  return EXAM_SECTION_SLUG_ALIASES[slug] || slug;
}

export function getSectionBySlug(slug) {
  const resolvedSlug = resolveExamTheorySectionSlug(slug);
  const key = slugToKey[resolvedSlug];
  if (!key) return null;
  const meta = SECTION_CATALOG.find((s) => s.slug === resolvedSlug);
  return { ...meta, slug: resolvedSlug, topics: SECTIONS[key] || [] };
}

export function filterTopics(topics, { selectedLevels = [], query = '' }) {
  const q = query.trim().toLowerCase();
  let items = topics;
  if (selectedLevels.length) {
    items = items.filter((t) => t.levels.some((l) => selectedLevels.includes(l)));
  }
  if (q) items = items.filter((t) => t.text.toLowerCase().includes(q));
  return items;
}

/** Temas del hub Theory (Grammar + Vocabulary). */
export function buildTheoryTopicsFlat() {
  return THEORY_SECTION_CATALOG.flatMap((area) =>
    (SECTIONS[area.key] || []).map((topic) => ({
      ...topic,
      sectionKey: area.key,
      sectionSlug: area.slug,
    })),
  );
}

/** Todos los temas (incluye exam skills). */
export function buildAllTopicsFlat() {
  return SECTION_CATALOG.flatMap((area) =>
    (SECTIONS[area.key] || []).map((topic) => ({
      ...topic,
      sectionKey: area.key,
      sectionSlug: area.slug,
    })),
  );
}

/** Filtro global: nivel CEFR, área y texto (título o nombre de área). */
export function filterTopicsGlobal(
  topics,
  { selectedLevels = [], selectedSections = [], query = '' } = {},
) {
  const q = query.trim().toLowerCase();
  let items = topics;
  if (selectedSections.length) {
    items = items.filter((t) => selectedSections.includes(t.sectionKey));
  }
  if (selectedLevels.length) {
    items = items.filter((t) => t.levels.some((l) => selectedLevels.includes(l)));
  }
  if (q) {
    items = items.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        String(t.sectionKey || '')
          .toLowerCase()
          .includes(q),
    );
  }
  return items;
}

import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { A2_BASICO_TOPICS } from '@/data/a2TrainingContent';
import { B2_UOE_CURRICULUM } from '@/data/b2TrainingContent';

const TRAINING_LEVELS_PER_SECTION = 6;

const CEFR_ORDER = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

/** A2 basic: real progression (colors → nouns → days…), no superlatives. */
const A2_BASICO_TOPIC_LADDER = [...A2_BASICO_TOPICS];
const DIFF_ORDER = ['basico', 'intermedio', 'avanzado'];

const CEFR_LABELS = {
  a1: 'A1',
  a2: 'A2',
  b1: 'B1',
  b2: 'B2',
  c1: 'C1',
  c2: 'C2',
};

const DIFF_LABELS = {
  basico: 'Basic',
  intermedio: 'Intermediate',
  avanzado: 'Advanced',
};

/** Section palette (visual progression easy → hard). */
const SECTION_PALETTE = [
  { id: 'block-1', color: '#0d9488', colorMid: '#14b8a6', colorLight: '#ccfbf1' },
  { id: 'block-2', color: '#0284c7', colorMid: '#0ea5e9', colorLight: '#e0f2fe' },
  { id: 'block-3', color: '#4f46e5', colorMid: '#6366f1', colorLight: '#e0e7ff' },
  { id: 'block-4', color: '#7c3aed', colorMid: '#8b5cf6', colorLight: '#ede9fe' },
];

/** Section titles by global difficulty tier (0–17). */
const SECTION_TITLES_BY_TIER = [
  ['First steps', 'Useful phrases', 'Core grammar', 'Consolidation'],
  ['Living vocabulary', 'Ask and answer', 'Time and aspect', 'Guided practice'],
  ['Clear messages', 'Verbs in action', 'Linking ideas', 'Precision'],
  ['Connected ideas', 'Grammar nuance', 'Formal register', 'Autonomy'],
  ['Text analysis', 'Arguments', 'Subordination', 'Style'],
  ['Critical view', 'Advanced cohesion', 'Academic register', 'Mastery'],
];

/** Use of English — 96+ topics ordered A1 easy → C2 advanced. */
const UOE_TOPIC_LADDER = [
  'Articles a / an', 'Plural -s', 'This & that', 'Possessives', 'There is / there are', 'Colors',
  'Numbers and quantity', 'Prepositions of place', 'Present simple', 'Adverbs of frequency', 'Can / can\'t', 'Like + -ing',
  'Past simple regular', 'Irregular verbs', 'Questions WH-', 'Much / many', 'Comparativos', 'Superlativos',
  'Present continuous', 'Past continuous', 'Future: going to', 'Will vs going to', 'Have to / must', 'Should / advice',
  'Present perfect intro', 'Ever / never', 'For / since', 'Already / yet', 'Passive present', 'Passive past',
  'Relative clauses', 'Defining vs non-def', 'Conditionals 0-1', 'Second conditional', 'Third conditional', 'Mixed conditionals',
  'Reported speech', 'Say / tell', 'Gerund vs infinitive', 'Verb patterns', 'Phrasal verbs I', 'Phrasal verbs II',
  'Inversion', 'Cleft sentences', 'Subjunctive forms', 'Formal connectors', 'Nominalisation', 'Academic hedging',
  'Discourse markers', 'Contrast & concession', 'Cause & effect', 'Purpose & result', 'Emphasis structures', 'Ellipsis',
  'Media register', 'Editorial tone', 'Irony & stance', 'Corpus collocations', 'Style shifting', 'Precision lexis',
  'Legal register', 'Policy discourse', 'Ethical debate', 'Philosophical framing', 'Rhetorical devices', 'Critical synthesis',
  'Epistemic modality', 'Counter-argument', 'Nuanced concession', 'Academic critique', 'Metadiscourse', 'Register control',
  'Literary analysis', 'Ideological framing', 'Diplomatic language', 'Treaty discourse', 'Manifesto rhetoric', 'Seminar debate',
  'Hermeneutic reading', 'Phenomenological lexis', 'Constitutional argument', 'Geopolitical briefing', 'Existential register', 'Symposium paper',
];

const VOCAB_TOPIC_LADDER = [
  'Greetings', 'Family', 'Food', 'Clothes', 'Home', 'Animals',
  'Jobs', 'Transport', 'Weather', 'Body', 'Free time', 'Shopping',
  'Travel', 'Health', 'Technology', 'Environment', 'Emotions', 'Opinions',
  'Work', 'Education', 'Culture', 'News', 'Economy', 'Politics',
  'Science', 'Art', 'Global sport', 'Urban planning', 'Bioethics', 'Innovation',
  'Diplomacy', 'Philosophy', 'Literature', 'Sociology', 'Psychology', 'Law',
  'Macroeconomics', 'Epistemology', 'Rhetoric', 'Semantics', 'Ideology', 'Geopolitics',
  'Ontology', 'Hermeneutics', 'Pragmatics', 'Aesthetics', 'Critical theory', 'Academic discourse',
  'Neologisms', 'Technical register', 'C2 collocations', 'Forensic lexis', 'Medical lexis', 'Legal lexis',
  'Advanced corpus', 'Conceptual metaphor', 'Euphemism', 'Archaisms', 'Literary register', 'Lexical synthesis',
  'Dialect variation', 'Intertextuality', 'Digital neologisms', 'Philosophical lexis', 'Political lexis', 'Scientific lexis',
  'Semantic precision', 'C2 lexical field', 'Advanced polysemy', 'Denotation / connotation', 'Diplomatic register', 'Expert glossary',
];

const GENERIC_TOPIC_LADDER = [
  'Introduction', 'Guided practice', 'Review', 'Application', 'Reinforcement', 'Assessment',
  'Comprehension', 'Production', 'Interaction', 'Correction', 'Fluency', 'Precision',
  'Analysis', 'Synthesis', 'Argument', 'Contrast', 'Inference', 'Reformulation',
  'Planning', 'Execution', 'Revision', 'Self-assessment', 'Short challenge', 'Long challenge',
  'Real context', 'Professional role', 'Case study', 'Debate', 'Negotiation', 'Presentation',
  'Report', 'Review', 'Proposal', 'Technical report', 'Panel', 'Round table',
  'Simulation', 'Feedback', 'Improvement', 'Partial mastery', 'Solid mastery', 'Full mastery',
  'Strategy', 'Tactics', 'Nuance', 'High register', 'Expert register', 'Certification',
  'Benchmark', 'B2 standard', 'C1 standard', 'C2 standard', 'Excellence', 'Mastery',
  'Research', 'Publication', 'Conference', 'Peer review', 'Linguistic leadership', 'Mentoring',
  'Innovation', 'Transformation', 'Global vision', 'Impact', 'Legacy', 'Summit',
];

const SKILL_LADDERS = {
  'use-of-english': UOE_TOPIC_LADDER,
  vocabulary: VOCAB_TOPIC_LADDER,
};

function normalizeKey(value) {
  return (value || 'a2').toLowerCase().trim();
}

/** Index 0 (A1 basic) … 17 (C2 advanced). */
export function getTrainingTier(cefrLevel, difficulty) {
  const cefr = normalizeKey(cefrLevel);
  const diff = normalizeKey(difficulty);
  const cefrIndex = Math.max(0, CEFR_ORDER.indexOf(cefr));
  const diffIndex = Math.max(0, DIFF_ORDER.indexOf(diff));
  return Math.min(cefrIndex * 3 + diffIndex, 17);
}

function pickTopics(ladder, tier, count = TRAINING_LEVEL_COUNT) {
  const maxStart = Math.max(0, ladder.length - count);
  const start = Math.min(Math.floor((tier / 17) * maxStart), maxStart);
  return Array.from({ length: count }, (_, i) => ladder[Math.min(start + i, ladder.length - 1)]);
}

function sectionTitlesForTier(tier) {
  const idx = Math.min(Math.floor(tier / 3), SECTION_TITLES_BY_TIER.length - 1);
  return SECTION_TITLES_BY_TIER[idx];
}

const curriculumCache = new Map();

function buildCurriculumFromSectionDefs(sectionDefs, meta) {
  let levelNum = 1;
  const sections = sectionDefs.map((def, sectionIndex) => {
    const palette = SECTION_PALETTE[sectionIndex % SECTION_PALETTE.length];
    const from = levelNum;
    const levels = def.topics.map((topic) => ({
      n: levelNum++,
      topic,
    }));
    const to = levelNum - 1;
    const topicsSummary = levels
      .map((l) => l.topic)
      .slice(0, 3)
      .join(' · ');

    return {
      ...palette,
      title: def.title,
      topics: topicsSummary,
      from,
      to,
      levels,
    };
  });

  const totalLevels = levelNum - 1;
  const levelMap = Object.fromEntries(
    sections.flatMap((s) => s.levels.map((l) => [l.n, { ...l, section: s }])),
  );

  return {
    totalLevels,
    tier: meta.tier,
    cefrLabel: meta.cefrLabel,
    diffLabel: meta.diffLabel,
    sections,
    levelMap,
    progressionLabel: meta.progressionLabel,
  };
}

/**
 * Full path curriculum: sections with one box per topic (count varies by path).
 */
export function getTrainingPathCurriculum(cefrLevel, difficulty, skill = 'use-of-english') {
  const cefr = normalizeKey(cefrLevel);
  const diff = normalizeKey(difficulty);
  const skillKey = normalizeKey(skill);
  const cacheKey = `${cefr}|${diff}|${skillKey}`;
  if (curriculumCache.has(cacheKey)) {
    return curriculumCache.get(cacheKey);
  }

  const tier = getTrainingTier(cefr, diff);

  if (cefr === 'b2' && skillKey === 'use-of-english' && B2_UOE_CURRICULUM[diff]) {
    const result = buildCurriculumFromSectionDefs(B2_UOE_CURRICULUM[diff], {
      tier,
      cefrLabel: CEFR_LABELS.b2,
      diffLabel: DIFF_LABELS[diff] || diff,
      progressionLabel: `B2 · ${DIFF_LABELS[diff] || diff}`,
    });
    curriculumCache.set(cacheKey, result);
    return result;
  }

  if (cefr === 'a2' && diff === 'basico') {
    const topics = A2_BASICO_TOPIC_LADDER.slice(0, TRAINING_LEVEL_COUNT);
    const sectionTitles = [
      'Colors, numbers and time',
      'Nouns and pronouns',
      'Essential grammar',
      'Daily life and review',
    ];
    const sections = SECTION_PALETTE.map((palette, sectionIndex) => {
      const from = sectionIndex * TRAINING_LEVELS_PER_SECTION + 1;
      const to = from + TRAINING_LEVELS_PER_SECTION - 1;
      const levels = topics.slice(from - 1, to).map((topic, i) => ({
        n: from + i,
        topic,
      }));
      const topicsSummary = levels
        .map((l) => l.topic)
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .slice(0, 3)
        .join(' · ');

      return {
        ...palette,
        title: sectionTitles[sectionIndex] ?? `Block ${sectionIndex + 1}`,
        topics: topicsSummary,
        from,
        to,
        levels,
      };
    });

    const levelMap = Object.fromEntries(
      sections.flatMap((s) => s.levels.map((l) => [l.n, { ...l, section: s }])),
    );

    const result = {
      totalLevels: TRAINING_LEVEL_COUNT,
      tier: 0,
      cefrLabel: CEFR_LABELS[cefr] || 'A2',
      diffLabel: DIFF_LABELS[diff] || 'Basic',
      sections,
      levelMap,
      progressionLabel: 'A2 · Basic — elementary vocabulary',
    };
    curriculumCache.set(cacheKey, result);
    return result;
  }

  const ladder = SKILL_LADDERS[skill] || GENERIC_TOPIC_LADDER;
  const topics = pickTopics(ladder, tier);
  const sectionTitles = sectionTitlesForTier(tier);

  const sections = SECTION_PALETTE.map((palette, sectionIndex) => {
    const from = sectionIndex * TRAINING_LEVELS_PER_SECTION + 1;
    const to = from + TRAINING_LEVELS_PER_SECTION - 1;
    const levels = topics.slice(from - 1, to).map((topic, i) => ({
      n: from + i,
      topic,
    }));
    const topicsSummary = levels
      .map((l) => l.topic)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 3)
      .join(' · ');

    return {
      ...palette,
      title: sectionTitles[sectionIndex],
      topics: topicsSummary,
      from,
      to,
      levels,
    };
  });

  const levelMap = Object.fromEntries(
    sections.flatMap((s) => s.levels.map((l) => [l.n, { ...l, section: s }]))
  );

  const result = {
    totalLevels: TRAINING_LEVEL_COUNT,
    tier,
    cefrLabel: CEFR_LABELS[cefr] || cefr.toUpperCase(),
    diffLabel: DIFF_LABELS[diff] || diff,
    sections,
    levelMap,
    progressionLabel: `${CEFR_LABELS[cefr] || cefr.toUpperCase()} · ${DIFF_LABELS[diff] || diff}`,
  };
  curriculumCache.set(cacheKey, result);
  return result;
}

/** Número de cajas/niveles en el mapa para un camino concreto. */
export function getTrainingPathLevelCount(cefrLevel, difficulty, skill = 'use-of-english') {
  return getTrainingPathCurriculum(cefrLevel, difficulty, skill).totalLevels ?? TRAINING_LEVEL_COUNT;
}

export function getSectionForLevel(levelNumber, curriculum) {
  const sections = curriculum?.sections ?? [];
  return (
    sections.find((s) => levelNumber >= s.from && levelNumber <= s.to) ??
    sections[sections.length - 1]
  );
}

export function getLevelTopic(levelNumber, curriculum) {
  return curriculum?.levelMap?.[levelNumber]?.topic ?? `Level ${levelNumber}`;
}

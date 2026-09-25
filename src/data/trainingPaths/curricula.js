/**
 * Paths whose levels live in `src/data/trainingPaths/<slug>/levelNN.js`, one file per level.
 * Each level asks the 47 task types (TRAINING_PATH_TYPE_FORMATS) about its topic, and the map
 * adds a review after every section except the last, as in B2 basic.
 *
 * This file must not import level content: the Training map reads it.
 */

export const TRAINING_PATH_DIFFICULTY_SLUGS = Object.freeze({
  basico: 'basic',
  intermedio: 'intermediate',
  avanzado: 'hard',
});

export const TRAINING_PATH_SECTIONS = Object.freeze({
  /** Very first steps: colours, nouns and days before any grammar, and nothing beyond A2 basic. */
  'a2|basico': [
    {
      title: 'Colours, numbers and time',
      topics: ['Colours', 'Numbers', 'Days of the week', 'Months of the year'],
    },
    {
      title: 'People and things',
      topics: ['Nouns: the classroom', 'Nouns: family', 'Personal pronouns', 'Verb to be'],
    },
    {
      title: 'Building sentences',
      topics: [
        'Articles a / an / the',
        'Plurals',
        'Possessive adjectives',
        'There is / there are',
        'Prepositions of place',
      ],
    },
    {
      title: 'Everyday actions',
      topics: ['Present simple', 'Adverbs of frequency', 'Can / cannot', 'Like + -ing'],
    },
    {
      title: 'Daily life',
      topics: ['Food and drink', 'Clothes', 'Jobs', 'Places in town'],
    },
    {
      title: 'Past and questions',
      topics: ['Past: was / were', 'WH- questions', 'Have got'],
    },
  ],
  'a2|intermedio': [
    {
      title: 'Talking about now',
      topics: ['Present continuous', 'Temporary situations', 'Present simple vs continuous', 'Stative verbs'],
    },
    {
      title: 'The past',
      topics: ['Past simple regular', 'Past simple irregular', 'Past continuous', 'Used to'],
    },
    {
      title: 'The future',
      topics: ['Going to', 'Will', 'Will vs going to', 'Present continuous arrangements'],
    },
    {
      title: 'Comparing and counting',
      topics: ['Comparatives', 'Superlatives', 'Countable and uncountable', 'Too and enough'],
    },
    {
      title: 'Useful grammar',
      topics: ['Must and have to', 'Should', 'First conditional', 'Present perfect intro'],
    },
  ],
  'a2|avanzado': [
    {
      title: 'Tense control',
      topics: [
        'Present simple vs continuous review',
        'Past simple vs continuous',
        'Present perfect vs past',
        'Will vs going to review',
      ],
    },
    {
      title: 'Building longer sentences',
      topics: ['Relative who / which', 'Verb + to or -ing', 'Question tags', 'Indirect questions'],
    },
    {
      title: 'Voice and report',
      topics: ['Present passive', 'Past passive', 'Reported speech intro', 'Second conditional intro'],
    },
    {
      title: 'Precision',
      topics: ['Articles in context', 'Someone anyone no one', 'So because although', 'Basic phrasal verbs'],
    },
  ],
  'b1|basico': [
    {
      title: 'Perfect tenses',
      topics: ['Present perfect vs past', 'For since already yet', 'Present perfect continuous', 'Past perfect'],
    },
    {
      title: 'Future and condition',
      topics: ['Future forms review', 'First conditional', 'Second conditional', 'Unless and as long as'],
    },
    {
      title: 'Modals',
      topics: ['Advice modals', 'Obligation modals', 'Possibility modals', 'Ability and permission'],
    },
    {
      title: 'Voice and report',
      topics: ['Passive present and past', 'Passive with by', 'Reported statements', 'Reported questions'],
    },
    {
      title: 'Building text',
      topics: ['Relative clauses', 'Gerund vs infinitive', 'Linkers', 'Used to and would'],
    },
  ],
  'b1|intermedio': [
    {
      title: 'Narrative control',
      topics: ['Past perfect continuous', 'Narrative tenses', 'Future continuous', 'Future perfect'],
    },
    {
      title: 'Hypothetical language',
      topics: ['Second vs third conditional', 'Wish present', 'Wish past', 'If only'],
    },
    {
      title: 'Modals in use',
      topics: ['Deduction must and can’t', 'Past modals', 'Probability may and might', 'Modal transformations'],
    },
    {
      title: 'Complex sentences',
      topics: ['Non-defining relatives', 'Participle clauses intro', 'Reporting verbs', 'Passive with modals'],
    },
    {
      title: 'Style',
      topics: ['Formal rewriting', 'Phrasal verbs B1', 'Collocations B1', 'Register B1'],
    },
  ],
  'b1|avanzado': [
    {
      title: 'Mixed tenses',
      topics: ['Mixed present perfect', 'Mixed narrative', 'Future in the past', 'Tense sequences'],
    },
    {
      title: 'Advanced grammar',
      topics: ['Mixed conditionals intro', 'Advanced passives B1', 'Complex relatives', 'Verb patterns B1'],
    },
    {
      title: 'Discourse',
      topics: ['Concession linkers', 'Cause and result', 'Emphasis do / did', 'Ellipsis'],
    },
    {
      title: 'Precision',
      topics: ['Academic linkers B1', 'Hedging intro', 'Phrasal verbs II', 'Error correction B1'],
    },
  ],
  'b2|intermedio': [
    {
      title: 'Verb Tenses',
      topics: ['Present perfect continuous', 'Past perfect exercises', 'Future continuous completion'],
    },
    {
      title: 'Mixed Tenses',
      topics: ['Mixed tense correction', 'Narrative tense selection', 'Tense race'],
    },
    {
      title: 'Conditionals',
      topics: ['Second conditional', 'Third conditional', 'Wish/if only', 'Hypothetical situations'],
    },
    {
      title: 'Modal Verbs',
      topics: [
        'Deduction modals',
        'Probability modals',
        'Modal transformations',
        'Past modals',
        'Modal dialogues',
      ],
    },
    {
      title: 'Passive & Reported Speech',
      topics: [
        'Reported questions',
        'Reporting verbs',
        'Passive with modals',
        'Passive error correction',
        'Mixed reporting exercises',
      ],
    },
    {
      title: 'Advanced Structures',
      topics: [
        'Relative clauses',
        'Defining/non-defining clauses',
        'Gerunds vs infinitives',
        'Formal grammar rewriting',
        'Grammar dictation',
        'Grammar maze',
      ],
    },
  ],
  'b2|avanzado': [
    { title: 'Verb Tenses', topics: ['Future perfect drills'] },
    {
      title: 'Mixed Tenses',
      topics: ['Advanced mixed tense correction', 'Advanced narrative tense selection'],
    },
    { title: 'Conditionals', topics: ['Mixed conditionals', 'Conditional chains', 'Regret statements'] },
    { title: 'Modal Verbs', topics: ['Modal error correction', 'Advanced modal gap fills'] },
    {
      title: 'Passive & Reported Speech',
      topics: ['Passive in news reports', 'Reporting dialogue completion'],
    },
    {
      title: 'Advanced Structures',
      topics: [
        'Inversion exercises',
        'Cleft sentences',
        'Advanced sentence combining',
        'Advanced formal grammar rewriting',
        'Advanced linkers/connectors',
      ],
    },
  ],
  'c1|basico': [
    {
      title: 'Advanced grammar',
      topics: ['Mixed conditionals', 'Inversion', 'Cleft sentences', 'Participle clauses'],
    },
    {
      title: 'Voice and stance',
      topics: ['Advanced passives', 'Reporting verbs nuance', 'Modal past deduction', 'Subjunctive'],
    },
    {
      title: 'Academic writing',
      topics: ['Hedging', 'Nominalisation', 'Discourse markers', 'Formal register'],
    },
    {
      title: 'Cohesion',
      topics: ['Contrast and concession', 'Cause and effect', 'Emphasis structures', 'Reduced relatives'],
    },
    {
      title: 'Lexis',
      topics: ['Academic collocations', 'Phrasal verbs academic', 'Style and tone', 'Future in the past'],
    },
  ],
  'c1|intermedio': [
    {
      title: 'Information structure',
      topics: ['Fronting', 'Negative inversion', 'Cleft variations', 'Complex noun phrases'],
    },
    {
      title: 'Argument',
      topics: ['Unreal past', 'Advanced hedging', 'Stance adverbs', 'Concession clusters'],
    },
    {
      title: 'Register',
      topics: ['Legal and academic register', 'Corpus collocations', 'Evaluative language', 'Passive impersonal'],
    },
    {
      title: 'Discourse',
      topics: ['Result and purpose', 'Ellipsis and substitution', 'Precision connectors', 'Critical synthesis'],
    },
  ],
  'c1|avanzado': [
    {
      title: 'Rhetoric',
      topics: ['Rhetorical inversion', 'Multiple clefts', 'Epistemic modality', 'Irony and stance'],
    },
    {
      title: 'Argumentation',
      topics: ['Counter-argument', 'Nuanced concession', 'Metadiscourse', 'Academic critique'],
    },
    {
      title: 'Professional language',
      topics: ['Diplomatic language', 'Register control', 'Style shifting C1', 'Seminar language'],
    },
    {
      title: 'Precision',
      topics: ['Ideological framing', 'Advanced nominalisation', 'Corpus precision', 'Ellipsis in speech'],
    },
  ],
  'c2|basico': [
    {
      title: 'Discourse',
      topics: ['Discourse markers C2', 'Contrast and concession C2', 'Cause effect purpose', 'Emphasis and ellipsis'],
    },
    {
      title: 'Register',
      topics: ['Media register', 'Editorial tone', 'Irony and stance C2', 'Style shifting C2'],
    },
    {
      title: 'Professional',
      topics: ['Legal register', 'Policy discourse', 'Ethical debate', 'Diplomatic language C2'],
    },
    {
      title: 'Analysis',
      topics: ['Rhetorical devices', 'Critical synthesis', 'Philosophical framing', 'Precision lexis'],
    },
  ],
  'c2|intermedio': [
    {
      title: 'Argument',
      topics: ['Epistemic modality C2', 'Counter-argument C2', 'Nuanced concession C2', 'Academic critique C2'],
    },
    {
      title: 'Texture',
      topics: ['Metadiscourse C2', 'Register control C2', 'Literary analysis', 'Ideological framing C2'],
    },
    {
      title: 'Public language',
      topics: ['Treaty discourse', 'Manifesto rhetoric', 'Seminar debate', 'Geopolitical briefing'],
    },
    {
      title: 'Interpretation',
      topics: ['Hermeneutic reading', 'Constitutional argument', 'Existential register', 'Intertextuality'],
    },
  ],
  'c2|avanzado': [
    {
      title: 'Theory',
      topics: ['Phenomenological lexis', 'Ontology', 'Hermeneutics', 'Pragmatics'],
    },
    {
      title: 'Culture',
      topics: ['Aesthetics', 'Critical theory', 'Conceptual metaphor', 'Academic discourse C2'],
    },
    {
      title: 'Mastery',
      topics: ['Semantic precision', 'Advanced polysemy', 'Diplomatic register C2', 'Expert glossary'],
    },
  ],
});

/** `a2-basic`, `b1-intermediate`, `c2-hard`… or null when the path has no level files. */
export function trainingPathSlug(cefrLevel, difficulty) {
  const cefr = String(cefrLevel || '').toLowerCase();
  const diff = String(difficulty || '').toLowerCase();
  if (!TRAINING_PATH_SECTIONS[`${cefr}|${diff}`]) return null;
  return `${cefr}-${TRAINING_PATH_DIFFICULTY_SLUGS[diff]}`;
}

export function trainingPathSections(cefrLevel, difficulty) {
  const cefr = String(cefrLevel || '').toLowerCase();
  const diff = String(difficulty || '').toLowerCase();
  return TRAINING_PATH_SECTIONS[`${cefr}|${diff}`] || null;
}

/** Topic and section title of level `levelNumber` (1-based), or null past the end. */
export function trainingPathLevelInfo(cefrLevel, difficulty, levelNumber) {
  const sections = trainingPathSections(cefrLevel, difficulty) || [];
  let n = 0;
  for (const section of sections) {
    for (const topic of section.topics) {
      n += 1;
      if (n === Number(levelNumber)) return { topic, section: section.title };
    }
  }
  return null;
}

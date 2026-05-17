import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';

const TRAINING_LEVELS_PER_SECTION = 6;

const CEFR_ORDER = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
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
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

/** Paleta de apartados (progresión visual de fácil → difícil). */
const SECTION_PALETTE = [
  { id: 'block-1', color: '#0d9488', colorMid: '#14b8a6', colorLight: '#ccfbf1' },
  { id: 'block-2', color: '#0284c7', colorMid: '#0ea5e9', colorLight: '#e0f2fe' },
  { id: 'block-3', color: '#4f46e5', colorMid: '#6366f1', colorLight: '#e0e7ff' },
  { id: 'block-4', color: '#7c3aed', colorMid: '#8b5cf6', colorLight: '#ede9fe' },
];

/** Títulos de apartado según tramo de dificultad global (0–17). */
const SECTION_TITLES_BY_TIER = [
  ['Primeros pasos', 'Frases útiles', 'Gramática base', 'Consolidación'],
  ['Vocabulario vivo', 'Preguntar y responder', 'Tiempo y aspecto', 'Práctica guiada'],
  ['Mensaje claro', 'Verbos en acción', 'Enlaces del discurso', 'Precisión'],
  ['Ideas conectadas', 'Matices gramaticales', 'Registro formal', 'Autonomía'],
  ['Análisis textual', 'Argumentos', 'Subordinación', 'Estilo'],
  ['Perspectiva crítica', 'Cohesión avanzada', 'Registro académico', 'Dominio'],
];

/** Use of English — 96+ temas ordenados de A1 fácil → C2 difícil. */
const UOE_TOPIC_LADDER = [
  'Artículos a / an', 'Plural -s', 'This & that', 'Possessivos', 'Hay / there is', 'Colores',
  'Números y cantidad', 'Preposiciones lugar', 'Present simple', 'Adverbios frecuencia', 'Can / can\'t', 'Like + -ing',
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
  'Saludos', 'Familia', 'Comida', 'Ropa', 'Casa', 'Animales',
  'Profesiones', 'Transporte', 'Clima', 'Cuerpo', 'Tiempo libre', 'Compras',
  'Viajes', 'Salud', 'Tecnología', 'Medio ambiente', 'Emociones', 'Opiniones',
  'Trabajo', 'Educación', 'Cultura', 'Noticias', 'Economía', 'Política',
  'Ciencia', 'Arte', 'Deporte global', 'Urbanismo', 'Bioética', 'Innovación',
  'Diplomacia', 'Filosofía', 'Literatura', 'Sociología', 'Psicología', 'Derecho',
  'Macroeconomía', 'Epistemología', 'Retórica', 'Semántica', 'Ideología', 'Geopolítica',
  'Ontología', 'Hermenéutica', 'Pragmática', 'Estética', 'Teoría crítica', 'Discurso académico',
  'Neologismos', 'Registro técnico', 'Colocaciones C2', 'Lexis forense', 'Lexis médico', 'Lexis jurídico',
  'Corpus avanzado', 'Metáfora conceptual', 'Eufemismo', 'Arcaísmos', 'Registro literario', 'Síntesis léxica',
  'Variación dialectal', 'Intertextualidad', 'Neologismos digitales', 'Lexis filosófico', 'Lexis político', 'Lexis científico',
  'Precision semántica', 'Campo léxico C2', 'Polisemia avanzada', 'Denotación / connotación', 'Registro diplomático', 'Glosario experto',
];

const GENERIC_TOPIC_LADDER = [
  'Introducción', 'Práctica guiada', 'Repaso', 'Aplicación', 'Refuerzo', 'Evaluación',
  'Comprensión', 'Producción', 'Interacción', 'Corrección', 'Fluidez', 'Precisión',
  'Análisis', 'Síntesis', 'Argumento', 'Contraste', 'Inferencia', 'Reformulación',
  'Planificación', 'Ejecución', 'Revisión', 'Autoevaluación', 'Reto corto', 'Reto largo',
  'Contexto real', 'Rol profesional', 'Caso práctico', 'Debate', 'Negociación', 'Presentación',
  'Informe', 'Reseña', 'Propuesta', 'Informe técnico', 'Panel', 'Mesa redonda',
  'Simulación', 'Feedback', 'Mejora', 'Dominio parcial', 'Dominio sólido', 'Dominio pleno',
  'Estrategia', 'Táctica', 'Matices', 'Registro alto', 'Registro experto', 'Certificación',
  'Benchmark', 'Estándar B2', 'Estándar C1', 'Estándar C2', 'Excelencia', 'Maestría',
  'Investigación', 'Publicación', 'Conferencia', 'Peer review', 'Liderazgo lingüístico', 'Mentoría',
  'Innovación', 'Transformación', 'Visión global', 'Impacto', 'Legado', 'Cumbre',
];

const SKILL_LADDERS = {
  'use-of-english': UOE_TOPIC_LADDER,
  vocabulary: VOCAB_TOPIC_LADDER,
};

function normalizeKey(value) {
  return (value || 'a2').toLowerCase().trim();
}

/** Índice 0 (A1 básico) … 17 (C2 avanzado). */
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

/**
 * Currículo completo del mapa: 4 apartados × 6 niveles, temas únicos por nivel.
 */
export function getTrainingPathCurriculum(cefrLevel, difficulty, skill = 'use-of-english') {
  const cefr = normalizeKey(cefrLevel);
  const diff = normalizeKey(difficulty);
  const tier = getTrainingTier(cefr, diff);
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

  return {
    tier,
    cefrLabel: CEFR_LABELS[cefr] || cefr.toUpperCase(),
    diffLabel: DIFF_LABELS[diff] || diff,
    sections,
    levelMap,
    progressionLabel: `${CEFR_LABELS[cefr] || cefr.toUpperCase()} · ${DIFF_LABELS[diff] || diff}`,
  };
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

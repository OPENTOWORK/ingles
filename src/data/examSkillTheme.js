/**
 * Colores y orden compartidos para skills de examen (Exam Strategies + Exam Practice).
 * RUOE: azul cielo claro (distinto del índigo corporativo de Dralo).
 */
export const EXAM_SKILL_READING_ACCENT = '#38bdf8';
export const EXAM_SKILL_READING_ACCENT_DARK = '#0ea5e9';
export const EXAM_SKILL_WRITING_ACCENT = '#059669';
export const EXAM_SKILL_LISTENING_ACCENT = '#d97706';
export const EXAM_SKILL_SPEAKING_ACCENT = '#db2777';

export const EXAM_SKILL_ACCENTS_BY_SLUG = {
  'reading-and-use-of-english': EXAM_SKILL_READING_ACCENT,
  writing: EXAM_SKILL_WRITING_ACCENT,
  listening: EXAM_SKILL_LISTENING_ACCENT,
  speaking: EXAM_SKILL_SPEAKING_ACCENT,
};

/** Orden canónico: Reading → Writing → Listening → Speaking (como Exam Practice). */
export const EXAM_SKILL_SECTION_META = [
  {
    key: 'Reading and Use of English',
    slug: 'reading-and-use-of-english',
    description: 'Grammar, vocabulary in context, and reading comprehension.',
    accent: EXAM_SKILL_READING_ACCENT,
    heroAccent: 'sky',
  },
  {
    key: 'Writing',
    slug: 'writing',
    description: 'Essays, Reviews, Reports, Articles, Emails.',
    accent: EXAM_SKILL_WRITING_ACCENT,
    heroAccent: 'emerald',
  },
  {
    key: 'Listening',
    slug: 'listening',
    description: 'Short extracts, monologues, conversations, and multiple matching.',
    accent: EXAM_SKILL_LISTENING_ACCENT,
    heroAccent: 'amber',
  },
  {
    key: 'Speaking',
    slug: 'speaking',
    description: 'The interview, long turn, collaborative task, and discussion.',
    accent: EXAM_SKILL_SPEAKING_ACCENT,
    heroAccent: 'rose',
  },
];

export function getExamStrategiesMenuItems() {
  return EXAM_SKILL_SECTION_META.map((area) => ({
    label: area.key,
    href: `/exam-strategies/${area.slug}`,
  }));
}

import {
  LEVEL_EXAM_SECTION_RANGES,
  formatPartsLabel,
} from '@/data/levelExamPartMap';

/**
 * Configuración del hub de cada nivel CEFR (/niveles/{level}).
 * Cada examen Cambridge tiene sus propias partes y enlaces.
 */

/** Cinco variantes de examen (alineadas con placement_tests en Supabase). */
export const LEVEL_EXAM_VARIANTS = [
  { id: 1, label: 'Test 1' },
  { id: 2, label: 'Test 2' },
  { id: 3, label: 'Test 3' },
  { id: 4, label: 'Test 4' },
  { id: 5, label: 'Test 5' },
];

const SKILL_UI = {
  'Use of English': { icon: '📝', accent: 'violet', minutesPerTopic: 8 },
  'Reading and Use of English': { icon: '📘', accent: 'violet', minutesPerTopic: 8 },
  'Reading and Writing': { icon: '📖', accent: 'ocean', minutesPerTopic: 6 },
  Reading: { icon: '📖', accent: 'ocean', minutesPerTopic: 7 },
  Writing: { icon: '✍️', accent: 'emerald', minutesPerTopic: 18 },
  Listening: { icon: '🎧', accent: 'amber', minutesPerTopic: 8 },
  Speaking: { icon: '🗣️', accent: 'rose', minutesPerTopic: 10 },
};

/** Resumen por skill para las tarjetas tipo placement intro. */
export function buildSkillSummaries(sections) {
  let partIndex = 1;
  return Object.entries(sections || {}).map(([title, topics]) => {
    const ui = SKILL_UI[title] || { icon: '📋', accent: 'violet', minutesPerTopic: 5 };
    const count = topics.length;
    return {
      part: partIndex++,
      title,
      questionCount: count,
      estimatedMinutes: Math.max(5, Math.round(count * ui.minutesPerTopic)),
      icon: ui.icon,
      accent: ui.accent,
    };
  });
}

/** Ajusta enlaces según el test seleccionado (1–5). */
export function applyExamSlotToHref(href, slug, examNum) {
  if (!href || examNum <= 1) return href;

  if (href.includes('/speaking-lab/')) {
    const sep = href.includes('?') ? '&' : '?';
    return `${href}${sep}examen=${examNum}`;
  }

  if (/\/exam-\d+/.test(href)) {
    return href.replace(/\/exam-\d+/, `/exam-${examNum}`);
  }

  const prefix = `/niveles/${slug}/`;
  if (href.startsWith(prefix)) {
    const sep = href.includes('?') ? '&' : '?';
    return `${href}${sep}examen=${examNum}`;
  }

  return href;
}

export function getFullExamHref(slug, examNum) {
  return `/niveles/${slug}/exam-${examNum}`;
}

/** Ruta exam-* → sección del hub para tarjetas y práctica por skill. */
export const LEVEL_EXAM_SKILL_ROUTES = {
  a2: {
    'exam-reading': { section: 'Reading and Writing', practiceTitle: 'Reading and Writing Practice' },
    'exam-listening': { section: 'Listening', practiceTitle: 'Listening Practice' },
    'exam-speaking': { section: 'Speaking', practiceTitle: 'Speaking Practice' },
    'exam-writing': { section: 'Reading and Writing', practiceTitle: 'Writing Practice' },
    'exam-useofenglish': {
      section: 'Reading and Writing',
      practiceTitle: 'Reading and Writing Practice',
    },
  },
  b1: {
    'exam-reading': { section: 'Reading', practiceTitle: 'Reading Practice' },
    'exam-writing': { section: 'Writing', practiceTitle: 'Writing Practice' },
    'exam-listening': { section: 'Listening', practiceTitle: 'Listening Practice' },
    'exam-speaking': { section: 'Speaking', practiceTitle: 'Speaking Practice' },
    'exam-useofenglish': { section: 'Reading', practiceTitle: 'Use of English Practice' },
  },
  b2: {
    'exam-reading-and-use-of-english': {
      section: 'Reading and Use of English',
      practiceTitle: 'Reading and Use of English Practice',
    },
    'exam-useofenglish': {
      section: 'Reading and Use of English',
      practiceTitle: 'Reading and Use of English Practice',
    },
    'exam-reading': {
      section: 'Reading and Use of English',
      practiceTitle: 'Reading and Use of English Practice',
    },
    'exam-writing': { section: 'Writing', practiceTitle: 'Writing Practice' },
    'exam-listening': { section: 'Listening', practiceTitle: 'Listening Practice' },
    'exam-speaking': { section: 'Speaking', practiceTitle: 'Speaking Practice' },
  },
  c1: {
    'exam-useofenglish': { section: 'Use of English', practiceTitle: 'Use of English Practice' },
    'exam-reading': { section: 'Reading', practiceTitle: 'Reading Practice' },
    'exam-writing': { section: 'Writing', practiceTitle: 'Writing Practice' },
    'exam-listening': { section: 'Listening', practiceTitle: 'Listening Practice' },
    'exam-speaking': { section: 'Speaking', practiceTitle: 'Speaking Practice' },
  },
  c2: {
    'exam-useofenglish': { section: 'Use of English', practiceTitle: 'Use of English Practice' },
    'exam-reading': { section: 'Reading', practiceTitle: 'Reading Practice' },
    'exam-writing': { section: 'Writing', practiceTitle: 'Writing Practice' },
    'exam-listening': { section: 'Listening', practiceTitle: 'Listening Practice' },
    'exam-speaking': { section: 'Speaking', practiceTitle: 'Speaking Practice' },
  },
};

export function getLevelExamSkillRoute(slug, skillRoute) {
  return LEVEL_EXAM_SKILL_ROUTES[String(slug || '').toLowerCase()]?.[skillRoute] || null;
}

/** Sección del hub → ruta de práctica por skill. */
export const LEVEL_SECTION_PRACTICE_HREF = {
  a2: {
    'Reading and Writing': '/niveles/a2/exam-reading',
    Listening: '/niveles/a2/exam-listening',
    Speaking: '/niveles/a2/exam-speaking',
  },
  b1: {
    Reading: '/niveles/b1/exam-reading',
    Writing: '/niveles/b1/exam-writing',
    Listening: '/niveles/b1/exam-listening',
    Speaking: '/niveles/b1/exam-speaking',
  },
  b2: {
    'Reading and Use of English': '/niveles/b2/exam-reading-and-use-of-english',
    Writing: '/niveles/b2/exam-writing',
    Listening: '/niveles/b2/exam-listening',
    Speaking: '/niveles/b2/exam-speaking',
  },
  c1: {
    'Use of English': '/niveles/c1/exam-useofenglish',
    Reading: '/niveles/c1/exam-reading',
    Writing: '/niveles/c1/exam-writing',
    Listening: '/niveles/c1/exam-listening',
    Speaking: '/niveles/c1/exam-speaking',
  },
  c2: {
    'Use of English': '/niveles/c2/exam-useofenglish',
    Reading: '/niveles/c2/exam-reading',
    Writing: '/niveles/c2/exam-writing',
    Listening: '/niveles/c2/exam-listening',
    Speaking: '/niveles/c2/exam-speaking',
  },
};

export function getLevelSkillPracticeHref(levelSlug, skillRoute) {
  const meta = getLevelExamSkillRoute(levelSlug, skillRoute);
  if (!meta?.section) return null;
  return getSectionPracticeHref(levelSlug, meta.section);
}

export function getSectionPracticeHref(slug, sectionTitle) {
  return LEVEL_SECTION_PRACTICE_HREF[String(slug || '').toLowerCase()]?.[sectionTitle] || null;
}

const READING_SKILL_ROUTES = new Set([
  'exam-reading-and-use-of-english',
  'exam-reading',
  'exam-useofenglish',
]);

export function inferSkillRouteFromPracticeHref(href) {
  const path = String(href || '').toLowerCase();
  if (path.includes('reading-and-use-of-english')) return 'exam-reading-and-use-of-english';
  if (path.includes('exam-useofenglish')) return 'exam-useofenglish';
  if (path.includes('exam-writing')) return 'exam-writing';
  if (path.includes('exam-listening')) return 'exam-listening';
  if (path.includes('exam-speaking')) return 'exam-speaking';
  if (path.includes('exam-reading')) return 'exam-reading';
  return null;
}

export function skillRoutesMatch(activeRoute, candidateRoute) {
  const active = String(activeRoute || '').toLowerCase();
  const candidate = String(candidateRoute || '').toLowerCase();
  if (!active || !candidate) return false;
  if (active === candidate) return true;
  return READING_SKILL_ROUTES.has(active) && READING_SKILL_ROUTES.has(candidate);
}

function cleanSkillNavLabel(text = '') {
  return String(text)
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
    .trim();
}

function getSkillNavTheme(href = '') {
  const path = String(href).toLowerCase();
  if (path.includes('writing')) return 'writing';
  if (path.includes('listening')) return 'listening';
  if (path.includes('speaking')) return 'speaking';
  return 'reading';
}

function getShortSkillLabel(label) {
  if (/reading and use of english/i.test(label)) return 'Reading';
  if (/reading & writing/i.test(label)) return 'Reading & Writing';
  return label;
}

/** Skill practice links for the in-session nav strip (excludes exam mode). */
export function getLevelSkillNavLinks(levelSlug) {
  const hub = getNivelesLevelHub(levelSlug);
  if (!hub?.examLinks) return [];

  return hub.examLinks
    .filter((link) => {
      const href = String(link.href || '').toLowerCase();
      return (
        href &&
        !href.includes('exam-mode') &&
        !/\/exam-\d+(?:\/|$|\?)/.test(href)
      );
    })
    .map((link) => {
      const skillRoute = inferSkillRouteFromPracticeHref(link.href);
      return {
        href: link.href,
        label: getShortSkillLabel(cleanSkillNavLabel(link.text)),
        skillRoute,
        theme: getSkillNavTheme(link.href),
        enabledForStudents: link.enabledForStudents !== false,
      };
    })
    .filter((item) => item.skillRoute && item.label);
}

const SECTION_EMOJI = {
  'Use of English': '📘',
  'Reading and Use of English': '📘',
  'Reading and Writing': '📖',
  Reading: '📖',
  Writing: '✍️',
  Listening: '🎧',
  Speaking: '🗣️',
};

/** Secciones del examen completo (mismo formato que B2 Full Exam). */
export function getLevelFullExamSections(slug) {
  const key = String(slug || '').toLowerCase();
  const hub = NIVELES_LEVEL_HUB[key];
  const hrefMap = LEVEL_SECTION_PRACTICE_HREF[key] || {};
  if (!hub?.sections) return [];

  return Object.entries(hub.sections).map(([title, topics]) => {
    const partTopics = topics.filter((t) => !String(t.text).toLowerCase().includes('speaking lab'));
    const configured = LEVEL_EXAM_SECTION_RANGES[key]?.[title];
    const partNumbers = partTopics
      .map((t) => {
        const m = String(t.text).match(/Part\s*(\d+)/i);
        return m ? Number(m[1]) : null;
      })
      .filter((n) => n != null);
    const partMin = configured?.partMin ?? (partNumbers.length ? Math.min(...partNumbers) : 1);
    const partMax =
      configured?.partMax ?? (partNumbers.length ? Math.max(...partNumbers) : partTopics.length);

    return {
      key: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      emoji: SECTION_EMOJI[title] || '📋',
      partsLabel: formatPartsLabel(partMin, partMax),
      href: hrefMap[title] || `/niveles/${key}/exam-1`,
      partMin,
      partMax,
      partsInSection: partTopics.length,
    };
  });
}

/** Rango global de partes del nivel (para progreso en examen completo). */
export function getLevelFullExamPartRange(slug) {
  const sections = getLevelFullExamSections(slug);
  if (!sections.length) return { partMin: 1, partMax: 1, partsCount: 1 };
  const partMin = Math.min(...sections.map((s) => s.partMin));
  const partMax = Math.max(...sections.map((s) => s.partMax));
  const partsCount = sections.reduce((n, s) => n + s.partsInSection, 0);
  return { partMin, partMax, partsCount };
}

export const NIVELES_LEVEL_HUB = {
  a2: {
    slug: 'a2',
    cefr: 'A2',
    examName: 'Key (KET)',
    eyebrow: 'Elementary · A2 Key',
    title: 'Exams',
    description:
      'A basic level qualification that shows you can use English to communicate in simple everyday situations.',
    mascotVariant: 1,
    accent: 'emerald',
    sections: {
      'Reading and Writing': [
        {
          text: 'Part 1: Matching (signs and messages)',
          href: '/niveles/a2/reading-and-use-of-english/part-1',
        },
        {
          text: 'Part 2: Multiple choice (factual text)',
          href: '/niveles/a2/reading-and-use-of-english/part-2',
        },
        {
          text: 'Part 3: Multiple choice (conversation)',
          href: '/niveles/a2/reading-and-use-of-english/part-3',
        },
        {
          text: 'Part 4: Multiple choice (long text)',
          href: '/niveles/a2/reading-and-use-of-english/part-4',
        },
        {
          text: 'Part 5: Multiple choice cloze',
          href: '/niveles/a2/reading-and-use-of-english/part-5',
        },
        {
          text: 'Part 6: Writing a short message',
          href: '/niveles/a2/reading-and-use-of-english/part-6',
        },
        {
          text: 'Part 7: Writing a short story',
          href: '/niveles/a2/reading-and-use-of-english/part-7',
        },
      ],
      Listening: [
        {
          text: 'Part 8: Multiple choice (pictures)',
          href: '/niveles/a2/listening/8',
        },
        {
          text: 'Part 9: Gap-fill (monologue)',
          href: '/niveles/a2/listening/9',
        },
        {
          text: 'Part 10: Multiple choice (conversation)',
          href: '/niveles/a2/listening/10',
        },
        {
          text: 'Part 11: Multiple choice (short extracts)',
          href: '/niveles/a2/listening/11',
        },
        {
          text: 'Part 12: Matching (long conversation)',
          href: '/niveles/a2/listening/12',
        },
      ],
      Speaking: [
        {
          text: 'Speaking Lab (AI) — Practice / Exam',
          href: '/niveles/speaking-lab/a2/',
        },
        {
          text: 'Part 13: Personal information interview',
          href: '/niveles/a2/speaking/13',
        },
        {
          text: 'Part 14: Simulated situation task',
          href: '/niveles/a2/speaking/14',
        },
      ],
    },
    examLinks: [
      { text: '📝 Exam mode', href: '/niveles/a2/exam-1', enabledForStudents: false },
      {
        text: '📖 Reading & Writing',
        href: '/niveles/a2/exam-reading',
        enabledForStudents: false,
      },
      { text: '🎧 Listening', href: '/niveles/a2/exam-listening', enabledForStudents: false },
      { text: '🗣️ Speaking', href: '/niveles/a2/exam-speaking', enabledForStudents: false },
    ],
  },

  b1: {
    slug: 'b1',
    cefr: 'B1',
    examName: 'Preliminary (PET)',
    eyebrow: 'Intermediate · B1 Preliminary',
    title: 'Exams',
    description:
      'An intermediate qualification that shows you can use everyday written and spoken English for work, study and travel.',
    mascotVariant: 2,
    accent: 'amber',
    sections: {
      Reading: [
        {
          text: 'Part 1: Multiple choice (signs and messages)',
          href: '/niveles/b1/reading-and-use-of-english/part-1',
        },
        {
          text: 'Part 2: Matching (people to texts)',
          href: '/niveles/b1/reading-and-use-of-english/part-2',
        },
        {
          text: 'Part 3: Multiple choice (long text)',
          href: '/niveles/b1/reading-and-use-of-english/part-3',
        },
        {
          text: 'Part 4: Gapped text (sentences)',
          href: '/niveles/b1/reading-and-use-of-english/part-4',
        },
        {
          text: 'Part 5: Multiple choice cloze',
          href: '/niveles/b1/reading-and-use-of-english/part-5',
        },
        {
          text: 'Part 6: Open cloze',
          href: '/niveles/b1/reading-and-use-of-english/part-6',
        },
      ],
      Writing: [
        { text: 'Part 7: Email (about 100 words)', href: '/niveles/b1/writing/part-7' },
        {
          text: 'Part 8: Article or story (about 100 words)',
          href: '/niveles/b1/writing/part-8',
        },
      ],
      Listening: [
        {
          text: 'Part 9: Multiple choice (short texts)',
          href: '/niveles/b1/listening/part-9',
        },
        {
          text: 'Part 10: Multiple choice (monologue)',
          href: '/niveles/b1/listening/part-10',
        },
        { text: 'Part 11: Gap-fill (notes)', href: '/niveles/b1/listening/part-11' },
        {
          text: 'Part 12: Multiple choice (interview)',
          href: '/niveles/b1/listening/part-12',
        },
      ],
      Speaking: [
        {
          text: 'Speaking Lab (AI) — Practice / Exam',
          href: '/niveles/speaking-lab/b1/',
        },
        { text: 'Part 13: Personal information', href: '/niveles/b1/speaking/part-13' },
        { text: 'Part 14: Simulated situation', href: '/niveles/b1/speaking/part-14' },
        { text: 'Part 15: Describe photograph', href: '/niveles/b1/speaking/part-15' },
        { text: 'Part 16: General conversation', href: '/niveles/b1/speaking/part-16' },
      ],
    },
    examLinks: [
      { text: '📝 Exam mode', href: '/niveles/b1/exam-1', enabledForStudents: false },
      { text: '📖 Reading', href: '/niveles/b1/exam-reading', enabledForStudents: false },
      { text: '✍️ Writing', href: '/niveles/b1/exam-writing', enabledForStudents: false },
      { text: '🎧 Listening', href: '/niveles/b1/exam-listening', enabledForStudents: false },
      { text: '🗣️ Speaking', href: '/niveles/b1/exam-speaking', enabledForStudents: false },
    ],
  },

  b2: {
    slug: 'b2',
    cefr: 'B2',
    examName: 'First (FCE)',
    eyebrow: 'Upper-Intermediate · B2 First',
    title: 'Exams',
    description:
      'An upper-intermediate qualification that proves you can use everyday written and spoken English for work or study.',
    mascotVariant: 4,
    accent: 'ocean',
    sections: {
      'Reading and Use of English': [
        {
          text: 'Part 1: Multiple-choice cloze',
          href: '/niveles/b2/reading-and-use-of-english/part-1',
        },
        {
          text: 'Part 2: Open cloze',
          href: '/niveles/b2/reading-and-use-of-english/part-2',
        },
        {
          text: 'Part 3: Word formation',
          href: '/niveles/b2/reading-and-use-of-english/part-3',
        },
        {
          text: 'Part 4: Key word transformations',
          href: '/niveles/b2/reading-and-use-of-english/part-4',
        },
        {
          text: 'Part 5: Multiple-choice (reading)',
          href: '/niveles/b2/reading-and-use-of-english/part-5',
        },
        {
          text: 'Part 6: Gapped text',
          href: '/niveles/b2/reading-and-use-of-english/part-6',
        },
        {
          text: 'Part 7: Multiple matching',
          href: '/niveles/b2/reading-and-use-of-english/part-7',
        },
      ],
      Writing: [
        {
          text: 'Part 1: Compulsory essay (140-190 words)',
          href: '/niveles/b2/writing/part-1',
        },
        {
          text: 'Part 2: Article, letter, report or review (140-190 words)',
          href: '/niveles/b2/writing/part-2',
        },
      ],
      Listening: [
        {
          text: 'Part 1: Multiple choice (short extracts)',
          href: '/niveles/b2/listening/part-1',
        },
        {
          text: 'Part 2: Sentence completion (monologue)',
          href: '/niveles/b2/listening/part-2',
        },
        {
          text: 'Part 3: Multiple choice (conversation)',
          href: '/niveles/b2/listening/part-3',
        },
        {
          text: 'Part 4: Multiple matching (short monologues)',
          href: '/niveles/b2/listening/part-4',
        },
      ],
      Speaking: [
        { text: 'Part 1: Interview', href: '/niveles/b2/speaking/part-1' },
        { text: 'Part 2: Long turn (photos)', href: '/niveles/b2/speaking/part-2' },
        { text: 'Part 3: Collaborative task', href: '/niveles/b2/speaking/part-3' },
        { text: 'Part 4: Discussion', href: '/niveles/b2/speaking/part-4' },
      ],
    },
    examContentReady: { 1: true, 2: false, 3: false, 4: false, 5: false },
    examLinks: [
      { text: '📝 Exam mode', href: '/niveles/exam-mode', enabledForStudents: true },
      {
        text: '📘 Reading and Use of English',
        href: '/niveles/b2/exam-reading-and-use-of-english',
        enabledForStudents: true,
      },
      { text: '✍️ Writing', href: '/niveles/b2/exam-writing', enabledForStudents: true },
      { text: '🎧 Listening', href: '/niveles/b2/exam-listening', enabledForStudents: true },
      { text: '🗣️ Speaking', href: '/niveles/b2/exam-speaking', enabledForStudents: true },
    ],
  },

  c1: {
    slug: 'c1',
    cefr: 'C1',
    examName: 'Advanced (CAE)',
    eyebrow: 'Advanced · C1 Advanced',
    title: 'Exams',
    description:
      'An advanced qualification for professional and academic purposes — complex texts, nuance, and fluent expression.',
    mascotVariant: 5,
    accent: 'violet',
    sections: {
      'Use of English': [
        {
          text: 'Part 1: Multiple-choice cloze',
          href: '/niveles/c1/reading-and-use-of-english/part-1',
        },
        {
          text: 'Part 2: Open cloze',
          href: '/niveles/c1/reading-and-use-of-english/part-2',
        },
        {
          text: 'Part 3: Word formation',
          href: '/niveles/c1/reading-and-use-of-english/part-3',
        },
        {
          text: 'Part 4: Key word transformations',
          href: '/niveles/c1/reading-and-use-of-english/part-4',
        },
      ],
      Reading: [
        {
          text: 'Part 5: Multiple choice (reading)',
          href: '/niveles/c1/reading-and-use-of-english/part-5',
        },
        {
          text: 'Part 6: Cross-text multiple matching',
          href: '/niveles/c1/reading-and-use-of-english/part-6',
        },
        {
          text: 'Part 7: Gapped text',
          href: '/niveles/c1/reading-and-use-of-english/part-7',
        },
        {
          text: 'Part 8: Multiple matching',
          href: '/niveles/c1/reading-and-use-of-english/part-8',
        },
      ],
      Writing: [
        { text: 'Part 9: Compulsory essay', href: '/niveles/c1/writing/part-9' },
        {
          text: 'Part 10: Choose from article, review, report, letter, etc.',
          href: '/niveles/c1/writing/part-10',
        },
      ],
      Listening: [
        {
          text: 'Part 11: Short extracts – multiple choice',
          href: '/niveles/c1/listening/part-11',
        },
        {
          text: 'Part 12: Monologue – sentence completion',
          href: '/niveles/c1/listening/part-12',
        },
        {
          text: 'Part 13: Long conversation – multiple choice',
          href: '/niveles/c1/listening/part-13',
        },
        {
          text: 'Part 14: Multiple speakers – matching task',
          href: '/niveles/c1/listening/part-14',
        },
      ],
      Speaking: [
        {
          text: 'Speaking Lab (AI) — Practice / Exam',
          href: '/niveles/speaking-lab/c1/',
        },
        { text: 'Part 15: General conversation', href: '/niveles/c1/speaking/part-15' },
        {
          text: 'Part 16: Long turn (describe photos)',
          href: '/niveles/c1/speaking/part-16',
        },
        { text: 'Part 17: Collaborative task', href: '/niveles/c1/speaking/part-17' },
        { text: 'Part 18: Discussion', href: '/niveles/c1/speaking/part-18' },
      ],
    },
    examLinks: [
      { text: '📝 Exam mode', href: '/niveles/c1/exam-1', enabledForStudents: false },
      {
        text: '📘 Use of English',
        href: '/niveles/c1/exam-useofenglish',
        enabledForStudents: false,
      },
      { text: '📖 Reading', href: '/niveles/c1/exam-reading', enabledForStudents: false },
      { text: '✍️ Writing', href: '/niveles/c1/exam-writing', enabledForStudents: false },
      { text: '🎧 Listening', href: '/niveles/c1/exam-listening', enabledForStudents: false },
      { text: '🗣️ Speaking', href: '/niveles/c1/exam-speaking', enabledForStudents: false },
    ],
  },

  c2: {
    slug: 'c2',
    cefr: 'C2',
    examName: 'Proficiency (CPE)',
    eyebrow: 'Proficiency · C2 Proficiency',
    title: 'Exams',
    description:
      'The highest level qualification — mastery of English for demanding academic and professional contexts.',
    mascotVariant: 6,
    accent: 'rose',
    sections: {
      'Use of English': [
        {
          text: 'Part 1: Multiple-choice cloze',
          href: '/niveles/c2/reading-and-use-of-english/part-1',
        },
        {
          text: 'Part 2: Open cloze',
          href: '/niveles/c2/reading-and-use-of-english/part-2',
        },
        {
          text: 'Part 3: Word formation',
          href: '/niveles/c2/reading-and-use-of-english/part-3',
        },
        {
          text: 'Part 4: Key word transformations',
          href: '/niveles/c2/reading-and-use-of-english/part-4',
        },
      ],
      Reading: [
        {
          text: 'Part 5: Multiple-choice (reading)',
          href: '/niveles/c2/reading-and-use-of-english/part-5',
        },
        {
          text: 'Part 6: Gapped text',
          href: '/niveles/c2/reading-and-use-of-english/part-6',
        },
        {
          text: 'Part 7: Multiple matching',
          href: '/niveles/c2/reading-and-use-of-english/part-7',
        },
      ],
      Writing: [
        {
          text: 'Part 8: Compulsory task (240-280 words)',
          href: '/niveles/c2/writing/part-8',
        },
        {
          text: 'Part 9: Essay, letter, proposal, report or review (280-320 words)',
          href: '/niveles/c2/writing/part-9',
        },
      ],
      Listening: [
        {
          text: 'Part 10: Multiple choice (short extracts)',
          href: '/niveles/c2/listening/part-10',
        },
        {
          text: 'Part 11: Sentence completion (monologue)',
          href: '/niveles/c2/listening/part-11',
        },
        {
          text: 'Part 12: Multiple choice (conversation)',
          href: '/niveles/c2/listening/part-12',
        },
        {
          text: 'Part 13: Multiple matching (short monologues)',
          href: '/niveles/c2/listening/part-13',
        },
      ],
      Speaking: [
        {
          text: 'Speaking Lab (AI) — Practice / Exam',
          href: '/niveles/speaking-lab/c2/',
        },
        { text: 'Part 14: Interview', href: '/niveles/c2/speaking/part-14' },
        { text: 'Part 15: Long turn', href: '/niveles/c2/speaking/part-15' },
        {
          text: 'Part 16: Collaborative task and discussion',
          href: '/niveles/c2/speaking/part-16',
        },
      ],
    },
    examLinks: [
      { text: '📝 Exam mode', href: '/niveles/c2/exam-1', enabledForStudents: false },
      {
        text: '📘 Use of English',
        href: '/niveles/c2/exam-useofenglish',
        enabledForStudents: false,
      },
      { text: '📖 Reading', href: '/niveles/c2/exam-reading', enabledForStudents: false },
      { text: '✍️ Writing', href: '/niveles/c2/exam-writing', enabledForStudents: false },
      { text: '🎧 Listening', href: '/niveles/c2/exam-listening', enabledForStudents: false },
      { text: '🗣️ Speaking', href: '/niveles/c2/exam-speaking', enabledForStudents: false },
    ],
  },
};

export function getNivelesLevelHub(slug) {
  return NIVELES_LEVEL_HUB[String(slug || '').toLowerCase()] || null;
}

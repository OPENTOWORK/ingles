/**
 * Numeración global de partes del examen Cambridge por nivel (paper order).
 * Usado en práctica por skill, full exam y progreso (levels_puntuaciones.parte_numero).
 */

export const LEVEL_EXAM_SECTION_RANGES = {
  a2: {
    'Reading and Writing': { partMin: 1, partMax: 7 },
    Listening: { partMin: 8, partMax: 12 },
    Speaking: { partMin: 13, partMax: 14 },
  },
  b1: {
    Reading: { partMin: 1, partMax: 6 },
    Writing: { partMin: 7, partMax: 8 },
    Listening: { partMin: 9, partMax: 12 },
    Speaking: { partMin: 13, partMax: 16 },
  },
  b2: {
    'Reading and Use of English': { partMin: 1, partMax: 7 },
    Writing: { partMin: 8, partMax: 9 },
    Listening: { partMin: 10, partMax: 13 },
    Speaking: { partMin: 14, partMax: 17 },
  },
  c1: {
    'Use of English': { partMin: 1, partMax: 4 },
    Reading: { partMin: 5, partMax: 8 },
    Writing: { partMin: 9, partMax: 10 },
    Listening: { partMin: 11, partMax: 14 },
    Speaking: { partMin: 15, partMax: 18 },
  },
  c2: {
    'Use of English': { partMin: 1, partMax: 4 },
    Reading: { partMin: 5, partMax: 7 },
    Writing: { partMin: 8, partMax: 9 },
    Listening: { partMin: 10, partMax: 13 },
    Speaking: { partMin: 14, partMax: 16 },
  },
};

/** Ruta exam-* → clave de sección en LEVEL_EXAM_SECTION_RANGES */
const SKILL_ROUTE_SECTION = {
  a2: {
    'exam-reading': 'Reading and Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
    'exam-writing': 'Reading and Writing',
    'exam-useofenglish': 'Reading and Writing',
  },
  b1: {
    'exam-reading': 'Reading',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
    'exam-useofenglish': 'Reading',
  },
  b2: {
    'exam-reading-and-use-of-english': 'Reading and Use of English',
    'exam-useofenglish': 'Reading and Use of English',
    'exam-reading': 'Reading and Use of English',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
  },
  c1: {
    'exam-useofenglish': 'Use of English',
    'exam-reading': 'Reading',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
  },
  c2: {
    'exam-useofenglish': 'Use of English',
    'exam-reading': 'Reading',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
  },
};

export function getLevelExamSectionRange(slug, sectionTitle) {
  const key = String(slug || '').toLowerCase();
  return LEVEL_EXAM_SECTION_RANGES[key]?.[sectionTitle] || { partMin: 1, partMax: 1 };
}

export function getExamSkillPartRange(slug, skillRoute) {
  const key = String(slug || '').toLowerCase();
  const section = SKILL_ROUTE_SECTION[key]?.[skillRoute];
  if (!section) return { partMin: 1, partMax: 1 };
  return getLevelExamSectionRange(key, section);
}

export function getExamSkillSectionTitle(slug, skillRoute) {
  const key = String(slug || '').toLowerCase();
  return SKILL_ROUTE_SECTION[key]?.[skillRoute] || null;
}

export function formatPartsLabel(partMin, partMax) {
  if (partMin === partMax) return `Parte ${partMin}`;
  return `Partes ${partMin} a ${partMax}`;
}

/** Carpeta bajo /niveles/{slug}/ → sección del paper */
export const LEVEL_SKILL_FOLDER_SECTION = {
  a2: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Reading and Writing',
    'reading-and-use-of-english': 'Reading and Writing',
  },
  b1: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
    'reading-and-use-of-english': 'Reading',
  },
  b2: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
    'reading-and-use-of-english': 'Reading and Use of English',
  },
  c1: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
    'reading-and-use-of-english': null,
  },
  c2: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
    'reading-and-use-of-english': null,
  },
};

const SKILL_FOLDER_PRACTICE_ROUTE = {
  listening: 'exam-listening',
  speaking: 'exam-speaking',
  writing: 'exam-writing',
  'reading-and-use-of-english': 'exam-reading-and-use-of-english',
};

function resolvePartSectionAndPractice(slug, skillFolder, part) {
  const key = String(slug || '').toLowerCase();
  const n = Number(part);

  if (skillFolder === 'reading-and-use-of-english' && (key === 'b2' || key === 'c1' || key === 'c2')) {
    if (key === 'b2') {
      return { sectionTitle: 'Reading and Use of English', practiceRoute: 'exam-reading-and-use-of-english' };
    }
    if (n >= 1 && n <= 4) {
      return { sectionTitle: 'Use of English', practiceRoute: 'exam-useofenglish' };
    }
    return { sectionTitle: 'Reading', practiceRoute: 'exam-reading' };
  }

  const sectionTitle = LEVEL_SKILL_FOLDER_SECTION[key]?.[skillFolder] || 'Reading';
  const practiceRoute = SKILL_FOLDER_PRACTICE_ROUTE[skillFolder] || 'exam-reading';
  return { sectionTitle, practiceRoute };
}

/** Enlaces de navegación entre partes (numeración global del paper). */
export function getLevelPartNavLinks(slug, skillFolder, part) {
  const key = String(slug || '').toLowerCase();
  const n = Number(part);
  const { sectionTitle, practiceRoute } = resolvePartSectionAndPractice(key, skillFolder, n);
  const { partMin, partMax } = getLevelExamSectionRange(key, sectionTitle);
  const basePath = `/niveles/${key}/${skillFolder}`;
  const practiceHref = `/niveles/${key}/${practiceRoute}`;

  return {
    partMin,
    partMax,
    backLink: n <= partMin ? practiceHref : `${basePath}/${n - 1}`,
    nextLink: n >= partMax ? practiceHref : `${basePath}/${n + 1}`,
    homeLink: `/niveles/${key}`,
    practiceHref,
    showPrev: n > partMin,
    showNext: n < partMax,
  };
}

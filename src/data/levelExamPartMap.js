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
    'Reading and Use of English': { partMin: 1, partMax: 8 },
    Writing: { partMin: 9, partMax: 10 },
    Listening: { partMin: 11, partMax: 14 },
    Speaking: { partMin: 15, partMax: 18 },
  },
  c2: {
    'Reading and Use of English': { partMin: 1, partMax: 7 },
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
    'exam-reading-and-use-of-english': 'Reading and Use of English',
    'exam-useofenglish': 'Reading and Use of English',
    'exam-reading': 'Reading and Use of English',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
  },
  c2: {
    'exam-reading-and-use-of-english': 'Reading and Use of English',
    'exam-useofenglish': 'Reading and Use of English',
    'exam-reading': 'Reading and Use of English',
    'exam-writing': 'Writing',
    'exam-listening': 'Listening',
    'exam-speaking': 'Speaking',
  },
};

export function getLevelExamSectionRange(slug, sectionTitle) {
  const key = String(slug || '').toLowerCase();
  return LEVEL_EXAM_SECTION_RANGES[key]?.[sectionTitle] || { partMin: 1, partMax: 1 };
}

/** Global paper part number → Cambridge section title (e.g. B2 part 5 → Reading and Use of English). */
export function inferSectionTitleFromPart(slug, partNumber) {
  const key = String(slug || '').toLowerCase();
  const pn = Number(partNumber);
  if (!Number.isFinite(pn) || pn <= 0) return null;
  const ranges = LEVEL_EXAM_SECTION_RANGES[key];
  if (!ranges) return null;
  for (const [title, { partMin, partMax }] of Object.entries(ranges)) {
    if (pn >= partMin && pn <= partMax) return title;
  }
  return null;
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
    'reading-and-use-of-english': 'Reading and Use of English',
  },
  c2: {
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
    'reading-and-use-of-english': 'Reading and Use of English',
  },
};

const SKILL_FOLDER_PRACTICE_ROUTE = {
  listening: 'exam-listening',
  speaking: 'exam-speaking',
  writing: 'exam-writing',
  'reading-and-use-of-english': 'exam-reading-and-use-of-english',
};

function resolvePartSectionAndPractice(slug, skillFolder) {
  const key = String(slug || '').toLowerCase();

  if (skillFolder === 'reading-and-use-of-english' && (key === 'b2' || key === 'c1' || key === 'c2')) {
    return { sectionTitle: 'Reading and Use of English', practiceRoute: 'exam-reading-and-use-of-english' };
  }

  const sectionTitle = LEVEL_SKILL_FOLDER_SECTION[key]?.[skillFolder] || 'Reading';
  const practiceRoute = SKILL_FOLDER_PRACTICE_ROUTE[skillFolder] || 'exam-reading';
  return { sectionTitle, practiceRoute };
}

/** Enlaces de navegación entre partes (numeración global del paper). */
export function getLevelPartNavLinks(slug, skillFolder, part) {
  const key = String(slug || '').toLowerCase();
  const n = Number(part);
  const { sectionTitle, practiceRoute } = resolvePartSectionAndPractice(key, skillFolder);
  const { partMin, partMax } = getLevelExamSectionRange(key, sectionTitle);
  const basePath = `/niveles/${key}/${skillFolder}`;
  const practiceHref = `/niveles/${key}/${practiceRoute}`;
  // Hub links may use the paper's local numbering (Listening part-1…4) instead of global part numbers.
  const usesLocalNumbers = n < partMin;
  const first = usesLocalNumbers ? 1 : partMin;
  const last = usesLocalNumbers ? partMax - partMin + 1 : partMax;

  return {
    partMin,
    partMax,
    backLink: n <= first ? practiceHref : `${basePath}/${n - 1}`,
    nextLink: n >= last ? practiceHref : `${basePath}/${n + 1}`,
    homeLink: `/niveles/${key}`,
    practiceHref,
    showPrev: n > first,
    showNext: n < last,
  };
}

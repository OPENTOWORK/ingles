import { LEVEL_EXAM_SECTION_RANGES } from '@/data/levelExamPartMap';
import { LEVEL_SECTION_PRACTICE_HREF } from '@/data/nivelesLevelHub';

/** B2 First exam practice modules in paper order (parts 1–17). */
export const B2_EXAM_MODULES = [
  {
    partMin: 1,
    partMax: 7,
    href: '/niveles/b2/exam-reading-and-use-of-english',
    title: 'Reading and Use of English',
  },
  {
    partMin: 8,
    partMax: 9,
    href: '/niveles/b2/exam-writing',
    title: 'Writing',
  },
  {
    partMin: 10,
    partMax: 13,
    href: '/niveles/b2/exam-listening',
    title: 'Listening',
  },
  {
    partMin: 14,
    partMax: 17,
    href: '/niveles/b2/exam-speaking',
    title: 'Speaking',
  },
];

/** Módulos de práctica por nivel (orden del paper). */
export function getLevelExamModules(slug = 'b2') {
  const key = String(slug || 'b2').toLowerCase();
  if (key === 'b2') return B2_EXAM_MODULES;

  const ranges = LEVEL_EXAM_SECTION_RANGES[key];
  const hrefs = LEVEL_SECTION_PRACTICE_HREF[key];
  if (!ranges || !hrefs) return B2_EXAM_MODULES;

  return Object.entries(ranges)
    .map(([title, { partMin, partMax }]) => ({
      partMin,
      partMax,
      href: hrefs[title] || `/niveles/${key}`,
      title,
    }))
    .sort((a, b) => a.partMin - b.partMin);
}

function findModuleForPart(partNumber, modules = B2_EXAM_MODULES) {
  return modules.find((m) => partNumber >= m.partMin && partNumber <= m.partMax);
}

/**
 * Navigation state for B2 exam practice footers.
 *
 * @param {object} params
 * @param {number} params.partNumber — current global part (1–17)
 * @param {number} params.pagePartMax — last part loaded on this page
 * @param {number} [params.examSlot]
 */
export function getB2ExamPracticeNavState({ partNumber, pagePartMax, examSlot = 1, slug = 'b2' }) {
  const levelSlug = String(slug || 'b2').toLowerCase();
  const modules = getLevelExamModules(levelSlug);
  const n = Number(partNumber) || 0;
  const pageMax = Number(pagePartMax) || n;
  const module = findModuleForPart(n, modules);
  const slotQuery = examSlot ? `?examen=${examSlot}` : '';

  const hasNextInPage = n > 0 && n < pageMax;
  const hasNextInModule = module ? n < module.partMax : false;

  let continueMode = 'none';
  let continueHref = null;
  let nextPartNumber = null;
  let continueModuleTitle = null;

  if (hasNextInPage) {
    continueMode = 'in-page';
    nextPartNumber = n + 1;
  } else if (hasNextInModule && module) {
    continueMode = 'link';
    nextPartNumber = n + 1;
    continueHref = `${module.href}?examen=${examSlot}&part=${nextPartNumber}`;
    continueModuleTitle = module.title;
  } else if (module) {
    const moduleIndex = modules.indexOf(module);
    const nextModule = modules[moduleIndex + 1];
    if (nextModule) {
      continueMode = 'link';
      continueHref = `${nextModule.href}${slotQuery}`;
      continueModuleTitle = nextModule.title;
    }
  }

  return {
    overviewHref: `/niveles/${levelSlug}`,
    hasNextInPage,
    nextPartNumber,
    continueMode,
    continueHref,
    continueModuleTitle,
  };
}

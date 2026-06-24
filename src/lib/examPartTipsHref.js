/**
 * Helpers de URL para tips de Exam Strategies (sin dependencias del catálogo de part-info).
 */

import { APP_ROUTES } from '@/config/appRoutes';

export function parseNivelesPartHref(href) {
  if (!href) return null;
  const withPart = href.match(
    /^\/(?:niveles|exam-practice)\/([a-z0-9]+)\/(reading-and-use-of-english|writing|listening|speaking)\/part-(\d+)\/?$/i,
  );
  if (withPart) {
    const [, levelSlug, skillPath, partNum] = withPart;
    return {
      levelSlug,
      partKey: partNum,
      registryKey: `${levelSlug}-${skillPath}`,
    };
  }
  const numeric = href.match(
    /^\/(?:niveles|exam-practice)\/([a-z0-9]+)\/(listening|speaking)\/(\d+)\/?$/i,
  );
  if (numeric) {
    const [, levelSlug, skillPath, partNum] = numeric;
    return {
      levelSlug,
      partKey: partNum,
      registryKey: `${levelSlug}-${skillPath}`,
    };
  }
  return null;
}

export function buildNivelesPartTipsHref(levelSlug, skillFolder, partNum) {
  const level = String(levelSlug).toLowerCase();
  const skill = String(skillFolder);
  const n = Number(partNum);
  if (level === 'a2' && (skill === 'listening' || skill === 'speaking')) {
    return `${APP_ROUTES.examPractice}/${level}/${skill}/${n}`;
  }
  return `${APP_ROUTES.examPractice}/${level}/${skill}/part-${n}`;
}

export function buildExamTheoryPartTipsHref(nivelesHref) {
  const parsed = parseNivelesPartHref(nivelesHref);
  if (!parsed) return nivelesHref;
  const skill = parsed.registryKey.slice(parsed.levelSlug.length + 1);
  const partSeg = nivelesHref.replace(/\/$/, '').split('/').pop() || `part-${parsed.partKey}`;
  return `${APP_ROUTES.examStrategies}/exam-part-tips/${parsed.levelSlug}/${skill}/${partSeg}`;
}

export function buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum) {
  return buildExamTheoryPartTipsHref(buildNivelesPartTipsHref(levelSlug, skillFolder, partNum));
}

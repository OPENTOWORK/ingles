import { examTheorySlugFromPartHref } from '@/data/examTheoryPartTips';
import { buildExamTheoryPartTipsHref } from '@/lib/examPartTipsHref';
import { APP_ROUTES, examStrategiesSkillPath } from '@/config/appRoutes';

const NIVELES_PART_TIPS_PATH =
  /^\/(?:niveles|exam-practice)\/(a2|b1|b2|c1|c2)\/(reading-and-use-of-english|writing|listening|speaking)\/(part-\d+|\d+)\/?$/i;

const TEORIA_PART_TIPS_PATH =
  /^\/(?:teoria\/exam-part-tips|exam-strategies\/exam-part-tips)\/(a2|b1|b2|c1|c2)\/(reading-and-use-of-english|writing|listening|speaking)\/(part-\d+|\d+)\/?$/i;

/** Rutas legacy bajo /niveles o /exam-practice (redirigen a /exam-strategies/exam-part-tips). */
export function isNivelesPartTipsPath(pathname) {
  return Boolean(pathname && NIVELES_PART_TIPS_PATH.test(pathname));
}

/** Rutas canónicas de tips en Exam Strategies. */
export function isTeoriaExamPartTipsPath(pathname) {
  return Boolean(pathname && TEORIA_PART_TIPS_PATH.test(pathname));
}

export function isExamTheoryPartTipsPath(pathname) {
  return isNivelesPartTipsPath(pathname) || isTeoriaExamPartTipsPath(pathname);
}

export function examTheoryBackHrefFromPartTipsPath(pathname) {
  const slug = examTheorySlugFromPartHref(pathname);
  return slug ? examStrategiesSkillPath(slug) : APP_ROUTES.examStrategies;
}

/** Convierte un enlace /niveles/… o /exam-practice/… a la ruta canónica bajo /exam-strategies/exam-part-tips/… */
export function nivelesPartHrefToTeoria(href) {
  if (!href) return null;
  if (isTeoriaExamPartTipsPath(href)) return href.replace(/\/$/, '') || href;
  if (isNivelesPartTipsPath(href)) return buildExamTheoryPartTipsHref(href);
  return null;
}

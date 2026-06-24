/** Canonical app paths aligned with main nav section titles. */

export const APP_ROUTES = {
  home: '/',
  examStrategies: '/exam-strategies',
  examPractice: '/exam-practice',
  examPracticeDefaultLevel: '/exam-practice/b2',
  contact: '/contact',
  profile: '/profile',
  teoria: '/teoria',
  login: '/login',
};

export const EXAM_STRATEGY_SKILL_SLUGS = [
  'reading-and-use-of-english',
  'writing',
  'listening',
  'speaking',
  'use-of-english',
  'reading',
];

export function examStrategiesSkillPath(slug) {
  return `${APP_ROUTES.examStrategies}/${slug}`;
}

export function examStrategiesChapterPath(skill, chapter) {
  return `${APP_ROUTES.examStrategies}/${skill}/${chapter}`;
}

export function examStrategiesPartTipsPath(level, skill, part) {
  return `${APP_ROUTES.examStrategies}/exam-part-tips/${level}/${skill}/${part}`;
}

export function examPracticeLevelPath(level = 'b2') {
  return `${APP_ROUTES.examPractice}/${String(level).toLowerCase()}`;
}

/** Maps legacy /niveles/… paths to /exam-practice/…. */
export function nivelesPathToExamPractice(path = '') {
  if (!path) return APP_ROUTES.examPracticeDefaultLevel;
  return path.replace(/^\/niveles(?=\/|$)/, APP_ROUTES.examPractice);
}

/** Maps legacy exam-theory /teoria/… paths to /exam-strategies/…. */
export function teoriaExamPathToExamStrategies(path = '') {
  if (!path) return APP_ROUTES.examStrategies;
  if (path.startsWith('/teoria/exam-part-tips/')) {
    return path.replace('/teoria/exam-part-tips/', `${APP_ROUTES.examStrategies}/exam-part-tips/`);
  }
  if (path.startsWith('/teoria/exam-strategies/')) {
    return path.replace('/teoria/exam-strategies/', `${APP_ROUTES.examStrategies}/`);
  }
  const skillMatch = path.match(/^\/teoria\/([^/?#]+)/);
  if (skillMatch && EXAM_STRATEGY_SKILL_SLUGS.includes(skillMatch[1])) {
    return examStrategiesSkillPath(skillMatch[1]);
  }
  return path;
}

export function isExamStrategiesPath(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/';
  return path === APP_ROUTES.examStrategies || path.startsWith(`${APP_ROUTES.examStrategies}/`);
}

export function isExamPracticeAppPath(pathname = '') {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === APP_ROUTES.examPractice) return false;
  return path.startsWith(`${APP_ROUTES.examPractice}/`);
}

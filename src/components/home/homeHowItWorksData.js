import { isAdminRole } from '@/utils/authRoles';

/** Level hub used for in-tour demos (exam mode + skills visible for students). */
export const GUIDED_TOUR_LEVEL_PATH = '/niveles/b2';

/** Tour for students: Exam practice and Exam theory. */
export const GUIDED_TOUR_STEPS_STUDENT = [
  {
    id: 'welcome',
    title: 'How it works',
    sectionLabel: 'Home',
    description:
      'A quick tour of what you use every day: Exam practice for timed papers and Exam theory for tips by part and level.',
  },
  {
    id: 'exam-practice-nav',
    title: 'Exam practice',
    sectionLabel: 'Top menu → Exam practice',
    description:
      'Open Exam practice in the menu to choose your exam level (A2–C2), try timed papers, exam mode, and part-by-part practice.',
    target: '[data-tour="nav-levels"]',
    route: '/',
    href: '/niveles',
    openNavOnMobile: true,
  },
  {
    id: 'exam-theory-nav',
    title: 'Exam theory',
    sectionLabel: 'Top menu → Exam theory',
    description:
      'Open Exam theory for interactive tips on Reading, Use of English, Listening, Writing, and Speaking — task format, timing, strategies, and common mistakes. Pick a skill, then filter by CEFR level to open each part.',
    target: '[data-tour="nav-exam-theory"]',
    route: '/',
    href: '/niveles?tab=theory',
    openNavOnMobile: true,
  },
  {
    id: 'levels-practice',
    title: 'Choose your level',
    sectionLabel: 'Exam practice → CEFR grid',
    description:
      'Pick the card for your target exam. Each level opens a hub with mock papers, strategies, and Exam mode.',
    target: '[data-tour="niveles-levels"]',
    route: '/niveles',
    scrollTarget: true,
    href: '/niveles',
  },
  {
    id: 'levels-hub',
    title: 'Inside a level',
    sectionLabel: 'Level hub',
    description:
      'This is one CEFR level (B2 as an example). Use the breadcrumb to return to all levels. Everything here is practice for that exam.',
    target: '[data-tour="level-hub-hero"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: GUIDED_TOUR_LEVEL_PATH,
  },
  {
    id: 'levels-exam-practice',
    title: 'Timed exam papers',
    sectionLabel: 'Level hub → Exam Practice',
    description:
      'Practice by skill: Reading and Use of English, Writing, Listening, and Speaking — under exam-style timing.',
    target: '[data-tour="level-exam-practice"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
  },
  {
    id: 'levels-exam-mode',
    title: 'Exam mode',
    sectionLabel: 'Exam Practice → Exam mode',
    description:
      'Run a full simulation: sections in order, countdown, no help until you finish, then results with your score per paper.',
    target: '[data-tour="level-exam-mode"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: `${GUIDED_TOUR_LEVEL_PATH}/exam-mode`,
  },
  {
    id: 'levels-skills-tips',
    title: 'Tips by part',
    sectionLabel: 'Exam theory → filter by level',
    description:
      'Back in Exam theory, choose a skill and a CEFR level to read Description & interactive tips for each exam part — then head to Exam practice to apply them.',
    target: '#exam-theory',
    route: '/niveles',
    href: '/niveles?tab=theory',
    scrollTarget: true,
    cardPlacement: 'center',
  },
];

/** Extra steps for admins (Theory, Placement Test, Training on the home page). */
export const GUIDED_TOUR_STEPS_ADMIN_EXTRA = [
  {
    id: 'theory-nav',
    title: 'Theory',
    sectionLabel: 'Home → Theory',
    description:
      'As an admin you also have Theory on the home page — Grammar, Vocabulary and Pronunciation before exam-style tasks.',
    target: '[data-tour="nav-theory"]',
    route: '/',
    href: '/teoria',
  },
  {
    id: 'theory-hub',
    title: 'Theory sections',
    sectionLabel: 'Theory page → skill areas',
    description:
      'Open a card (Grammar, Vocabulary or Pronunciation), then pick topics inside. Finish a section to unlock the next one.',
    target: '[data-tour="theory-sections"]',
    route: '/teoria',
    scrollTarget: true,
  },
  {
    id: 'placement-nav',
    title: 'Placement test',
    sectionLabel: 'Home → Placement Test',
    description:
      'Placement Test recommends a CEFR level and unlocks the right practice path for new learners.',
    target: '[data-tour="nav-placement"]',
    route: '/',
    href: '/prueba-nivel',
  },
];

export function getGuidedTourSteps(userRole = 'student') {
  if (isAdminRole(userRole)) {
    return [...GUIDED_TOUR_STEPS_STUDENT, ...GUIDED_TOUR_STEPS_ADMIN_EXTRA];
  }
  return GUIDED_TOUR_STEPS_STUDENT;
}

/** @deprecated Use getGuidedTourSteps(userRole) */
export const GUIDED_TOUR_STEPS = GUIDED_TOUR_STEPS_STUDENT;

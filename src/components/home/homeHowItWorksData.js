import { isAdminRole } from '@/utils/authRoles';

/** Level hub used for in-tour demos (exam mode + skills visible for students). */
export const GUIDED_TOUR_LEVEL_PATH = '/niveles/b2';

/** Tour for students: Exam practice + Dralo AI (what they see in the menu). */
export const GUIDED_TOUR_STEPS_STUDENT = [
  {
    id: 'welcome',
    title: 'How it works',
    sectionLabel: 'Home',
    description:
      'A quick tour of what you use every day: Exam practice for Cambridge-style papers and skills, and Dralo AI for feedback on Use of English, Reading, Writing, Listening, Speaking, and more.',
  },
  {
    id: 'exam-practice-nav',
    title: 'Exam practice',
    sectionLabel: 'Top menu → Exam practice',
    description:
      'Open Exam practice in the menu to choose your exam level (A2–C2), try timed papers, exam mode, and part-by-part tips.',
    target: '[data-tour="nav-levels"]',
    route: '/',
    href: '/niveles',
    openNavOnMobile: true,
  },
  {
    id: 'levels-practice',
    title: 'Choose your level',
    sectionLabel: 'Exam practice → CEFR grid',
    description:
      'Pick the card for your target exam. Each level opens a hub with mock papers, strategies, and **Exam mode**.',
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
    title: 'Skills & tips',
    sectionLabel: 'Level hub → skill blocks',
    description:
      'Open a part for interactive tips — task format, timing, and strategies — before doing the exercises.',
    target: '[data-tour="level-skills-sections"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    cardPlacement: 'center',
  },
  {
    id: 'dralo-ai-nav',
    title: 'Dralo AI',
    sectionLabel: 'Top menu → Dralo AI',
    description:
      'Use Dralo AI in the menu for instant help: Use of English, Reading, Writing, Listening, Speaking, Grammar coach, and Dictionary.',
    target: '[data-tour="nav-dralo-ai"]',
    route: '/',
    href: '/dralo-ai',
    openNavOnMobile: true,
  },
  {
    id: 'dralo-ai-hub',
    title: 'Dralo AI tools',
    sectionLabel: 'Dralo AI hub',
    description:
      'Each card is a dedicated studio. Pick a skill, follow the prompts, and get AI feedback tailored to Cambridge tasks.',
    target: '[data-tour="dralo-ai-hub"]',
    route: '/dralo-ai',
    scrollTarget: true,
    href: '/dralo-ai/use-of-english',
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

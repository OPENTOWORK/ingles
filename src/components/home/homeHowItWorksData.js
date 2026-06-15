import { isAdminRole } from '@/utils/authRoles';

/** Level hub used for in-tour demos (exam mode + skills visible for students). */
export const GUIDED_TOUR_LEVEL_PATH = '/niveles/b2';

/** Tour for students: mostly Exam practice, plus a short Exam theory overview. */
export const GUIDED_TOUR_STEPS_STUDENT = [
  {
    id: 'welcome',
    title: 'How it works',
    sectionLabel: 'Home',
    description:
      'A quick walkthrough of Exam practice — timed mock papers, part-by-part training, and full exam mode. At the end, a short look at Exam theory for tips before you practise.',
  },
  {
    id: 'exam-practice-nav',
    title: 'Exam practice',
    sectionLabel: 'Top menu → Exam practice',
    description:
      'Your main workspace. Open Exam practice to reach mock papers for your level — Reading and Use of English, Writing, Listening, and Speaking.',
    target: '[data-tour="nav-levels"]',
    route: '/',
    href: '/niveles/b2',
    openNavOnMobile: true,
  },
  {
    id: 'levels-hub',
    title: 'Your level hub',
    sectionLabel: 'Exam practice → B2 hub',
    description:
      'Each CEFR level has its own hub (B2 shown here). You see the exam name, how many papers are available, and quick access to every practice area.',
    target: '[data-tour="level-hub-hero"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: GUIDED_TOUR_LEVEL_PATH,
  },
  {
    id: 'levels-exam-practice',
    title: 'Practice by paper',
    sectionLabel: 'Level hub → Exam Practice',
    description:
      'Pick a paper to practise on its own: Reading and Use of English, Writing, Listening, or Speaking. Each opens timed tasks with instant feedback when you check your answers.',
    target: '[data-tour="level-exam-practice"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: '/niveles/b2/exam-reading-and-use-of-english',
  },
  {
    id: 'exam-practice-by-part',
    title: 'Practice by part',
    sectionLabel: 'Inside a paper',
    description:
      'Inside a paper, switch between parts (e.g. Parts 1–4 for Use of English, or 5–7 for Reading). Track progress in the side panel, flag tricky questions, and review when you are done.',
    route: GUIDED_TOUR_LEVEL_PATH,
    cardPlacement: 'center',
    href: '/niveles/b2/exam-reading-and-use-of-english',
  },
  {
    id: 'levels-exam-mode',
    title: 'Exam mode',
    sectionLabel: 'Level hub → Exam mode',
    description:
      'Run a full mock exam: papers in order, countdown timers, no help until you submit, then a results summary with your score per section.',
    target: '[data-tour="level-exam-mode"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: '/niveles/exam-mode',
  },
  {
    id: 'exam-theory-nav',
    title: 'Exam theory',
    sectionLabel: 'Top menu → Exam theory',
    description:
      'Before or after practising, open Exam theory for task formats, timing, strategies, and common mistakes — organised by skill and CEFR level.',
    target: '[data-tour="nav-exam-theory"]',
    route: '/',
    href: '/niveles?tab=theory',
    openNavOnMobile: true,
  },
  {
    id: 'exam-theory-hub',
    title: 'Tips by skill & part',
    sectionLabel: 'Exam theory → skill areas',
    description:
      'Choose Reading and Use of English, Writing, Listening, or Speaking. Filter by level, open a part, and read Description & interactive tips — then return to Exam practice to apply them.',
    target: '[data-tour="exam-theory-hub"]',
    route: '/niveles?tab=theory',
    href: '/niveles?tab=theory',
    scrollTarget: true,
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

import { isAdminRole } from '@/utils/authRoles';

/** Level hub used for in-tour demos (B2 for students). */
export const GUIDED_TOUR_LEVEL_PATH = '/niveles/b2';

/** Tour for students: Exam practice (B2), Profile, Contact, and Pricing. */
export const GUIDED_TOUR_STEPS_STUDENT = [
  {
    id: 'welcome',
    title: 'How it works',
    sectionLabel: 'Home',
    description:
      'A quick tour of what you can use as a student: B2 Exam Practice, your Profile, Contact for support, and Pricing to see plans and upgrades.',
  },
  {
    id: 'exam-practice-nav',
    title: 'Exam Practice',
    sectionLabel: 'Top menu → Exam Practice',
    description:
      'Your main workspace. Open Exam Practice to reach the B2 hub — Reading and Use of English, Writing, Listening, and Speaking papers with timed tasks and feedback.',
    target: '[data-tour="nav-levels"]',
    route: '/',
    href: '/niveles/b2',
    openNavOnMobile: true,
  },
  {
    id: 'levels-hub',
    title: 'B2 exam hub',
    sectionLabel: 'Exam Practice → B2',
    description:
      'The B2 hub shows available mock papers and practice areas. Choose a paper to practise part by part or work through full sections.',
    target: '[data-tour="level-hub-hero"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: GUIDED_TOUR_LEVEL_PATH,
  },
  {
    id: 'levels-exam-practice',
    title: 'Practice papers & parts',
    sectionLabel: 'B2 hub → papers',
    description:
      'Pick Reading and Use of English, Writing, Listening, or Speaking. Inside each paper you can train individual parts, check answers, and track progress.',
    target: '[data-tour="level-exam-practice"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: '/niveles/b2/exam-reading-and-use-of-english',
  },
  {
    id: 'profile-nav',
    title: 'Profile',
    sectionLabel: 'Top menu → Profile',
    description:
      'Your personal space: avatar, study activity, subscription status, exam progress, and account settings.',
    target: '[data-tour="nav-profile"]',
    route: '/',
    href: '/profile',
    openNavOnMobile: true,
  },
  {
    id: 'contact-nav',
    title: 'Contact',
    sectionLabel: 'Top menu → Contact',
    description:
      'Questions, feedback, or support — use Contact to send us a message and we will get back to you.',
    target: '[data-tour="nav-contact"]',
    route: '/',
    href: '/contact',
    openNavOnMobile: true,
  },
  {
    id: 'pricing-nav',
    title: 'Pricing',
    sectionLabel: 'Top menu → Pricing',
    description:
      'Compare plans and upgrades. See what your subscription includes and options to unlock more practice features.',
    target: '[data-tour="nav-pricing"]',
    route: '/',
    href: '/precios',
    openNavOnMobile: true,
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

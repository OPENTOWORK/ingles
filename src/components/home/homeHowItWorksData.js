/** Level hub used for in-tour demos (exam mode + skills visible for students). */
export const GUIDED_TOUR_LEVEL_PATH = '/niveles/b2';

/** Registered-user guided tour: spotlight targets + routes. */
export const GUIDED_TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'How it works',
    sectionLabel: 'Home',
    description:
      'A quick walkthrough of Theory, Exam theory, Levels (skills, tips, exam mode), and the placement test. Use Next to jump to each area.',
  },
  {
    id: 'theory-nav',
    title: 'Theory',
    sectionLabel: 'Top menu → Theory',
    description:
      'Click Theory in the menu to open the study hub. There you work through Grammar, Vocabulary and Pronunciation before exam-style tasks.',
    target: '[data-tour="nav-theory"]',
    href: '/teoria',
    openNavOnMobile: true,
  },
  {
    id: 'theory-hub',
    title: 'Theory sections',
    sectionLabel: 'Theory page → skill areas',
    description:
      'On this page, open a card (Grammar, Vocabulary or Pronunciation), then pick topics inside. Finish a section to unlock the next one.',
    target: '[data-tour="theory-sections"]',
    route: '/teoria',
    scrollTarget: true,
  },
  {
    id: 'exam-theory',
    title: 'Exam theory',
    sectionLabel: 'Levels → Exam theory block',
    description:
      'On the Levels page, each card is an exam skill (Use of English, Reading, Listening, Writing, Speaking). Study a unit here, then practise the matching tasks inside your level.',
    target: '#exam-theory',
    route: '/niveles#exam-theory',
    scrollTarget: true,
  },
  {
    id: 'levels-practice',
    title: 'Choose your level',
    sectionLabel: 'Levels → CEFR grid',
    description:
      'Pick the card for your target exam (A2–C2). You open that level\'s hub with mock papers, part-by-part tips, and exam mode.',
    target: '[data-tour="niveles-levels"]',
    route: '/niveles',
    scrollTarget: true,
  },
  {
    id: 'levels-hub',
    title: 'Inside a level',
    sectionLabel: 'Level hub',
    description:
      'This is the hub for one CEFR level (here B2 as an example). Use the breadcrumb to return to all levels. Everything below is practice for this exam.',
    target: '[data-tour="level-hub-hero"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    href: GUIDED_TOUR_LEVEL_PATH,
  },
  {
    id: 'levels-exam-practice',
    title: 'Exam Practice',
    sectionLabel: 'Level hub → Exam Practice',
    description:
      'Timed mock papers by skill: Reading and Use of English, Writing, Listening, and Speaking. Open one paper to practise that skill under exam-style conditions.',
    target: '[data-tour="level-exam-practice"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
  },
  {
    id: 'levels-exam-mode',
    title: 'Exam mode',
    sectionLabel: 'Exam Practice → Exam mode',
    description:
      'Click Exam mode for a full simulation: sections run in order with a countdown, no help until you finish, then a results page with your score per paper.',
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
      'Each block matches an exam skill (Use of English, Reading, Writing, Listening, Speaking). Open a part for interactive tips — task format, timing, and strategies — before doing the exercises.',
    target: '[data-tour="level-skills-sections"]',
    route: GUIDED_TOUR_LEVEL_PATH,
    scrollTarget: true,
    /** Tall target at page bottom — keep the dialog centred so it stays fully visible. */
    cardPlacement: 'center',
  },
  {
    id: 'placement-nav',
    title: 'Placement test',
    sectionLabel: 'Top menu → Placement Test',
    description:
      'Not sure where to start? Click Placement Test in the menu. Your result recommends a CEFR level and unlocks the right practice path.',
    target: '[data-tour="nav-placement"]',
    href: '/prueba-nivel',
    openNavOnMobile: true,
  },
];

import { APP_ROUTES } from '@/config/appRoutes';
import { QUIZ_GAME_QUESTION_COUNT, QUIZ_GAME_SECONDS } from '@/lib/quizGame';
import { TRAINING_LIFE_REGEN_HOURS, TRAINING_LIVES_MAX } from '@/lib/trainingLives';
import { TRAINING_UNLOCK_STARS } from '@/lib/trainingPathUnlock';
import { TRAINING_CEFR_OPTIONS, TRAINING_DIFFICULTY_OPTIONS } from '@/utils/trainingStarsProgress';

const EXAM_PRACTICE_HUB = `${APP_ROUTES.examPracticeDefaultLevel}/`;
const TRAINING_HOME = '/training/';
const NAV_COLLAPSED_MQ = '(max-width: 900px)';

const cefrRange = `${TRAINING_CEFR_OPTIONS[0].label} a ${TRAINING_CEFR_OPTIONS[TRAINING_CEFR_OPTIONS.length - 1].label}`;
const difficultyList = new Intl.ListFormat('es', { type: 'disjunction' }).format(
  TRAINING_DIFFICULTY_OPTIONS.map((option) => option.label),
);

/**
 * `target`: selectores en orden de preferencia; se destaca el primero visible.
 * `route`: página donde vive el destacado. `include`: hijos que también entran
 * en el foco. `reveal`: abre el desplegable del destacado durante el paso.
 * `mobile`: cambios cuando el menú está plegado. `media`: el paso solo existe
 * en las pantallas donde se ve su destacado.
 */
export const TUTORIAL_STEPS = [
  {
    id: 'bienvenida',
    eyebrow: 'Tutorial',
    title: 'Te damos la bienvenida a Dralo',
    body: 'En un minuto te enseñamos a sacarle partido a la práctica: exámenes B2 por partes, writing con corrección, listening, el quiz y el training de gramática.',
    mascot: 'clap',
    nextLabel: 'Empezar',
    skipLabel: 'Ahora no',
  },
  {
    id: 'menu-practice',
    eyebrow: 'Menú',
    title: 'Todo empieza en Practice',
    body: 'Desde aquí entras a las dos zonas de práctica: Exam Practice, con exámenes tipo B2 First, y Training Practice, un camino de gramática por niveles.',
    target: '.app-nav--desktop [data-tour="nav-levels"]',
    include: '.app-nav__dropdown',
    reveal: true,
    padding: 8,
    mobile: {
      target: ['.app-nav__toggle', '.app-side-menu__tab'],
      include: null,
      reveal: false,
      body: 'Abre el menú y entra en Practice. Ahí están las dos zonas de práctica: Exam Practice, con exámenes tipo B2 First, y Training Practice, un camino de gramática por niveles.',
    },
  },
  {
    id: 'exam-practice',
    eyebrow: 'Exam Practice',
    title: 'Tu zona de examen B2',
    body: 'Aquí preparas el B2 First skill a skill. Elige una tarjeta, practica y comprueba tus respuestas al momento.',
    route: EXAM_PRACTICE_HUB,
    target: [
      '[data-tour="level-exam-practice"] .exam-practice-hub__skills-grid',
      '[data-tour="level-exam-practice"]',
    ],
    placement: 'top',
  },
  {
    id: 'reading',
    eyebrow: 'Exam Practice',
    title: 'Reading and Use of English',
    body: 'Las 7 partes del examen, una a una. Cada parte tiene varios tests que se abren en orden: consigue al menos una estrella en uno para desbloquear el siguiente.',
    route: EXAM_PRACTICE_HUB,
    target: '[data-tour="practice-reading"]',
  },
  {
    id: 'writing',
    eyebrow: 'Exam Practice',
    title: 'Writing',
    body: 'Escribe tu essay, email, artículo, informe o review y pulsa «Check with Dralo»: te devuelve una puntuación y comentarios para mejorar.',
    route: EXAM_PRACTICE_HUB,
    target: '[data-tour="practice-writing"]',
  },
  {
    id: 'listening',
    eyebrow: 'Exam Practice',
    title: 'Listening',
    body: 'Audios como los del examen, en sus 4 partes. Mientras practicas puedes pausar y repetir el audio, y ves al instante si has acertado.',
    route: EXAM_PRACTICE_HUB,
    target: '[data-tour="practice-listening"]',
  },
  {
    id: 'quiz',
    eyebrow: 'Exam Practice',
    title: 'Quiz game',
    body: `${QUIZ_GAME_QUESTION_COUNT} preguntas contrarreloj, ${QUIZ_GAME_SECONDS} segundos cada una. Cuanto antes aciertes, más puntos, y las rachas suman extra. Perfecto para repasar en pocos minutos.`,
    route: EXAM_PRACTICE_HUB,
    target: '[data-tour="practice-quiz"]',
  },
  {
    id: 'exam-mode',
    eyebrow: 'Exam Practice',
    title: 'Exam mode',
    body: 'El simulacro completo: haces el examen entero con los tiempos oficiales y ves tus resultados al final, como el día del examen.',
    route: EXAM_PRACTICE_HUB,
    target: '[data-tour="practice-exam-mode"]',
    media: '(min-width: 640px)',
  },
  {
    id: 'training',
    eyebrow: 'Training Practice',
    title: 'Gramática paso a paso',
    body: `Un camino de niveles en orden: cada uno trabaja un punto de gramática y con ${TRAINING_UNLOCK_STARS} estrellas desbloqueas el siguiente. Empieza por el nivel marcado.`,
    route: TRAINING_HOME,
    target: [
      '[data-tour="training-path"] [aria-current="step"]',
      '[data-tour="training-path"] [data-path-station]',
    ],
    include: '[data-station-tag]',
    padding: 12,
  },
  {
    id: 'training-filters',
    eyebrow: 'Training Practice',
    title: 'Tu nivel y tu dificultad',
    body: `Elige el nivel, de ${cefrRange}, y la dificultad: ${difficultyList}. Cada combinación tiene su propio camino y guarda tu progreso.`,
    route: TRAINING_HOME,
    target: '[data-tour="training-filters"]',
  },
  {
    id: 'training-lives',
    eyebrow: 'Training Practice',
    title: 'Tus vidas',
    body: `Los corazones son tus vidas. En el plan gratuito tienes ${TRAINING_LIVES_MAX}: cada fallo gasta una y recuperas una cada ${TRAINING_LIFE_REGEN_HOURS} horas. En Plus y Premium son ilimitadas. El quiz tiene sus propias vidas, con las mismas reglas.`,
    route: TRAINING_HOME,
    target: '[data-tour="training-lives"]',
  },
  {
    id: 'final',
    eyebrow: 'Tutorial',
    title: '¡Listo para empezar!',
    body: 'Ya conoces la zona de práctica. En Exam Strategies tienes consejos para cada parte del examen y en Profile sigues tu progreso. Puedes repetir este tutorial cuando quieras desde el botón Tutorial de la página de inicio.',
    mascot: 'cheer',
    skipLabel: 'Cerrar',
    cta: { label: 'Empezar a practicar', href: `${APP_ROUTES.examPracticeStudentEntry}/` },
    mobile: {
      body: 'Ya conoces la zona de práctica. En Exam Strategies tienes consejos para cada parte del examen y en Profile sigues tu progreso. Puedes repetir este tutorial cuando quieras desde Tutorial, en el menú de la página de inicio.',
    },
  },
];

/** La barra de escritorio también se pliega en pantallas anchas cuando no cabe entera (AppNav). */
function isDesktopNavCollapsed() {
  const desktopNav = document.querySelector('.app-nav--desktop');
  if (!desktopNav) return window.matchMedia(NAV_COLLAPSED_MQ).matches;
  return window.getComputedStyle(desktopNav).display === 'none';
}

/** Pasos para la pantalla actual: con el menú plegado se señala el botón del menú. */
export function resolveTutorialSteps() {
  if (typeof window === 'undefined') return TUTORIAL_STEPS;
  const navCollapsed = isDesktopNavCollapsed();
  return TUTORIAL_STEPS.filter((step) => !step.media || window.matchMedia(step.media).matches).map(
    ({ mobile, ...step }) => (navCollapsed && mobile ? { ...step, ...mobile } : step),
  );
}

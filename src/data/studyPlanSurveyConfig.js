/** Configuración de la encuesta «Plan de objetivos» (alumno tras placement). */

export const STUDY_PLAN_GOALS = [
  { id: 'travel', name: 'Viajar y comunicarme' },
  { id: 'work', name: 'Inglés profesional' },
  { id: 'study', name: 'Estudios académicos' },
  { id: 'exam', name: 'Aprobar examen Cambridge' },
  { id: 'conversation', name: 'Conversación fluida' },
  { id: 'hobby', name: 'Aprendizaje personal' },
];

export const STUDY_PLAN_SKILLS = [
  { id: 'listening', name: 'Listening' },
  { id: 'reading', name: 'Reading' },
  { id: 'writing', name: 'Writing' },
  { id: 'speaking', name: 'Speaking' },
  { id: 'use_of_english', name: 'Use of English / Grammar' },
  { id: 'vocabulary', name: 'Vocabulary' },
];

export const STUDY_PLAN_HOUR_OPTIONS = [
  { value: 3, label: '3 h', hint: 'Ritmo ligero' },
  { value: 5, label: '5 h', hint: 'Recomendado mínimo' },
  { value: 7, label: '7 h', hint: '1 h al día' },
  { value: 10, label: '10 h', hint: 'Intensivo' },
  { value: 15, label: '15 h', hint: 'Muy intensivo' },
  { value: 20, label: '20+ h', hint: 'Preparación total' },
];

export const STUDY_PLAN_SURVEY_STEPS = [
  {
    id: 'goals',
    title: '¿Qué quieres lograr?',
    desc: 'Elige uno o más objetivos con tu inglés.',
  },
  {
    id: 'hours',
    title: 'Tiempo real de estudio',
    desc: '¿Cuántas horas puedes dedicar cada semana de forma realista?',
  },
  {
    id: 'exam',
    title: 'Fecha del examen',
    desc: '¿Cuándo te gustaría presentarte al examen? (aproximado)',
  },
  {
    id: 'strengths',
    title: 'Tus fortalezas',
    desc: '¿En qué habilidades te sientes más cómodo/a?',
  },
  {
    id: 'weaknesses',
    title: 'Áreas a mejorar',
    desc: '¿Qué habilidades quieres priorizar en tu plan?',
  },
  {
    id: 'notes',
    title: 'Algo más',
    desc: 'Horarios, restricciones o comentarios (opcional).',
  },
];

/** Study plan survey config (student flow after placement test). */

export const STUDY_PLAN_GOALS = [
  { id: 'travel', name: 'Viajar y comunicarme' },
  { id: 'work', name: 'Inglés profesional' },
  { id: 'study', name: 'Estudios académicos' },
  { id: 'exam', name: 'Aprobar un examen de Cambridge' },
  { id: 'conversation', name: 'Conversación fluida' },
  { id: 'hobby', name: 'Aprendizaje personal' },
];

export const STUDY_PLAN_SKILLS = [
  { id: 'listening', name: 'Comprensión oral' },
  { id: 'reading', name: 'Comprensión lectora' },
  { id: 'writing', name: 'Expresión escrita' },
  { id: 'speaking', name: 'Expresión oral' },
  { id: 'use_of_english', name: 'Gramática (Use of English)' },
  { id: 'vocabulary', name: 'Vocabulario' },
];

export const STUDY_PLAN_HOUR_OPTIONS = [
  { value: 3, label: '3 h', hint: 'Ritmo suave' },
  { value: 5, label: '5 h', hint: 'Mínimo recomendado' },
  { value: 7, label: '7 h', hint: '1 h al día' },
  { value: 10, label: '10 h', hint: 'Intensivo' },
  { value: 15, label: '15 h', hint: 'Muy intensivo' },
  { value: 20, label: '20+ h', hint: 'Preparación completa' },
];

export const STUDY_PLAN_SURVEY_STEPS = [
  {
    id: 'goals',
    title: '¿Qué quieres conseguir?',
    desc: 'Elige uno o más objetivos para tu inglés.',
  },
  {
    id: 'hours',
    title: 'Tiempo real de estudio',
    desc: '¿Cuántas horas puedes dedicar de verdad cada semana?',
  },
  {
    id: 'exam',
    title: 'Fecha del examen',
    desc: '¿Cuándo te gustaría presentarte al examen? (aproximada)',
  },
  {
    id: 'strengths',
    title: 'Tus puntos fuertes',
    desc: '¿Con qué habilidades te sientes más cómodo?',
  },
  {
    id: 'weaknesses',
    title: 'Áreas a mejorar',
    desc: '¿Qué habilidades quieres priorizar en tu plan?',
  },
  {
    id: 'notes',
    title: 'Algo más',
    desc: 'Horarios, limitaciones o comentarios (opcional).',
  },
];

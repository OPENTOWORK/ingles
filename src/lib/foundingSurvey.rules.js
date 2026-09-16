import { FIRST_AUTO_SLOT, MAX_FOUNDING_SLOT } from '@/lib/foundingMemberPlus.rules';

/** Días desde el alta hasta que se envía la encuesta. */
export const FOUNDING_SURVEY_DELAY_DAYS = 30;

/** Días que tiene el alumno para responder antes de perder el Plan Plus. */
export const FOUNDING_SURVEY_RESPONSE_DAYS = 7;

/** Días desde el envío hasta el recordatorio (a falta de 2 para el cierre). */
export const FOUNDING_SURVEY_REMINDER_DAYS = 5;

/** Cupos que reciben encuesta: 2–50 (el 1 es reserva manual). */
export const FOUNDING_SURVEY_ELIGIBLE_SLOTS = MAX_FOUNDING_SLOT - FIRST_AUTO_SLOT + 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Formulario de los 30 días: 10 preguntas sobre qué les parece la web y qué
 * se puede mejorar. Nueve cerradas (rápidas de responder y comparables entre
 * alumnos) y la última abierta. Responder consolida el Plan Plus de por vida;
 * no responder en plazo lo revoca.
 */
export const FOUNDING_SURVEY_QUESTIONS = [
  {
    id: 'valoracion_general',
    type: 'scale',
    label: '1. En general, ¿qué nota le pones a Dralo?',
    min: 1,
    max: 5,
    minLabel: 'Muy mal',
    maxLabel: 'Excelente',
    required: true,
  },
  {
    id: 'facilidad_uso',
    type: 'scale',
    label: '2. ¿Qué tal te resulta moverte por la web y encontrar lo que buscas?',
    min: 1,
    max: 5,
    minLabel: 'Me pierdo',
    maxLabel: 'Muy fácil',
    required: true,
  },
  {
    id: 'diseno',
    type: 'scale',
    label: '3. ¿Y el diseño y el aspecto visual?',
    min: 1,
    max: 5,
    minLabel: 'Mejorable',
    maxLabel: 'Me encanta',
    required: true,
  },
  {
    id: 'calidad_ejercicios',
    type: 'scale',
    label: '4. La calidad de los ejercicios y los simulacros de examen',
    min: 1,
    max: 5,
    minLabel: 'Floja',
    maxLabel: 'Muy buena',
    required: true,
  },
  {
    id: 'rendimiento',
    type: 'scale',
    label: '5. La velocidad de la web: ¿carga rápido o se te atasca?',
    min: 1,
    max: 5,
    minLabel: 'Va lenta',
    maxLabel: 'Va fina',
    required: true,
  },
  {
    id: 'utilidad_ia',
    type: 'choice',
    label: '6. Las correcciones y el feedback de la IA (writing, speaking, Dralo AI)',
    options: ['Muy útiles', 'Útiles', 'Regular', 'Poco útiles', 'No las he usado todavía'],
    required: true,
  },
  {
    id: 'recomendacion',
    type: 'scale',
    label: '7. ¿Recomendarías Dralo a alguien que prepara un examen?',
    min: 0,
    max: 10,
    minLabel: 'Nada probable',
    maxLabel: 'Segurísimo',
    required: true,
  },
  {
    id: 'mejor_parte',
    type: 'choice',
    label: '8. ¿Qué es lo que más te gusta de Dralo?',
    options: [
      'Exam practice',
      'Exam strategies (teoría)',
      'Writing Correction',
      'Speaking',
      'Dralo AI',
      'Seguimiento de progreso',
    ],
    required: true,
  },
  {
    id: 'prioridad_mejora',
    type: 'choice',
    label: '9. Si solo pudiéramos mejorar una cosa este mes, ¿cuál elegirías?',
    options: [
      'Más ejercicios y más variedad',
      'Más simulacros de examen completos',
      'Mejores correcciones y feedback',
      'Que la web vaya más rápida',
      'Un diseño más claro y fácil de usar',
      'Ver mejor mi progreso y mis fallos',
      'Más contenido de speaking',
    ],
    required: true,
  },
  {
    id: 'mejorarias',
    type: 'text',
    label:
      '10. Cuéntanoslo con tus palabras: ¿qué cambiarías, quitarías o añadirías? Sé todo lo sincero que quieras, las críticas nos sirven más que los elogios.',
    maxLength: 1000,
    required: true,
  },
];

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ¿Han pasado ya 30 días desde que se concedió el cupo? */
export function isSurveyDue(grantedAt, now = new Date()) {
  const granted = toDate(grantedAt);
  if (!granted) return false;
  return now.getTime() - granted.getTime() >= FOUNDING_SURVEY_DELAY_DAYS * DAY_MS;
}

/** Fecha límite para responder (envío + 7 días). */
export function computeSurveyDeadline(sentAt) {
  const sent = toDate(sentAt);
  if (!sent) return null;
  return new Date(sent.getTime() + FOUNDING_SURVEY_RESPONSE_DAYS * DAY_MS);
}

/** Momento del recordatorio (envío + 5 días). */
export function computeSurveyReminderAt(sentAt) {
  const sent = toDate(sentAt);
  if (!sent) return null;
  return new Date(sent.getTime() + FOUNDING_SURVEY_REMINDER_DAYS * DAY_MS);
}

/** Días completos que le quedan al alumno para responder. */
export function daysLeftToAnswer(row, now = new Date()) {
  const deadline = toDate(row?.vence_en);
  if (!deadline) return null;
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS));
}

/** Encuesta sin responder cuyo plazo ya venció y sigue sin revocar. */
export function isSurveyExpired(row, now = new Date()) {
  if (!row || row.respondida_en || row.plan_revocado_en) return false;
  const deadline = toDate(row.vence_en);
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}

/** Encuesta pendiente que ya toca recordar (y aún no ha vencido). */
export function needsReminder(row, now = new Date()) {
  if (!row || row.respondida_en || row.plan_revocado_en || row.recordatorio_enviado_en) {
    return false;
  }
  const reminderAt = computeSurveyReminderAt(row.enviada_en);
  if (!reminderAt) return false;
  return now.getTime() >= reminderAt.getTime() && !isSurveyExpired(row, now);
}

/** Estado de una encuesta para panel y formulario. */
export function getSurveyState(row, now = new Date()) {
  if (!row) return 'inexistente';
  if (row.respondida_en) return 'respondida';
  if (row.plan_revocado_en) return 'revocada';
  if (isSurveyExpired(row, now)) return 'vencida';
  return 'pendiente';
}

function isBlank(value) {
  return value == null || String(value).trim() === '';
}

/**
 * Valida y normaliza las respuestas del formulario.
 * @returns {{ ok: true, answers: Record<string, unknown> } | { ok: false, errors: Record<string, string> }}
 */
export function validateSurveyAnswers(rawAnswers) {
  const input = rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};
  /** @type {Record<string, string>} */
  const errors = {};
  /** @type {Record<string, unknown>} */
  const answers = {};

  for (const question of FOUNDING_SURVEY_QUESTIONS) {
    const value = input[question.id];

    if (isBlank(value)) {
      if (question.required) errors[question.id] = 'Esta pregunta es obligatoria.';
      continue;
    }

    if (question.type === 'scale') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < question.min || num > question.max) {
        errors[question.id] = `Elige un valor entre ${question.min} y ${question.max}.`;
        continue;
      }
      answers[question.id] = num;
      continue;
    }

    if (question.type === 'choice') {
      const text = String(value);
      if (!question.options.includes(text)) {
        errors[question.id] = 'Elige una de las opciones disponibles.';
        continue;
      }
      answers[question.id] = text;
      continue;
    }

    const text = String(value).trim();
    if (text.length > question.maxLength) {
      errors[question.id] = `Máximo ${question.maxLength} caracteres.`;
      continue;
    }
    answers[question.id] = text;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, answers };
}

/**
 * Resumen de la campaña. Se da por finalizada cuando los 50 cupos están
 * ocupados y ninguna encuesta sigue pendiente de respuesta.
 */
export function summarizeFoundingSurveyCampaign(
  surveys,
  { claimedSlots = 0 } = {},
  now = new Date(),
) {
  const rows = surveys || [];
  let respondidas = 0;
  let revocadas = 0;
  let pendientes = 0;
  let vencidas = 0;

  for (const row of rows) {
    const state = getSurveyState(row, now);
    if (state === 'respondida') respondidas += 1;
    else if (state === 'revocada') revocadas += 1;
    else if (state === 'vencida') vencidas += 1;
    else pendientes += 1;
  }

  const allSlotsClaimed = Number(claimedSlots) >= MAX_FOUNDING_SLOT;
  const enviadas = rows.length;
  const sinResolver = pendientes + vencidas;
  const finished =
    allSlotsClaimed && enviadas >= FOUNDING_SURVEY_ELIGIBLE_SLOTS && sinResolver === 0;

  return {
    enviadas,
    respondidas,
    revocadas,
    pendientes,
    vencidas,
    elegibles: FOUNDING_SURVEY_ELIGIBLE_SLOTS,
    claimedSlots: Number(claimedSlots) || 0,
    allSlotsClaimed,
    finished,
  };
}

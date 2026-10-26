import { getWeeklyChallenge, madridWeekday } from '@/data/weeklyTrainingChallenges';

/** De martes a domingo. El lunes ya es la víspera del reto siguiente. */
const MAIL_DAYS = new Set(['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

/** Tope por ejecución del cron, para no alargar la petición. */
export const WEEKLY_CHALLENGE_SEND_CAP = 40;

export function isWeeklyChallengeMailDay(date = new Date()) {
  return MAIL_DAYS.has(madridWeekday(date));
}

/**
 * Datos del correo de esa semana. La solución y la letra correcta no salen de aquí.
 * @param {Date} [date]
 * @param {string} [origin]
 */
export function buildWeeklyChallengeEmailVariables(date = new Date(), origin = 'https://www.dralo.es') {
  const challenge = getWeeklyChallenge(date);
  const base = String(origin || 'https://www.dralo.es').replace(/\/$/, '');
  return {
    challenge_since: challenge.since,
    challenge_prompt: challenge.prompt,
    challenge_options: challenge.options.map((option) => {
      const url = new URL(`${base}/training/`);
      url.searchParams.set('challenge_week', challenge.weekId);
      url.searchParams.set('challenge_id', challenge.id);
      url.searchParams.set('answer', option.id);
      return `${option.id}) ${option.label}\n${url.toString()}`;
    }).join('\n'),
    challenge_url: `${base}/training/`,
  };
}


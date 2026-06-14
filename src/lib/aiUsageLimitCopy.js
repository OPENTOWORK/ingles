/** User-facing copy for AI daily limits (alpha release). */

export function writingLimitLabel(limit, { lang = 'en', remaining, used } = {}) {
  let suffix = '';
  if (remaining != null) {
    suffix = lang === 'es' ? ` (quedan ${remaining} hoy)` : ` (${remaining} left today)`;
  } else if (used != null && limit != null) {
    suffix = lang === 'es' ? ` (${used}/${limit} usadas hoy)` : ` (${used}/${limit} used today)`;
  }
  if (lang === 'es') {
    return `Alpha: ${limit} correcciones de writing de examen al día.${suffix}`;
  }
  return `Alpha: ${limit} exam writing corrections per day.${suffix}`;
}

export function speakingLimitLabel(limit = 3, lang = 'en') {
  return lang === 'es'
    ? `Alpha: ${limit} feedbacks de speaking de examen al día.`
    : `Alpha: ${limit} speaking exam feedbacks per day.`;
}

export const LIMIT_REACHED = {
  writing: {
    en: "You've reached today's alpha limit for exam writing corrections. Come back tomorrow to keep practising.",
    es: 'Has alcanzado el límite alpha de hoy para correcciones de writing de examen. Vuelve mañana para seguir practicando.',
  },
  speaking: {
    en: "You've reached today's alpha limit for speaking exam feedbacks. Come back tomorrow to keep practising.",
    es: 'Has alcanzado el límite alpha de hoy para feedbacks de speaking de examen. Vuelve mañana para seguir practicando.',
  },
  generic: {
    en: "You've reached today's alpha limit. Come back tomorrow to keep practising.",
    es: 'Has alcanzado el límite alpha de hoy. Vuelve mañana para seguir practicando.',
  },
};

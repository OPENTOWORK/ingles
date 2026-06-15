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

/** Normalize /api/ai/usage-status speaking payload for UI state. */
export function resolveSpeakingUsageDisplay(status, { lang = 'en', fallbackLimit = 3 } = {}) {
  if (!status) {
    return {
      unlimited: false,
      limit: fallbackLimit,
      used: null,
      remaining: null,
      atLimit: false,
      hint: speakingLimitLabel(fallbackLimit, { lang }),
    };
  }

  if (status.unlimited) {
    return {
      unlimited: true,
      limit: null,
      used: null,
      remaining: null,
      atLimit: false,
      hint: '',
    };
  }

  if (status.unavailable) {
    const limit = status.limit ?? fallbackLimit;
    return {
      unlimited: false,
      limit,
      used: status.used ?? null,
      remaining: null,
      atLimit: false,
      hint: speakingLimitLabel(limit, { lang }),
    };
  }

  const limit = status.limit ?? fallbackLimit;
  const used = status.used ?? 0;
  const remaining = status.remaining ?? Math.max(0, limit - used);
  const atLimit = Boolean(status.atLimit || (limit != null && used >= limit) || remaining <= 0);

  return {
    unlimited: false,
    limit,
    used,
    remaining: atLimit ? 0 : remaining,
    atLimit,
    hint: speakingLimitLabel(limit, {
      lang,
      remaining: atLimit ? 0 : remaining,
      used,
    }),
  };
}

export function speakingLimitLabel(limit = 3, { lang = 'en', remaining, used } = {}) {
  let suffix = '';
  if (remaining != null) {
    suffix = lang === 'es' ? ` (quedan ${remaining} hoy)` : ` (${remaining} left today)`;
  } else if (used != null && limit != null) {
    suffix = lang === 'es' ? ` (${used}/${limit} usadas hoy)` : ` (${used}/${limit} used today)`;
  }
  if (lang === 'es') {
    return `Alpha: ${limit} feedbacks de speaking de examen al día.${suffix}`;
  }
  return `Alpha: ${limit} speaking exam feedbacks per day.${suffix}`;
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

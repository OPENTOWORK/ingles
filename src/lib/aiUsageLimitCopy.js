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
    en: "You've reached your plan's monthly limit for writing corrections. Upgrade your plan or wait until next month.",
    es: 'Has alcanzado el límite mensual de correcciones de writing de tu plan. Mejora tu plan o espera al próximo mes.',
  },
  speaking: {
    en: "You've reached your plan's monthly limit for speaking corrections. Upgrade your plan or wait until next month.",
    es: 'Has alcanzado el límite mensual de correcciones de speaking de tu plan. Mejora tu plan o espera al próximo mes.',
  },
  draloAssistant: {
    en: "You've reached your plan's limit for Dralo Assistant queries. Upgrade your plan for more.",
    es: 'Has alcanzado el límite de consultas a Dralo Assistant de tu plan. Mejora tu plan para obtener más.',
  },
  exam: {
    en: "You've reached your plan's monthly exam limit. Upgrade your plan or wait until next month.",
    es: 'Has alcanzado el límite mensual de exámenes de tu plan. Mejora tu plan o espera al próximo mes.',
  },
  generic: {
    en: "You've reached your plan's usage limit. Upgrade your plan or try again later.",
    es: 'Has alcanzado el límite de uso de tu plan. Mejora tu plan o inténtalo más tarde.',
  },
};

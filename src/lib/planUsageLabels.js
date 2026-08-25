import { PLAN_USAGE_KEYS } from '@/lib/planUsageKeys';

const USAGE_LABELS = {
  [PLAN_USAGE_KEYS.WRITING_CORRECTION]: {
    es: 'Correcciones Writing',
    en: 'Writing corrections',
  },
  [PLAN_USAGE_KEYS.SPEAKING_CORRECTION]: {
    es: 'Correcciones Speaking',
    en: 'Speaking corrections',
  },
  [PLAN_USAGE_KEYS.EXAM_SESSION]: {
    es: 'Exámenes',
    en: 'Exams',
  },
  [PLAN_USAGE_KEYS.DRALO_ASSISTANT]: {
    es: 'Consultas Dralo Assistant',
    en: 'Dralo Assistant queries',
  },
};

function periodLabel(snapshot, lang = 'es') {
  if (snapshot?.periodType === 'day') {
    return lang === 'es' ? 'hoy' : 'today';
  }
  return lang === 'es' ? 'este mes' : 'this month';
}

/** @returns {string | null} */
export function formatPlanUsageLine(usageKey, snapshot, lang = 'es') {
  if (!snapshot || snapshot.unlimited) return null;
  const label = USAGE_LABELS[usageKey]?.[lang] || usageKey;
  const used = snapshot.used ?? 0;
  const limit = snapshot.limit ?? 0;
  const suffix = periodLabel(snapshot, lang);
  if (lang === 'es') {
    return `${label}: ${used}/${limit} ${suffix}`;
  }
  return `${label}: ${used}/${limit} ${suffix}`;
}

/**
 * Structured usage rows for profile UI (progress bars, icons).
 * @returns {Array<{ key: string, label: string, used: number, limit: number, remaining: number, periodLabel: string, atLimit: boolean, percent: number }>}
 */
export function buildPlanUsageItems(usage = {}, lang = 'es') {
  const order = [
    PLAN_USAGE_KEYS.WRITING_CORRECTION,
    PLAN_USAGE_KEYS.SPEAKING_CORRECTION,
    PLAN_USAGE_KEYS.EXAM_SESSION,
    PLAN_USAGE_KEYS.DRALO_ASSISTANT,
  ];

  return order
    .map((key) => {
      const snapshot = usage[key];
      if (!snapshot || snapshot.unlimited) return null;
      const used = Number(snapshot.used) || 0;
      const limit = Number(snapshot.limit) || 0;
      if (limit <= 0) return null;
      const remaining = Math.max(0, limit - used);
      const atLimit = Boolean(snapshot.atLimit || used >= limit);
      const percent = Math.min(100, Math.round((used / limit) * 100));
      return {
        key,
        label: USAGE_LABELS[key]?.[lang] || key,
        used,
        limit,
        remaining,
        periodLabel: periodLabel(snapshot, lang),
        atLimit,
        percent,
      };
    })
    .filter(Boolean);
}

export function buildPlanUsageLines(usage = {}, lang = 'es') {
  const order = [
    PLAN_USAGE_KEYS.WRITING_CORRECTION,
    PLAN_USAGE_KEYS.SPEAKING_CORRECTION,
    PLAN_USAGE_KEYS.EXAM_SESSION,
    PLAN_USAGE_KEYS.DRALO_ASSISTANT,
  ];
  return order
    .map((key) => formatPlanUsageLine(key, usage[key], lang))
    .filter(Boolean);
}

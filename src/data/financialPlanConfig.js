/**
 * Catálogo de suscripciones Dralo (FREE · STARTER · PREMIUM · PRO).
 * Compatible con monetizacion_planes (nombre = slug) y Stripe (stripe_price_id opcional).
 */

export const PLAN_SLUGS = ['free', 'starter', 'premium', 'pro'];

/** @typedef {'free'|'starter'|'premium'|'pro'} PlanSlug */

export const DRALO_SUBSCRIPTION_PLANS = [
  {
    slug: 'free',
    nombre: 'FREE',
    precio: 0,
    precioLabel: '0€',
    duracion_dias: 36500,
    descripcionCorta: 'Empieza a aprender inglés gratis.',
    descripcion:
      'Acceso completo al nivel A2, 1 examen mensual, Placement Test y Dralo AI limitado (3 consultas/día).',
    badge: null,
    badgeVariant: null,
    recommended: false,
    stripe_price_id: null,
    orden: 0,
    activo: true,
    highlights: [
      'Acceso completo al nivel A2',
      '1 examen mensual',
      '3 consultas Dralo AI al día',
      'Placement Test',
      'Seguimiento de progreso básico',
    ],
    entitlements: {
      levels: ['a2'],
      examsPerMonth: 1,
      placementTest: true,
      writingBasic: false,
      writingAdvanced: false,
      speakingCoach: false,
      aiPersonalTutor: false,
      pronunciationCoach: false,
      draloAiDaily: 3,
      progressTracking: 'basic',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'starter',
    nombre: 'STARTER',
    precio: 4.99,
    precioLabel: '4,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'Para estudiantes que quieren progresar de forma constante.',
    descripcion:
      'A2 y B1 completos, exámenes ilimitados en esos niveles, corrección Writing básica y 20 consultas Dralo AI al día.',
    badge: null,
    badgeVariant: null,
    recommended: false,
    stripe_price_id: null,
    orden: 1,
    activo: true,
    highlights: [
      'Acceso completo a A2 y B1',
      'Exámenes ilimitados A2 y B1',
      'Corrección Writing básica',
      '20 consultas Dralo AI al día',
      'Placement Test',
    ],
    entitlements: {
      levels: ['a2', 'b1'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: false,
      speakingCoach: false,
      aiPersonalTutor: false,
      pronunciationCoach: false,
      draloAiDaily: 20,
      progressTracking: 'basic',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'premium',
    nombre: 'PREMIUM',
    precio: 9.99,
    precioLabel: '9,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La opción más popular para preparar exámenes y mejorar rápidamente.',
    descripcion:
      'Todos los niveles A2–C2, exámenes ilimitados, Writing avanzado, Speaking Coach y 60 consultas Dralo AI al día.',
    badge: '🏆 MÁS POPULAR',
    badgeVariant: 'popular',
    recommended: true,
    stripe_price_id: null,
    orden: 2,
    activo: true,
    highlights: [
      'Acceso completo a A2, B1, B2, C1 y C2',
      'Exámenes ilimitados',
      'Corrección avanzada de Writing',
      'Speaking Coach',
      '60 consultas Dralo AI al día',
      'Seguimiento de progreso avanzado',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      aiPersonalTutor: false,
      pronunciationCoach: false,
      draloAiDaily: 60,
      progressTracking: 'advanced',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'pro',
    nombre: 'PRO',
    precio: 14.99,
    precioLabel: '14,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La experiencia más completa con IA avanzada.',
    descripcion:
      'Todo lo de Premium más AI Personal Tutor, Pronunciation Coach y conversaciones ilimitadas con Dralo AI.',
    badge: '🚀 MEJOR VALOR',
    badgeVariant: 'value',
    recommended: false,
    stripe_price_id: null,
    orden: 3,
    activo: true,
    highlights: [
      'Acceso completo a A2, B1, B2, C1 y C2',
      'Exámenes ilimitados',
      'AI Personal Tutor',
      'Pronunciation Coach',
      'Consultas Dralo AI ilimitadas',
      'Seguimiento avanzado y soporte prioritario',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      aiPersonalTutor: true,
      pronunciationCoach: true,
      draloAiDaily: null,
      progressTracking: 'advanced',
      priorityAccess: true,
      prioritySupport: true,
    },
  },
];

/** Filas de la tabla comparativa (✅ / ❌ / texto). */
export const PLAN_COMPARISON_ROWS = [
  { id: 'price', label: 'Precio', type: 'text', values: { free: '0€', starter: '4,99€/mes', premium: '9,99€/mes', pro: '14,99€/mes' } },
  { id: 'a2', label: 'Nivel A2', type: 'bool', values: { free: true, starter: true, premium: true, pro: true } },
  { id: 'b1', label: 'Nivel B1', type: 'bool', values: { free: false, starter: true, premium: true, pro: true } },
  { id: 'b2', label: 'Nivel B2', type: 'bool', values: { free: false, starter: false, premium: true, pro: true } },
  { id: 'c1', label: 'Nivel C1', type: 'bool', values: { free: false, starter: false, premium: true, pro: true } },
  { id: 'c2', label: 'Nivel C2', type: 'bool', values: { free: false, starter: false, premium: true, pro: true } },
  { id: 'placement', label: 'Placement Test', type: 'bool', values: { free: true, starter: true, premium: true, pro: true } },
  {
    id: 'exams',
    label: 'Exámenes mensuales',
    type: 'text',
    values: { free: '1', starter: 'Ilimitados', premium: 'Ilimitados', pro: 'Ilimitados' },
  },
  {
    id: 'writing-basic',
    label: 'Corrección Writing básica',
    type: 'bool',
    values: { free: false, starter: true, premium: true, pro: true },
  },
  {
    id: 'writing-advanced',
    label: 'Corrección Writing avanzada',
    type: 'bool',
    values: { free: false, starter: false, premium: true, pro: true },
  },
  {
    id: 'speaking',
    label: 'Speaking Coach',
    type: 'bool',
    values: { free: false, starter: false, premium: true, pro: true },
  },
  {
    id: 'ai-tutor',
    label: 'AI Personal Tutor',
    type: 'bool',
    values: { free: false, starter: false, premium: false, pro: true },
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation Coach',
    type: 'bool',
    values: { free: false, starter: false, premium: false, pro: true },
  },
  {
    id: 'dralo-ai',
    label: 'Consultas Dralo AI',
    type: 'text',
    values: { free: '3/día', starter: '20/día', premium: '60/día', pro: 'Ilimitadas' },
  },
  {
    id: 'progress',
    label: 'Seguimiento de progreso',
    type: 'text',
    values: { free: 'Básico', starter: 'Básico', premium: 'Avanzado', pro: 'Avanzado' },
  },
  {
    id: 'priority-features',
    label: 'Acceso prioritario a nuevas funciones',
    type: 'bool',
    values: { free: false, starter: false, premium: false, pro: true },
  },
  {
    id: 'priority-support',
    label: 'Soporte prioritario',
    type: 'bool',
    values: { free: false, starter: false, premium: false, pro: true },
  },
];

/** Niveles CEFR para panel admin (derivado de PREMIUM / FREE por plan). */
export const PREMIUM_EXAM_LEVELS = [
  { slug: 'a2', label: 'A2', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'b1', label: 'B1', access: 'starter', note: 'Desde plan STARTER.' },
  { slug: 'b2', label: 'B2', access: 'premium', note: 'Desde plan PREMIUM.' },
  { slug: 'c1', label: 'C1', access: 'premium', note: 'Desde plan PREMIUM.' },
  { slug: 'c2', label: 'C2', access: 'premium', note: 'Desde plan PREMIUM.' },
];

/** Plantillas para monetizacion_planes (seed / sync). */
export const DEFAULT_MONETIZATION_PLANS = DRALO_SUBSCRIPTION_PLANS.map((p) => ({
  nombre: p.nombre,
  slug: p.slug,
  descripcion: p.descripcion,
  descripcion_corta: p.descripcionCorta,
  precio: p.precio,
  duracion_dias: p.duracion_dias,
  activo: p.activo,
  badge: p.badge,
  orden: p.orden,
  stripe_price_id: p.stripe_price_id,
  entitlements: p.entitlements,
}));

/** Nombres legacy a desactivar al sincronizar catálogo. */
export const LEGACY_PLAN_NAMES = [
  'Gratis A2',
  'Premium B2 mensual',
  'Premium B2 anual',
  'Premium C1 mensual',
  'Premium todo acceso',
];

export const SUBSCRIPTION_STATUS_LABELS = {
  activa: 'Activa',
  active: 'Activa',
  cancelada: 'Cancelada',
  cancelled: 'Cancelada',
  pendiente: 'Pendiente',
  pending: 'Pendiente',
  expirada: 'Expirada',
  expired: 'Expirada',
};

export function getPlanBySlug(slug) {
  const s = String(slug || 'free').toLowerCase();
  return DRALO_SUBSCRIPTION_PLANS.find((p) => p.slug === s) || DRALO_SUBSCRIPTION_PLANS[0];
}

export function planSlugFromDbRow(row) {
  if (!row) return 'free';
  const slug = String(row.slug || '').toLowerCase();
  if (PLAN_SLUGS.includes(slug)) return slug;
  const nombre = String(row.nombre || '').trim().toUpperCase();
  const byName = DRALO_SUBSCRIPTION_PLANS.find((p) => p.nombre === nombre);
  return byName?.slug || 'free';
}

/** Mínimo plan slug que desbloquea un nivel CEFR. */
const LEVEL_MIN_PLAN = { a2: 'free', b1: 'starter', b2: 'premium', c1: 'premium', c2: 'premium' };

const PLAN_RANK = { free: 0, starter: 1, premium: 2, pro: 3 };

export function planMeetsMinimum(userSlug, requiredSlug) {
  return (PLAN_RANK[userSlug] ?? 0) >= (PLAN_RANK[requiredSlug] ?? 0);
}

export function isLevelIncludedInPlan(levelSlug, planSlug) {
  const plan = getPlanBySlug(planSlug);
  return plan.entitlements.levels.includes(String(levelSlug || '').toLowerCase());
}

export function minPlanForLevel(levelSlug) {
  return LEVEL_MIN_PLAN[String(levelSlug || '').toLowerCase()] || 'premium';
}

export function authMetadataPlanSlug(subscriptionPlanMeta) {
  const raw = String(subscriptionPlanMeta || 'free').toLowerCase();
  if (PLAN_SLUGS.includes(raw)) return raw;
  if (raw === 'premium') return 'premium';
  return 'free';
}

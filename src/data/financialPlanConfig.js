/**
 * Catálogo de suscripciones Dralo (FREE · PLUS · PREMIUM).
 * Compatible con monetizacion_planes (nombre = slug) y Stripe (stripe_price_id opcional).
 */

export const PLAN_SLUGS = ['free', 'starter', 'premium', 'pro'];

/** @typedef {'free'|'starter'|'premium'|'pro'} PlanSlug */

/** Plan STARTER retirado del catálogo; conservado solo para suscripciones legacy. */
const STARTER_LEGACY_PLAN = {
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
  activo: false,
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
    draloAiDaily: 20,
    writingCorrectionMonthly: 10,
    speakingMissionsDaily: 10,
    progressTracking: 'basic',
    priorityAccess: false,
    prioritySupport: false,
  },
};

export const DRALO_SUBSCRIPTION_PLANS = [
  {
    slug: 'free',
    nombre: 'FREE',
    precio: 0,
    precioLabel: '0€',
    duracion_dias: 36500,
    descripcionCorta: 'Empieza a aprender inglés gratis.',
    descripcion:
      'Acceso a A2, B1 y B2, 1 examen mensual, Writing Correction (3/mes), Speaking Coach (5 misiones/día) y 3 consultas Dralo AI al día.',
    badge: null,
    badgeVariant: null,
    recommended: false,
    stripe_price_id: null,
    orden: 0,
    activo: true,
    highlights: [
      'Acceso completo a A2, B1 y B2',
      '1 examen mensual',
      'Writing Correction: 3/mes',
      'Speaking Coach: 5 misiones/día',
      '3 consultas Dralo AI al día',
      'Placement Test',
      'Seguimiento de progreso básico',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2'],
      examsPerMonth: 1,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: false,
      speakingCoach: true,
      draloAiDaily: 3,
      writingCorrectionMonthly: 3,
      speakingMissionsDaily: 5,
      progressTracking: 'basic',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'premium',
    nombre: 'PLUS',
    precio: 9.99,
    precioLabel: '9,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La opción más popular para preparar exámenes y mejorar rápidamente.',
    descripcion:
      'Todos los niveles A2–C2, 10 exámenes mensuales, Writing Correction (10/mes), Speaking Coach (10 misiones/día) y 30 consultas Dralo AI al día.',
    badge: '🏆 MÁS POPULAR',
    badgeVariant: 'popular',
    recommended: true,
    stripe_price_id: null,
    orden: 1,
    activo: true,
    highlights: [
      'Acceso completo a A2, B1, B2, C1 y C2',
      '10 exámenes mensuales',
      'Writing Correction: 10/mes',
      'Speaking Coach: 10 misiones/día',
      'Corrección avanzada de Writing',
      '30 consultas Dralo AI al día',
      'Seguimiento de progreso avanzado',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: 10,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      draloAiDaily: 30,
      writingCorrectionMonthly: 10,
      speakingMissionsDaily: 10,
      progressTracking: 'advanced',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'pro',
    nombre: 'PREMIUM',
    precio: 14.99,
    precioLabel: '14,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La experiencia más completa para preparar exámenes al máximo nivel.',
    descripcion:
      'Todo lo de Plus con más Writing Correction (20/mes), Speaking Coach (20 misiones/día), 60 consultas Dralo AI al día, exámenes ilimitados y soporte prioritario.',
    badge: '🚀 MEJOR VALOR',
    badgeVariant: 'value',
    recommended: false,
    stripe_price_id: null,
    orden: 2,
    activo: true,
    highlights: [
      'Acceso completo a A2, B1, B2, C1 y C2',
      'Exámenes ilimitados',
      'Writing Correction: 20/mes',
      'Speaking Coach: 20 misiones/día',
      '60 consultas Dralo AI al día',
      'Seguimiento avanzado y soporte prioritario',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      draloAiDaily: 60,
      writingCorrectionMonthly: 20,
      speakingMissionsDaily: 20,
      progressTracking: 'advanced',
      priorityAccess: true,
      prioritySupport: true,
    },
  },
];

/** Filas de la tabla comparativa (✅ / ❌ primero, luego texto). */
export const PLAN_COMPARISON_ROWS = [
  { id: 'price', label: 'Precio', type: 'text', values: { free: '0€', premium: '9,99€/mes', pro: '14,99€/mes' } },
  { id: 'a2', label: 'Nivel A2', type: 'bool', values: { free: true, premium: true, pro: true } },
  { id: 'b1', label: 'Nivel B1', type: 'bool', values: { free: true, premium: true, pro: true } },
  { id: 'b2', label: 'Nivel B2', type: 'bool', values: { free: true, premium: true, pro: true } },
  { id: 'c1', label: 'Nivel C1', type: 'bool', values: { free: false, premium: true, pro: true } },
  { id: 'c2', label: 'Nivel C2', type: 'bool', values: { free: false, premium: true, pro: true } },
  { id: 'placement', label: 'Placement Test', type: 'bool', values: { free: true, premium: true, pro: true } },
  {
    id: 'writing-basic',
    label: 'Corrección Writing básica',
    type: 'bool',
    values: { free: true, premium: true, pro: true },
  },
  {
    id: 'writing-advanced',
    label: 'Corrección Writing avanzada',
    type: 'bool',
    values: { free: false, premium: true, pro: true },
  },
  {
    id: 'priority-features',
    label: 'Acceso prioritario a nuevas funciones',
    type: 'bool',
    values: { free: false, premium: false, pro: true },
  },
  {
    id: 'priority-support',
    label: 'Soporte prioritario',
    type: 'bool',
    values: { free: false, premium: false, pro: true },
  },
  {
    id: 'exams',
    label: 'Exámenes mensuales',
    type: 'text',
    values: { free: '1', premium: '10 exámenes al mes', pro: 'Ilimitados' },
  },
  {
    id: 'writing-correction',
    label: 'Writing Correction',
    type: 'text',
    values: { free: '3/mes', premium: '10/mes', pro: '20/mes' },
  },
  {
    id: 'speaking',
    label: 'Speaking Coach',
    type: 'text',
    values: { free: '5 misiones/día', premium: '10 misiones/día', pro: '20 misiones/día' },
  },
  {
    id: 'dralo-ai',
    label: 'Consultas Dralo AI',
    type: 'text',
    values: { free: '3/día', premium: '30/día', pro: '60/día' },
  },
  {
    id: 'progress',
    label: 'Seguimiento de progreso',
    type: 'text',
    values: { free: 'Básico', premium: 'Avanzado', pro: 'Avanzado' },
  },
];

/** Niveles CEFR para panel admin (derivado de PREMIUM / FREE por plan). */
export const PREMIUM_EXAM_LEVELS = [
  { slug: 'a2', label: 'A2', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'b1', label: 'B1', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'b2', label: 'B2', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'c1', label: 'C1', access: 'premium', note: 'Desde plan PLUS.' },
  { slug: 'c2', label: 'C2', access: 'premium', note: 'Desde plan PLUS.' },
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
  'STARTER',
  'PRO',
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

/** English copy for the profile subscription card (pricing page keeps Spanish). */
const PROFILE_PLAN_DISPLAY = {
  free: {
    descripcionCorta: 'Start learning English for free.',
    highlights: [
      'Full access to A2, B1 and B2',
      '1 exam per month',
      'Writing Correction: 3/month',
      'Speaking Coach: 5 missions/day',
      '3 Dralo AI queries per day',
      'Placement Test',
      'Basic progress tracking',
    ],
    badge: null,
  },
  starter: {
    descripcionCorta: 'For students who want steady progress.',
    highlights: [
      'Full access to A2 and B1',
      'Unlimited A2 and B1 exams',
      'Writing Correction: 10/month',
      'Speaking Coach: 10 missions/day',
      '20 Dralo AI queries per day',
      'Placement Test',
    ],
    badge: null,
  },
  premium: {
    descripcionCorta: 'The most popular option to prepare for exams and improve quickly.',
    highlights: [
      'Full access to A2, B1, B2, C1 and C2',
      '10 exams per month',
      'Writing Correction: 10/month',
      'Speaking Coach: 10 missions/day',
      'Advanced Writing correction',
      '30 Dralo AI queries per day',
      'Advanced progress tracking',
    ],
    badge: 'Most popular',
  },
  pro: {
    descripcionCorta: 'The most complete experience with the highest daily limits.',
    highlights: [
      'Full access to A2, B1, B2, C1 and C2',
      'Unlimited exams',
      'Writing Correction: 20/month',
      'Speaking Coach: 20 missions/day',
      '60 Dralo AI queries per day',
      'Advanced tracking and priority support',
    ],
    badge: 'Best value',
  },
};

export function getPlanProfileDisplay(plan) {
  const slug = plan?.slug || 'free';
  const display = PROFILE_PLAN_DISPLAY[slug] || PROFILE_PLAN_DISPLAY.free;
  return {
    descripcionCorta: display.descripcionCorta,
    highlights: display.highlights,
    badge: display.badge,
  };
}

export function getPlanBySlug(slug) {
  const s = String(slug || 'free').toLowerCase();
  const fromCatalog = DRALO_SUBSCRIPTION_PLANS.find((p) => p.slug === s);
  if (fromCatalog) return fromCatalog;
  if (s === 'starter') return STARTER_LEGACY_PLAN;
  return DRALO_SUBSCRIPTION_PLANS[0];
}

export function planSlugFromDbRow(row) {
  if (!row) return 'free';
  const slug = String(row.slug || '').toLowerCase();
  if (PLAN_SLUGS.includes(slug)) return slug;
  const nombre = String(row.nombre || '').trim().toUpperCase();
  const nameToSlug = {
    FREE: 'free',
    STARTER: 'starter',
    PLUS: 'premium',
    PRO: 'pro',
    PREMIUM: slug === 'pro' ? 'pro' : 'premium',
  };
  if (nameToSlug[nombre]) return nameToSlug[nombre];
  const byName = DRALO_SUBSCRIPTION_PLANS.find((p) => p.nombre === nombre);
  return byName?.slug || 'free';
}

/** Mínimo plan slug que desbloquea un nivel CEFR. */
const LEVEL_MIN_PLAN = { a2: 'free', b1: 'free', b2: 'free', c1: 'premium', c2: 'premium' };

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

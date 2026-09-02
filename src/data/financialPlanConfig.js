/**
 * Catálogo de suscripciones Dralo (FREE · PLUS · PREMIUM).
 * Compatible con monetizacion_planes (nombre = slug) y Stripe (stripe_price_id opcional).
 */

/** Planes públicos / Stripe (checkout). */
export const PLAN_SLUGS = ['free', 'starter', 'premium', 'pro'];

/** Todos los slugs válidos en perfil de usuario. */
export const ALL_USER_PLAN_SLUGS = [
  'free',
  'starter',
  'premium',
  'pro',
  'friendly_plus',
  'friendly_premium',
];

/**
 * Planes que el admin puede asignar desde «Gestionar» (sin Stripe).
 * PLUS/PREMIUM de pago solo vía Stripe.
 */
export const ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS = ['free', 'friendly_plus', 'friendly_premium'];

export const ADMIN_PANEL_ASSIGNABLE_PLAN_OPTIONS = [
  { slug: 'free', label: 'Plan FREE' },
  { slug: 'friendly_plus', label: 'Friendly PLUS' },
  { slug: 'friendly_premium', label: 'Friendly PREMIUM' },
];

/** @deprecated Usar ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS */
export const ADMIN_ASSIGNABLE_PLAN_SLUGS = ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS;

/** @deprecated Usar ADMIN_PANEL_ASSIGNABLE_PLAN_OPTIONS */
export const ADMIN_ASSIGNABLE_PLAN_OPTIONS = ADMIN_PANEL_ASSIGNABLE_PLAN_OPTIONS;

const PLAN_DISPLAY_LABELS = {
  free: 'Plan FREE',
  starter: 'Plan STARTER',
  premium: 'Plan PLUS',
  pro: 'Plan PREMIUM',
  friendly_plus: 'Friendly PLUS',
  friendly_premium: 'Friendly PREMIUM',
};

export function normalizeUserPlanSlug(slug) {
  const raw = String(slug || 'free').toLowerCase();
  return ALL_USER_PLAN_SLUGS.includes(raw) ? raw : 'free';
}

/** Alias histórico: normaliza cualquier slug de plan de usuario. */
export function normalizeAdminAssignablePlanSlug(slug) {
  return normalizeUserPlanSlug(slug);
}

export function getPlanDisplayLabel(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return PLAN_DISPLAY_LABELS[normalized] || normalized;
}

export function isFriendlyPlanSlug(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return normalized === 'friendly_plus' || normalized === 'friendly_premium';
}

export function isStripeManagedPlanSlug(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return normalized === 'premium' || normalized === 'pro';
}

export function isPlusTierPlanSlug(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return normalized === 'premium' || normalized === 'friendly_plus';
}

export function isProTierPlanSlug(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return normalized === 'pro' || normalized === 'friendly_premium';
}

/** @typedef {'free'|'starter'|'premium'|'pro'|'friendly_plus'|'friendly_premium'} PlanSlug */

/** Plan STARTER retirado del catálogo; conservado solo para suscripciones legacy. */
const STARTER_LEGACY_PLAN = {
  slug: 'starter',
  nombre: 'STARTER',
  precio: 4.99,
  precioLabel: '4,99€/mes',
  duracion_dias: 30,
  descripcionCorta: 'Para estudiantes que quieren progresar de forma constante.',
  descripcion:
    'A2 y B1 completos, exámenes ilimitados en esos niveles y 20 consultas Dralo Assistant al día.',
  badge: null,
  badgeVariant: null,
  recommended: false,
  stripe_price_id: null,
  orden: 1,
  activo: false,
  highlights: [
    'Acceso completo a A2 y B1',
    'Exámenes ilimitados A2 y B1',
    '20 consultas Dralo Assistant al día',
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
    speakingCorrectionMonthly: 1,
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
      'Nivel B2 disponible, 1 examen de prueba, Writing Correction (1/mes), Speaking Correction (1/mes) y 3 consultas Dralo Assistant al mes. A2 y B1 próximamente.',
    badge: null,
    badgeVariant: null,
    recommended: false,
    stripe_price_id: null,
    orden: 0,
    activo: true,
    highlights: [
      'Nivel B2',
      'A2 y B1: próximamente',
      '1 examen de prueba',
      'Writing Correction: 1/mes',
      'Speaking Correction: 1/mes',
      '3 consultas Dralo Assistant al mes',
      'Soporte prioritario: hasta 72h',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2'],
      examsPerMonth: 1,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: false,
      speakingCoach: false,
      draloAiDaily: null,
      draloAiMonthly: 3,
      writingCorrectionMonthly: 1,
      speakingCorrectionMonthly: 1,
      speakingMissionsDaily: 0,
      progressTracking: 'none',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'premium',
    nombre: 'PLUS',
    precio: 3.99,
    precioRegular: 7.99,
    precioLista: 9.99,
    precioAnualLanzamiento: 1.99,
    precioAnualRegular: 5.99,
    precioLabel: '3,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La opción más popular para preparar exámenes y mejorar rápidamente.',
    descripcion:
      'Nivel B2, 10 exámenes mensuales, Writing Correction (10/mes), Speaking Correction (10/mes), corrección Writing avanzada y 30 consultas Dralo Assistant al día. A2, B1 y C1 próximamente.',
    badge: '🏆 MÁS POPULAR',
    badgeVariant: 'popular',
    recommended: true,
    stripe_price_id: null,
    orden: 1,
    activo: true,
    highlights: [
      'Nivel B2',
      'A2, B1 y C1: próximamente',
      '10 exámenes mensuales',
      'Writing Correction: 10/mes',
      'Speaking Correction: 10/mes',
      'Corrección Writing avanzada',
      '30 consultas Dralo Assistant al día',
      'Seguimiento de progreso',
      'Soporte prioritario: hasta 48h',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1'],
      examsPerMonth: 10,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: false,
      draloAiDaily: 30,
      writingCorrectionMonthly: 10,
      speakingCorrectionMonthly: 10,
      speakingMissionsDaily: 10,
      progressTracking: 'advanced',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'pro',
    nombre: 'PREMIUM',
    precio: 8.99,
    precioRegular: 14.99,
    precioLista: 17.99,
    precioAnualLanzamiento: 4.99,
    precioAnualRegular: 11.24,
    precioLabel: '8,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La experiencia más completa para preparar exámenes al máximo nivel.',
    descripcion:
      'Todo lo de Plus con exámenes, Writing Correction, Speaking Correction y consultas Dralo Assistant incluidos sin límite, acceso prioritario a nuevas funciones y soporte prioritario (hasta 24h). Speaking Coach próximamente.',
    badge: '🚀 MEJOR VALOR',
    badgeVariant: 'value',
    recommended: false,
    stripe_price_id: null,
    orden: 2,
    activo: true,
    highlights: [
      'Nivel B2',
      'A2, B1 y C1: próximamente',
      'Exámenes mensuales',
      'Writing Correction',
      'Speaking Correction',
      'Corrección Writing avanzada',
      'Speaking Coach: próximamente',
      'Consultas Dralo Assistant',
      'Acceso prioritario a nuevas funciones',
      'Seguimiento de progreso',
      'Soporte prioritario: hasta 24h',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      draloAiDaily: null,
      writingCorrectionMonthly: null,
      speakingCorrectionMonthly: null,
      speakingMissionsDaily: 20,
      progressTracking: 'advanced',
      priorityAccess: true,
      prioritySupport: true,
    },
  },
];

/** Planes gratuitos con mismos permisos que PLUS/PREMIUM; solo asignación admin. */
export const FRIENDLY_GRANT_PLANS = [
  {
    slug: 'friendly_plus',
    nombre: 'FRIENDLY PLUS',
    precio: 0,
    precioLabel: 'Gratuito',
    duracion_dias: 36500,
    descripcionCorta: 'Plan PLUS gratuito (asignación manual, sin Stripe).',
    descripcion:
      'Mismos permisos que Plan PLUS: nivel B2, 10 exámenes mensuales, correcciones y Dralo Assistant. Solo asignable desde el panel de administración.',
    badge: '🤝 FRIENDLY',
    badgeVariant: 'friendly',
    recommended: false,
    stripe_price_id: null,
    orden: 10,
    activo: true,
    adminGrantOnly: true,
    highlights: [
      'Mismos permisos que Plan PLUS',
      'Sin cobro (gestión admin)',
      'No gestionado por Stripe',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1'],
      examsPerMonth: 10,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: false,
      draloAiDaily: 30,
      writingCorrectionMonthly: 10,
      speakingCorrectionMonthly: 10,
      speakingMissionsDaily: 10,
      progressTracking: 'advanced',
      priorityAccess: false,
      prioritySupport: false,
    },
  },
  {
    slug: 'friendly_premium',
    nombre: 'FRIENDLY PREMIUM',
    precio: 0,
    precioLabel: 'Gratuito',
    duracion_dias: 36500,
    descripcionCorta: 'Plan PREMIUM gratuito (asignación manual, sin Stripe).',
    descripcion:
      'Mismos permisos que Plan PREMIUM: catálogo completo, correcciones y Dralo Assistant sin límite práctico. Solo asignable desde el panel de administración.',
    badge: '🤝 FRIENDLY',
    badgeVariant: 'friendly',
    recommended: false,
    stripe_price_id: null,
    orden: 11,
    activo: true,
    adminGrantOnly: true,
    highlights: [
      'Mismos permisos que Plan PREMIUM',
      'Sin cobro (gestión admin)',
      'No gestionado por Stripe',
    ],
    entitlements: {
      levels: ['a2', 'b1', 'b2', 'c1', 'c2'],
      examsPerMonth: null,
      placementTest: true,
      writingBasic: true,
      writingAdvanced: true,
      speakingCoach: true,
      draloAiDaily: null,
      writingCorrectionMonthly: null,
      speakingCorrectionMonthly: null,
      speakingMissionsDaily: 20,
      progressTracking: 'advanced',
      priorityAccess: true,
      prioritySupport: true,
    },
  },
];

/** Valor de celda para funciones anunciadas pero todavía no disponibles. */
export const COMING_SOON = 'coming-soon';

/** Descuento al facturar anualmente (mostrado en /precios y vista previa admin). */
export const ANNUAL_BILLING_DISCOUNT_PERCENT = 25;

/** Etiqueta de marketing para precios promocionales de lanzamiento. */
export const LAUNCH_PRICE_LABEL = 'Precio exclusivo de lanzamiento';

export function planHasLaunchPricing(plan) {
  return Number(plan?.precioRegular) > 0;
}

/** @param {'monthly'|'annual'} billingCycle */
export function getPlanMonthlyPrice(plan, billingCycle = 'monthly') {
  const base = Number(plan?.precio) || 0;
  if (base <= 0) return 0;
  if (billingCycle === 'annual') {
    const annualLaunch = Number(plan?.precioAnualLanzamiento);
    if (annualLaunch > 0) return annualLaunch;
    return base * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
  }
  return base;
}

/** Precios tachados (de mayor a menor) antes del precio de lanzamiento. */
export function getPlanCrossedPrices(plan, billingCycle = 'monthly') {
  const list = Number(plan?.precioLista);
  const regular = Number(plan?.precioRegular);
  if (!(list > 0) || !(regular > 0)) return [];

  if (billingCycle === 'annual') {
    const annualList = list * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
    const annualRegular =
      Number(plan?.precioAnualRegular) > 0
        ? Number(plan.precioAnualRegular)
        : regular * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
    return [annualList, annualRegular].filter((n) => n > 0);
  }

  return [list, regular];
}

/** Precio tachado principal (el más reciente antes del lanzamiento). */
export function getPlanListPrice(plan, billingCycle = 'monthly') {
  const crossed = getPlanCrossedPrices(plan, billingCycle);
  if (crossed.length > 0) return crossed[crossed.length - 1];

  const list = Number(plan?.precioLista);
  if (!(list > 0)) return null;
  if (billingCycle === 'annual') {
    return list * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
  }
  return list;
}

/** % de descuento actual respecto al precio de lista (mismo ciclo de facturación). */
export function getPlanListDiscountPercent(plan, billingCycle = 'monthly') {
  const list = getPlanListPrice(plan, billingCycle);
  const price = getPlanMonthlyPrice(plan, billingCycle);
  if (!list || list <= price) return null;
  return Math.round(((list - price) / list) * 100);
}

/** % de descuento de lanzamiento respecto al precio original más alto (precioLista). */
export function getPlanLaunchDiscountPercent(plan, billingCycle = 'monthly') {
  if (!planHasLaunchPricing(plan)) return null;
  const crossed = getPlanCrossedPrices(plan, billingCycle);
  if (!crossed.length) return null;
  const referenceTotal = crossed[0];
  const price = getPlanMonthlyPrice(plan, billingCycle);
  if (!referenceTotal || referenceTotal <= price) return null;
  return Math.round(((referenceTotal - price) / referenceTotal) * 100);
}

export function formatEuroAmount(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

/** @param {'monthly'|'annual'} billingCycle */
export function formatPlanPriceAmount(plan, billingCycle = 'monthly') {
  const monthly = getPlanMonthlyPrice(plan, billingCycle);
  if (monthly <= 0) return '0€';
  return formatEuroAmount(monthly);
}

/** @param {'monthly'|'annual'} billingCycle */
export function formatPlanPriceLabel(plan, billingCycle = 'monthly') {
  const monthly = getPlanMonthlyPrice(plan, billingCycle);
  if (monthly <= 0) return '0€';
  return `${formatPlanPriceAmount(plan, billingCycle)}/mes`;
}

/** Total anual facturado de una vez (precio mensual con descuento × 12). */
export function formatPlanAnnualTotal(plan) {
  const total = getPlanMonthlyPrice(plan, 'annual') * 12;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(total);
}

/** Filas de la tabla comparativa (✅ / ❌ primero, luego texto). */
export const PLAN_COMPARISON_ROWS = [
  { id: 'price', label: 'Precio', type: 'text', values: { free: '0€', premium: '3,99€/mes', pro: '8,99€/mes' } },
  {
    id: 'a2',
    label: 'Nivel A2',
    type: 'bool',
    values: { free: COMING_SOON, premium: COMING_SOON, pro: COMING_SOON },
  },
  {
    id: 'b1',
    label: 'Nivel B1',
    type: 'bool',
    values: { free: COMING_SOON, premium: COMING_SOON, pro: COMING_SOON },
  },
  { id: 'b2', label: 'Nivel B2', type: 'bool', values: { free: true, premium: true, pro: true } },
  {
    id: 'c1',
    label: 'Nivel C1',
    type: 'bool',
    values: { free: false, premium: COMING_SOON, pro: COMING_SOON },
  },
  {
    id: 'c2',
    label: 'Nivel C2',
    type: 'bool',
    values: { free: false, premium: false, pro: COMING_SOON },
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
    type: 'text',
    values: { free: 'Hasta 72h', premium: 'Hasta 48h', pro: 'Hasta 24h' },
  },
  {
    id: 'exams',
    label: 'Exámenes mensuales',
    type: 'text',
    values: { free: '1', premium: '10 exámenes al mes', pro: true },
  },
  {
    id: 'writing-correction',
    label: 'Writing Correction',
    type: 'text',
    values: { free: '1/mes', premium: '10/mes', pro: true },
  },
  {
    id: 'speaking-correction',
    label: 'Speaking Correction',
    type: 'text',
    values: { free: '1/mes', premium: '10/mes', pro: true },
  },
  {
    id: 'speaking',
    label: 'Dralo AI',
    type: 'text',
    values: { free: false, premium: false, pro: COMING_SOON },
  },
  {
    id: 'exam-strategies',
    label: 'Exam Strategies',
    type: 'text',
    values: { free: false, premium: false, pro: COMING_SOON },
  },
  {
    id: 'dralo-ai',
    label: 'Consultas Dralo Assistant',
    type: 'text',
    values: { free: '3/mes', premium: '30/día', pro: true },
  },
  {
    id: 'progress',
    label: 'Seguimiento de progreso',
    type: 'text',
    values: { free: false, premium: true, pro: true },
  },
];

/** Niveles CEFR para panel admin (derivado de PREMIUM / FREE por plan). */
export const PREMIUM_EXAM_LEVELS = [
  { slug: 'a2', label: 'A2', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'b1', label: 'B1', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'b2', label: 'B2', access: 'free', note: 'Incluido en FREE y todos los planes de pago.' },
  { slug: 'c1', label: 'C1', access: 'premium', note: 'Desde plan PLUS.' },
  { slug: 'c2', label: 'C2', access: 'pro', note: 'Desde plan PREMIUM.' },
];

/** Plantillas para monetizacion_planes (seed / sync). */
export const DEFAULT_MONETIZATION_PLANS = [...DRALO_SUBSCRIPTION_PLANS, ...FRIENDLY_GRANT_PLANS].map((p) => ({
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
      'Level B2',
      'A2 and B1: coming soon',
      '1 trial exam',
      'Writing Correction: 1/month',
      'Speaking Correction: 1/month',
      '3 Dralo Assistant queries per month',
      'Priority support: within 72h',
    ],
    badge: null,
  },
  starter: {
    descripcionCorta: 'For students who want steady progress.',
    highlights: [
      'Full access to A2 and B1',
      'Unlimited A2 and B1 exams',
      'Writing Correction: 10/month',
      'Speaking Correction: 1/month',
      'Speaking Coach: coming soon',
      '20 Dralo Assistant queries per day',
    ],
    badge: null,
  },
  premium: {
    descripcionCorta: 'The most popular option to prepare for exams and improve quickly.',
    highlights: [
      'Level B2',
      'A2, B1 and C1: coming soon',
      '10 exams per month',
      'Writing Correction: 10/month',
      'Speaking Correction: 10/month',
      'Advanced Writing correction',
      '30 Dralo Assistant queries per day',
      'Progress tracking',
      'Priority support: within 48h',
    ],
    badge: 'Most popular',
  },
  pro: {
    descripcionCorta: 'The most complete experience with the highest daily limits.',
    highlights: [
      'Level B2',
      'A2, B1 and C1: coming soon',
      'Monthly exams',
      'Writing Correction',
      'Speaking Correction',
      'Advanced Writing correction',
      'Speaking Coach: coming soon',
      'Dralo Assistant queries',
      'Priority access to new features',
      'Progress tracking',
      'Priority support: within 24h',
    ],
    badge: 'Best value',
  },
  friendly_plus: {
    descripcionCorta: 'Free PLUS-tier access (admin grant, not billed via Stripe).',
    highlights: [
      'Same access as Plan PLUS',
      'Admin-assigned complimentary plan',
    ],
    badge: 'Friendly',
  },
  friendly_premium: {
    descripcionCorta: 'Free PREMIUM-tier access (admin grant, not billed via Stripe).',
    highlights: [
      'Same access as Plan PREMIUM',
      'Admin-assigned complimentary plan',
    ],
    badge: 'Friendly',
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
  const s = normalizeUserPlanSlug(slug);
  const fromCatalog = DRALO_SUBSCRIPTION_PLANS.find((p) => p.slug === s);
  if (fromCatalog) return fromCatalog;
  const fromFriendly = FRIENDLY_GRANT_PLANS.find((p) => p.slug === s);
  if (fromFriendly) return fromFriendly;
  if (s === 'starter') return STARTER_LEGACY_PLAN;
  return DRALO_SUBSCRIPTION_PLANS[0];
}

export function planSlugFromDbRow(row) {
  if (!row) return 'free';
  const slug = String(row.slug || '').toLowerCase();
  if (ALL_USER_PLAN_SLUGS.includes(slug)) return slug;
  const nombre = String(row.nombre || '').trim().toUpperCase();
  const nameToSlug = {
    FREE: 'free',
    STARTER: 'starter',
    PLUS: 'premium',
    PRO: 'pro',
    PREMIUM: slug === 'pro' ? 'pro' : 'premium',
    'FRIENDLY PLUS': 'friendly_plus',
    'FRIENDLY PREMIUM': 'friendly_premium',
  };
  if (nameToSlug[nombre]) return nameToSlug[nombre];
  const byName = DRALO_SUBSCRIPTION_PLANS.find((p) => p.nombre === nombre);
  return byName?.slug || 'free';
}

/** Mínimo plan slug que desbloquea un nivel CEFR. */
const LEVEL_MIN_PLAN = { a2: 'free', b1: 'free', b2: 'free', c1: 'premium', c2: 'pro' };

const PLAN_RANK = {
  free: 0,
  starter: 1,
  premium: 2,
  friendly_plus: 2,
  pro: 3,
  friendly_premium: 3,
};

export function getPlanTierRank(slug) {
  const normalized = String(slug || 'free').toLowerCase();
  return PLAN_RANK[normalized] ?? 0;
}

/** True when the user can start checkout for `targetSlug` (strict upgrade). */
export function canUpgradeToPlan(currentSlug, targetSlug) {
  const current = getPlanTierRank(currentSlug);
  const target = getPlanTierRank(targetSlug);
  if (target <= 0) return false;
  return target > current;
}

export function isCurrentPlanSlug(currentSlug, targetSlug) {
  return getPlanTierRank(currentSlug) === getPlanTierRank(targetSlug);
}

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
  return normalizeUserPlanSlug(subscriptionPlanMeta);
}

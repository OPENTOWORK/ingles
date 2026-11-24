/**
 * Catálogo de suscripciones Dralo (FREE · PLUS). PREMIUM queda fuera del catálogo público.
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

/** Única oferta de precio del Plan Plus. El porcentaje se calcula, no se escribe a mano. */
export const PLUS_PRICE = 3.99;
export const PLUS_ORIGINAL_PRICE = 9.99;
export const PLUS_OFFER_END_DATE = '2026-12-31';
/**
 * TODO: no hay un precio normal distinto definido para el 01/01/2027.
 * Al cerrar la oferta se sigue mostrando PLUS_PRICE, sin tachado ni badge.
 */
export const PLUS_PRICE_AFTER_OFFER = null;
export const PLUS_OFFER_UNTIL_LABEL = '31/12/2026';

/** Nombres públicos de la oferta. El mensual reutiliza PLUS_PRICE. */
export const PLUS_MONTHLY_PRICE = PLUS_PRICE;
export const PLUS_MONTHLY_ORIGINAL_PRICE = PLUS_ORIGINAL_PRICE;
export const PLUS_MONTHLY_OFFER_END = PLUS_OFFER_END_DATE;
export const PLUS_ANNUAL_REGULAR_PRICE = 34.99;
export const PLUS_ANNUAL_BF_PRICE = 19.99;
export const PLUS_ANNUAL_BF_GIFT_MONTHS = 2;
/** Inclusive hasta las 23:59:59 de ese día en Europe/Madrid. */
export const PLUS_ANNUAL_BF_END = '2026-11-30T23:59:59';
export const PLUS_ANNUAL_BF_END_DATE = '2026-11-30';
export const PLUS_YEAR_PRICE = PLUS_ANNUAL_REGULAR_PRICE;
export const PLUS_BLACK_FRIDAY_YEAR_PRICE = PLUS_ANNUAL_BF_PRICE;
export const PLUS_BLACK_FRIDAY_END_DATE = PLUS_ANNUAL_BF_END_DATE;
export const PLUS_BLACK_FRIDAY_UNTIL_LABEL = '30/11/2026';

function plusCents(amount) {
  return Math.round(Number(amount) * 100);
}

function plusEuros(cents) {
  return Math.round(cents) / 100;
}

export function plusTwelveMonthsMonthlyTotal(monthly = PLUS_MONTHLY_PRICE) {
  return plusEuros(plusCents(monthly) * 12);
}

export function plusAnnualRegularSavingsEuros() {
  return plusEuros(plusCents(PLUS_ANNUAL_REGULAR_PRICE) - plusCents(PLUS_ANNUAL_BF_PRICE));
}

export function plusAnnualRegularDiscountPercent() {
  const regular = plusCents(PLUS_ANNUAL_REGULAR_PRICE);
  const promo = plusCents(PLUS_ANNUAL_BF_PRICE);
  if (!(regular > promo)) return null;
  return Math.round(((regular - promo) / regular) * 100);
}

export function plusAnnualSavingsVersusMonthlyEuros() {
  return plusEuros(plusCents(plusTwelveMonthsMonthlyTotal()) - plusCents(PLUS_ANNUAL_BF_PRICE));
}

export function plusBlackFridayEffectiveMonthly() {
  return plusEuros(plusCents(PLUS_ANNUAL_BF_PRICE) / 12);
}

export function plusBlackFridayAccessCopy() {
  return `12 meses de Plus por ${formatEuroAmount(PLUS_ANNUAL_BF_PRICE)}, unos ${formatEuroAmount(plusBlackFridayEffectiveMonthly())} al mes`;
}

export function isBlackFridayOfferActive(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return false;
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return ymd <= PLUS_ANNUAL_BF_END_DATE;
}

export function isPlusOfferActive(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return false;
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return ymd <= PLUS_OFFER_END_DATE;
}

/** Textos y fechas de la barra, la etiqueta y la banda de la home. */
export const HOME_OFFER = {
  blackFriday: {
    endDate: PLUS_ANNUAL_BF_END_DATE,
    text: 'Black Friday: 12 meses de Plan Plus por 19,99 € · hasta el 30/11',
    href: '/precios/?facturacion=anual',
  },
  monthly: {
    endDate: PLUS_OFFER_END_DATE,
    text: 'Plan Plus a 3,99 €/mes · hasta el 31/12',
    href: '/precios/',
  },
};

function madridYmd(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Oferta visible en la home: Black Friday hasta el 30/11, mensual hasta el 31/12, luego ninguna. */
export function activeHomeOffer(now = new Date()) {
  const ymd = madridYmd(now);
  if (!ymd) return null;
  if (ymd <= HOME_OFFER.blackFriday.endDate) return HOME_OFFER.blackFriday;
  if (ymd <= HOME_OFFER.monthly.endDate) return HOME_OFFER.monthly;
  return null;
}

/** Botones del hero. Durante el Black Friday el año es el principal. */
export const HOME_HERO_CTA = {
  blackFriday: {
    primary: { label: 'Quiero el año por 19,99 €', href: '/precios/?facturacion=anual', src: 'hero-anual' },
    secondary: { label: 'Probar DRALO gratis', href: '/registro/', src: 'hero' },
    microcopy: '12 meses por 19,99 € (1,67 €/mes) · Oferta hasta el 30/11',
  },
  standard: {
    primary: { label: 'Probar DRALO gratis', href: '/registro/', src: 'hero' },
    secondary: { label: 'Ver la oferta', href: '/precios/', src: 'hero-oferta' },
    microcopy: 'Sin tarjeta. Empiezas a practicar en un minuto.',
  },
};

export function homeHeroCta(now = new Date()) {
  return isBlackFridayOfferActive(now) ? HOME_HERO_CTA.blackFriday : HOME_HERO_CTA.standard;
}

/** Banda intermedia y cierre. Fuera del Black Friday queda el botón de registro. */
export function homeBandCta(placement, now = new Date()) {
  const freeSrc = placement === 'cierre' ? 'cierre' : 'mid';
  if (!isBlackFridayOfferActive(now)) {
    return {
      primary: { label: 'Probar DRALO gratis', href: '/registro/', src: freeSrc },
      secondary: null,
    };
  }
  return {
    primary: {
      label: 'Quiero el año por 19,99 €',
      href: '/precios/?facturacion=anual',
      src: placement === 'cierre' ? 'cierre-anual' : 'mid-anual',
    },
    secondary: { label: 'Probar DRALO gratis', href: '/registro/', src: freeSrc },
  };
}

/** Avisos del Black Friday dentro de la cuenta, hasta el 30/11 incluido. */
export const BLACK_FRIDAY_APP_PROMO = {
  banner: {
    title: 'Black Friday: 12 meses de Plan Plus por 19,99 €',
    text: 'Corrección de Writing y Speaking, exámenes mensuales y seguimiento de tu progreso durante todo el año. Hasta el 30/11.',
    cta: 'Quiero el año',
    href: '/precios/?facturacion=anual&src=app-banner',
    src: 'app-banner',
  },
  results: {
    title: 'Acabas de practicar. Sigue con todo el año por 19,99 €.',
    text: 'Con el Plan Plus tienes corrección de Writing y Speaking, Training y Quiz sin límite de vidas y seguimiento de tu progreso. Son 1,67 € al mes.',
    cta: 'Quiero el año',
    dismiss: 'Ahora no',
    href: '/precios/?facturacion=anual&src=app-resultados',
    src: 'app-resultados',
  },
};

export function plusOfferDiscountPercent(price = PLUS_PRICE, original = PLUS_ORIGINAL_PRICE) {
  const current = Number(price);
  const list = Number(original);
  if (!(list > current) || current <= 0) return null;
  return Math.round(((list - current) / list) * 100);
}

export const isFounderPriceActive = isPlusOfferActive;
export const LAUNCH_PRICE_LABEL = 'Oferta Plus';

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

/** Seguimiento de estudio monitorizado: planes PLUS y PREMIUM (incl. Friendly). */
export function hasStudySessionPlanAccess(slug) {
  const normalized = normalizeUserPlanSlug(slug);
  return isPlusTierPlanSlug(normalized) || isProTierPlanSlug(normalized);
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
    examStrategies: false,
    trainingLives: null,
    quizLives: null,
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
      'B2: 1 examen de prueba, sin el nivel completo. A2 y B1 próximamente. Sin C1 ni C2. Training con 3 vidas (se recupera 1 cada 10 horas), Quiz con 3 vidas (se recupera 1 cada 10 horas), Writing Correction (1/mes), Speaking Correction (1/mes) y 3 consultas Dralo Assistant al mes.',
    badge: null,
    badgeVariant: null,
    recommended: false,
    stripe_price_id: null,
    orden: 0,
    activo: true,
    highlights: [
      'B2: 1 examen de prueba',
      'A2 y B1: próximamente',
      'Training: 3 vidas (se recupera 1 cada 10 h)',
      'Quiz: 3 vidas (se recupera 1 cada 10 h)',
      'Writing Correction: 1/mes',
      'Speaking Correction: 1/mes',
      '3 consultas Dralo Assistant al mes',
      'Exam Strategies: 1ª parte de cada nivel y skill',
      'Soporte: hasta 72h',
    ],
    excludedHighlights: [
      'B2 completo',
      'Corrección Writing avanzada',
      'Dralo AI',
      'Acceso prioritario a nuevas funciones',
      'Seguimiento de progreso',
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
      examStrategies: true,
      trainingLives: 3,
      trainingLifeRegenHours: 10,
      quizLives: 3,
      quizLifeRegenHours: 10,
    },
  },
  {
    slug: 'premium',
    nombre: 'PLUS',
    precio: PLUS_PRICE,
    precioRegular: 7.99,
    precioLista: PLUS_ORIGINAL_PRICE,
    precioAnualLanzamiento: 1.99, // legado interno; el anual público es PLUS_ANNUAL_REGULAR_PRICE
    precioAnualRegular: 5.99,
    precioLabel: '3,99€/mes',
    duracion_dias: 30,
    descripcionCorta: 'La opción más popular para preparar el examen y mejorar con feedback.',
    descripcion:
      'Nivel B2, exámenes, Writing Correction, Speaking Correction, Dralo AI y consultas Dralo Assistant sin límite, Training y Quiz ilimitados, corrección Writing avanzada, acceso prioritario a nuevas funciones y soporte prioritario (hasta 24h). A2, B1, C1 y C2 próximamente.',
    badge: '🏆 MÁS POPULAR',
    badgeVariant: 'popular',
    recommended: true,
    stripe_price_id: null,
    orden: 1,
    activo: true,
    highlights: [
      'Nivel B2',
      'A2 y B1: próximamente',
      'C1 y C2: próximamente',
      'Training: vidas ilimitadas',
      'Quiz: vidas ilimitadas',
      'Exámenes mensuales',
      'Writing Correction',
      'Speaking Correction',
      'Corrección Writing avanzada',
      'Dralo AI',
      'Consultas Dralo Assistant',
      'Exam Strategies',
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
      examStrategies: true,
      trainingLives: null,
      quizLives: null,
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
      'Todo lo de Plus, con Training y Quiz ilimitados, exámenes, Writing Correction, Speaking Correction, Dralo AI y consultas Dralo Assistant sin límite, acceso prioritario a nuevas funciones y soporte prioritario (hasta 24h).',
    badge: '🚀 MEJOR VALOR',
    badgeVariant: 'value',
    recommended: false,
    stripe_price_id: null,
    orden: 2,
    activo: false,
    highlights: [
      'Nivel B2',
      'A2 y B1: próximamente',
      'C1 y C2: próximamente',
      'Training: vidas ilimitadas',
      'Quiz: vidas ilimitadas',
      'Exámenes mensuales',
      'Writing Correction',
      'Speaking Correction',
      'Corrección Writing avanzada',
      'Dralo AI',
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
      examStrategies: true,
      trainingLives: null,
      quizLives: null,
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
      'Mismos permisos que Plan PLUS: catálogo completo, correcciones, Dralo AI y Dralo Assistant sin límite práctico. Solo asignable desde el panel de administración.',
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
      examStrategies: true,
      trainingLives: null,
      quizLives: null,
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
      examStrategies: true,
      trainingLives: null,
      quizLives: null,
    },
  },
];

/** Valor de celda para funciones anunciadas pero todavía no disponibles. */
export const COMING_SOON = 'coming-soon';

/** Descuento al facturar anualmente (mostrado en /precios y vista previa admin). */
export const ANNUAL_BILLING_DISCOUNT_PERCENT = 25;

/** La oferta de precio sigue activa hasta el final de PLUS_OFFER_END_DATE (Madrid). */

export function planHasLaunchPricing(plan) {
  return Number(plan?.precioRegular) > 0;
}

/** @param {'monthly'|'annual'} billingCycle */
export function getPlanMonthlyPrice(plan, billingCycle = 'monthly') {
  const base = Number(plan?.precio) || 0;
  if (base <= 0) return 0;
  if (billingCycle === 'annual') {
    if (plan?.slug === 'premium') {
      const total = isBlackFridayOfferActive() ? PLUS_ANNUAL_BF_PRICE : PLUS_ANNUAL_REGULAR_PRICE;
      return total / 12;
    }
    const annualLaunch = Number(plan?.precioAnualLanzamiento);
    if (annualLaunch > 0) return annualLaunch;
    return base * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
  }
  return base;
}

/** Un solo precio tachado mientras la oferta de Plus sigue en fecha. */
export function getPlanCrossedPrices(plan, billingCycle = 'monthly') {
  if (!isPlusOfferActive()) return [];
  const list = Number(plan?.precioLista);
  const current = getPlanMonthlyPrice(plan, billingCycle);
  if (!(list > current)) return [];

  if (billingCycle === 'annual') {
    if (plan?.slug === 'premium') {
      if (!isBlackFridayOfferActive()) return [];
      const regularMonth = PLUS_ANNUAL_REGULAR_PRICE / 12;
      return regularMonth > current ? [regularMonth] : [];
    }
    const annualList = list * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
    return annualList > current ? [annualList] : [];
  }

  return [list];
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

/** Ahorro real del año completo frente a pagar el mismo plan mes a mes. */
export function getPlanAnnualSavingsPercent(plan) {
  const monthly = Number(plan?.precio) || 0;
  const annualMonthly = getPlanMonthlyPrice(plan, 'annual');
  if (monthly <= 0 || annualMonthly <= 0 || annualMonthly >= monthly) return null;
  return Math.round(((monthly - annualMonthly) / monthly) * 100);
}

/** @param {'monthly'|'annual'} billingCycle */
export function formatPlanPriceLabel(plan, billingCycle = 'monthly') {
  if (billingCycle === 'annual') {
    const total = plusAnnualChargeEuros(plan);
    if (total <= 0) return '0€';
    return `${formatEuroAmount(total)}/año`;
  }
  const monthly = getPlanMonthlyPrice(plan, billingCycle);
  if (monthly <= 0) return '0€';
  return `${formatEuroAmount(monthly)}/mes`;
}

/** Total anual que se muestra en la tarjeta. El cobro real lo fija Stripe. */
export function plusAnnualChargeEuros(plan, now = new Date()) {
  if (plan?.slug === 'premium') {
    return isBlackFridayOfferActive(now) ? PLUS_ANNUAL_BF_PRICE : PLUS_ANNUAL_REGULAR_PRICE;
  }
  return Math.round(getPlanMonthlyPrice(plan, 'annual') * 12 * 100) / 100;
}

export function plusAnnualRenewalCopy() {
  return `Se renueva automáticamente cada año al precio vigente en ese momento (actualmente ${formatEuroAmount(PLUS_ANNUAL_REGULAR_PRICE)}/año).`;
}

export function plusBlackFridayFaqItems(now = new Date()) {
  const active = isBlackFridayOfferActive(now);
  const items = [
    {
      q: '¿Qué incluye la oferta de Black Friday?',
      a: `${plusBlackFridayAccessCopy()}. Disponible hasta el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}.`,
      blackFriday: true,
    },
    {
      q: '¿Se renueva automáticamente?',
      a: `Sí. ${plusAnnualRenewalCopy()}`,
    },
    {
      q: '¿Hasta cuándo puedo contratarla?',
      a: `Hasta el ${PLUS_BLACK_FRIDAY_UNTIL_LABEL}.`,
      blackFriday: true,
    },
    {
      q: '¿Puedo seguir pagando mensual?',
      a: `Sí. El Plan Plus a ${formatEuroAmount(PLUS_MONTHLY_PRICE)}/mes está disponible hasta el ${PLUS_OFFER_UNTIL_LABEL}.`,
    },
  ];
  return items.filter((item) => !item.blackFriday || active).map(({ q, a }) => ({ q, a }));
}

/** Total anual facturado de una vez (precio mensual con descuento × 12). */
export function formatPlanAnnualTotal(plan) {
  const total = plusAnnualChargeEuros(plan);
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
    type: 'text',
    values: { free: COMING_SOON, premium: COMING_SOON, pro: COMING_SOON },
  },
  {
    id: 'b1',
    label: 'Nivel B1',
    type: 'text',
    values: { free: COMING_SOON, premium: COMING_SOON, pro: COMING_SOON },
  },
  { id: 'b2', label: 'Nivel B2', type: 'text', values: { free: '1 examen de prueba', premium: true, pro: true } },
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
    values: { free: false, premium: COMING_SOON, pro: COMING_SOON },
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
    values: { free: false, premium: true, pro: true },
  },
  {
    id: 'priority-support',
    label: 'Soporte prioritario',
    type: 'text',
    values: { free: 'Hasta 72h', premium: 'Hasta 24h', pro: 'Hasta 24h' },
  },
  {
    id: 'training',
    label: 'Training',
    type: 'text',
    values: { free: '3 vidas · 1 cada 10 h', premium: 'Ilimitado', pro: 'Ilimitado' },
  },
  {
    id: 'quiz',
    label: 'Quiz',
    type: 'text',
    values: { free: '3 vidas · 1 cada 10 h', premium: 'Ilimitado', pro: 'Ilimitado' },
  },
  {
    id: 'exams',
    label: 'Exámenes mensuales',
    type: 'text',
    values: { free: '1', premium: true, pro: true },
  },
  {
    id: 'writing-correction',
    label: 'Writing Correction',
    type: 'text',
    values: { free: '1/mes', premium: true, pro: true },
  },
  {
    id: 'speaking-correction',
    label: 'Speaking Correction',
    type: 'text',
    values: { free: '1/mes', premium: true, pro: true },
  },
  {
    id: 'speaking',
    label: 'Dralo AI',
    type: 'text',
    values: { free: false, premium: true, pro: true },
  },
  {
    id: 'exam-strategies',
    label: 'Exam Strategies',
    type: 'text',
    values: { free: '1ª parte', premium: true, pro: true },
  },
  {
    id: 'dralo-ai',
    label: 'Consultas Dralo Assistant',
    type: 'text',
    values: { free: '3/mes', premium: true, pro: true },
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
  { slug: 'c2', label: 'C2', access: 'premium', note: 'Desde plan PLUS.' },
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
      'B2: 1 trial exam',
      'A2 and B1: coming soon',
      'Training: 3 lives (1 recovers every 10 hours)',
      'Quiz: 3 lives (1 recovers every 10 hours)',
      'Writing Correction: 1/month',
      'Speaking Correction: 1/month',
      '3 Dralo Assistant queries per month',
      'Exam Strategies: part 1 of each level and skill',
      'Support: within 72h',
    ],
    badge: null,
  },
  starter: {
    descripcionCorta: 'For students who want steady progress.',
    highlights: [
      'Full access to A2 and B1',
      'Training: unlimited lives',
      'Quiz: unlimited lives',
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
      'A2 and B1: coming soon',
      'C1 and C2: coming soon',
      'Training: unlimited lives',
      'Quiz: unlimited lives',
      'Monthly exams',
      'Writing Correction',
      'Speaking Correction',
      'Advanced Writing correction',
      'Dralo AI',
      'Dralo Assistant queries',
      'Exam Strategies',
      'Priority access to new features',
      'Progress tracking',
      'Priority support: within 24h',
    ],
    badge: 'Most popular',
  },
  pro: {
    descripcionCorta: 'The most complete experience with the highest daily limits.',
    highlights: [
      'Level B2',
      'A2 and B1: coming soon',
      'C1 and C2: coming soon',
      'Training: unlimited lives',
      'Quiz: unlimited lives',
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

/** Planes que se muestran en precios: Gratis y Plus. */
export function getPublicSubscriptionPlans() {
  return DRALO_SUBSCRIPTION_PLANS.filter((plan) => plan.activo !== false && !plan.adminGrantOnly);
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
const LEVEL_MIN_PLAN = { a2: 'free', b1: 'free', b2: 'free', c1: 'premium', c2: 'premium' };

const PLAN_RANK = {
  free: 0,
  starter: 1,
  premium: 2,
  friendly_plus: 2,
  pro: 2,
  friendly_premium: 2,
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

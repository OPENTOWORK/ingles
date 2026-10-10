import { SITE_URL } from '@/lib/siteSeo';
import { getPlanBySlug } from '@/data/financialPlanConfig';
import {
  FOUNDING_SURVEY_DELAY_DAYS,
  FOUNDING_SURVEY_RESPONSE_DAYS,
} from '@/lib/foundingSurvey.rules';
import { MAX_FOUNDING_SLOT } from '@/lib/foundingMemberPlus.rules';

export const AB_CTA_LABEL = 'Quiero mi plaza gratis';

export const AB_EVENTS = {
  pageView: 'page_view',
  ctaClick: 'cta_click',
  registrationStart: 'registration_start',
  registrationComplete: 'registration_complete',
};

const CAMBRIDGE_B2_URL = 'https://www.cambridgeenglish.org/exams-and-tests/first/';

export function normalizeAbVariant(variant) {
  return String(variant || '').toLowerCase() === 'b' ? 'b' : 'a';
}

export function abVariantLetter(variant) {
  return normalizeAbVariant(variant) === 'b' ? 'B' : 'A';
}

export function isAbExperimentPath(pathname = '') {
  const path = String(pathname || '').split('?')[0];
  return /^\/(campana|preparar-b2-cambridge)\/(a|b)\/?$/.test(path);
}

export function campaignPath(variant) {
  return `/campana/${normalizeAbVariant(variant)}/`;
}

export function guidePath(variant) {
  return `/preparar-b2-cambridge/${normalizeAbVariant(variant)}/`;
}

export function campaignAbsoluteUrl(variant) {
  return `${SITE_URL}${campaignPath(variant)}`;
}

export function guideAbsoluteUrl(variant) {
  return `${SITE_URL}${guidePath(variant)}`;
}

export function guideCanonicalUrl() {
  return `${SITE_URL}/preparar-b2-cambridge/`;
}

/** Enlace de la guía hacia la campaña de la misma variante, con atribución. */
export function guideToCampaignHref(variant) {
  const params = new URLSearchParams({ ab_source: 'b2-guide' });
  return `${campaignPath(variant)}?${params.toString()}`;
}

/**
 * Las campañas abren el login. La query solo identifica la variante del experimento.
 * No incluye email ni otros datos personales.
 */
const PRESERVED_ACQUISITION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'ttclid',
  'msclkid',
];

function firstSearchValue(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const text = typeof raw === 'string' ? raw.trim() : '';
  return text || '';
}

export function buildRegisterHref({ pageType, variant, source = 'direct', searchParams } = {}) {
  const params = new URLSearchParams({
    ab_page: pageType === 'guide' ? 'guide' : 'campaign',
    ab_variant: normalizeAbVariant(variant),
    ab_source: source === 'b2-guide' ? 'b2-guide' : 'direct',
  });
  const incoming = searchParams && typeof searchParams === 'object' ? searchParams : {};
  for (const key of PRESERVED_ACQUISITION_KEYS) {
    const value = firstSearchValue(incoming[key]);
    if (value) params.set(key, value);
  }
  return `/login/?${params.toString()}`;
}

export function readAttributionFromSearch(search = '') {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const variant = params.get('ab_variant');
  const pageType = params.get('ab_page');
  if (variant !== 'a' && variant !== 'b') return null;
  if (pageType !== 'guide' && pageType !== 'campaign') return null;
  const source = params.get('ab_source') === 'b2-guide' ? 'b2-guide' : 'direct';
  return { pageType, variant, source };
}

function planOrNull(slug) {
  try {
    return getPlanBySlug(slug);
  } catch {
    return null;
  }
}

const plusPlan = planOrNull('premium');
const premiumPlan = planOrNull('pro');

export const PLUS_PUBLIC_PRICE = plusPlan?.precioLabel || '[COMPLETAR PRECIO]';
export const PLUS_REGULAR_PRICE = plusPlan?.precioRegular
  ? `${String(plusPlan.precioRegular).replace('.', ',')}€/mes`
  : '[COMPLETAR PRECIO]';
export const PLUS_LIST_PRICE = plusPlan?.precioLista
  ? `${String(plusPlan.precioLista).replace('.', ',')}€/mes`
  : '[COMPLETAR PRECIO]';
export const PREMIUM_PUBLIC_PRICE = premiumPlan?.precioLabel || '[COMPLETAR]';
export const PLUS_HIGHLIGHTS = Array.isArray(plusPlan?.highlights) ? plusPlan.highlights : [];
export const PLUS_ENTITLEMENTS = plusPlan?.entitlements || null;

export const FOUNDING_OFFER = {
  total: MAX_FOUNDING_SLOT,
  delayDays: FOUNDING_SURVEY_DELAY_DAYS,
  responseDays: FOUNDING_SURVEY_RESPONSE_DAYS,
};

export const CONDITION_SUMMARY =
  `Durante los primeros ${FOUNDING_SURVEY_DELAY_DAYS} días pruebas Dralo. Para conservar el Plan Plus gratis hay que completar el formulario: se envía al cumplirse esos ${FOUNDING_SURVEY_DELAY_DAYS} días y tienes ${FOUNDING_SURVEY_RESPONSE_DAYS} días para responder. Si no lo completas, el Plan Plus se retira y la cuenta pasa al plan gratuito.`;

export const PAPERS = [
  {
    name: 'Reading and Use of English',
    weight: '40 %',
    detail:
      'Una sola prueba, con siete partes y 52 preguntas. El tiempo del formato que usa Dralo en Exam Strategies es de 75 minutos. Las partes 1 a 4 trabajan gramática y vocabulario; las partes 5 a 7, la lectura.',
  },
  {
    name: 'Writing',
    weight: '20 %',
    detail:
      'Dos partes y 80 minutos. La parte 1 es un essay obligatorio. La parte 2 es una tarea a elegir entre tres opciones. En el formato que usa Dralo, cada tarea se sitúa entre 140 y 190 palabras.',
  },
  {
    name: 'Listening',
    weight: '20 %',
    detail:
      'Cuatro partes, unos 40 minutos más el tiempo para pasar las respuestas. Número de preguntas: [COMPLETAR].',
  },
  {
    name: 'Speaking',
    weight: '20 %',
    detail:
      'Cuatro partes, unos 14 minutos, normalmente con dos candidatos. Incluye entrevista, comparación de fotos, tarea en pareja y discusión.',
  },
];

export const PRACTICE_LOOP = [
  'Practicar',
  'Recibir feedback',
  'Entender el error',
  'Mejorar',
  'Volver a practicar',
];

export const CAMPAIGN_FAQ = [
  {
    q: '¿De verdad es gratis?',
    a: `Sí, para los primeros ${MAX_FOUNDING_SLOT} registros el Plan Plus no se cobra. La condición es completar el formulario cuando se cumplen ${FOUNDING_SURVEY_DELAY_DAYS} días. Si no lo completas en los ${FOUNDING_SURVEY_RESPONSE_DAYS} días siguientes, el Plan Plus se retira.`,
  },
  {
    q: '¿Qué significa “gratis para siempre”?',
    a: 'Si completas ese formulario dentro del plazo, el Plan Plus se mantiene sin cuota mensual. No es un periodo de prueba que pase solo a un cobro.',
  },
  {
    q: '¿Qué tengo que hacer durante los primeros 30 días?',
    a: `Practicar con la cuenta. A los ${FOUNDING_SURVEY_DELAY_DAYS} días Dralo envía el formulario. Tienes ${FOUNDING_SURVEY_RESPONSE_DAYS} días para responderlo.`,
  },
  {
    q: '¿Qué ocurre si no completo el formulario?',
    a: 'El Plan Plus se retira y la cuenta pasa al plan gratuito.',
  },
  {
    q: '¿Qué incluye Plan Plus?',
    a: PLUS_HIGHLIGHTS.length
      ? `El catálogo del Plan Plus incluye: ${PLUS_HIGHLIGHTS.join('; ')}.`
      : '[COMPLETAR FUNCIONES PLAN PLUS]',
  },
  {
    q: '¿Qué partes del B2 puedo practicar?',
    a: 'Reading and Use of English, Writing, Listening y Speaking. Use of English no es una quinta prueba: forma parte de Reading and Use of English.',
  },
  {
    q: '¿Cuánto tiempo puedo utilizar Dralo?',
    a: 'La cuenta no tiene una fecha de cierre en esta promoción. El Plan Plus gratis se conserva si completas el formulario en el plazo. Si no, sigues en el plan gratuito.',
  },
  {
    q: '¿Tengo que introducir una tarjeta?',
    a: 'No para esta alta. El registro pide nombre, correo y contraseña. No hay un campo de tarjeta en ese formulario.',
  },
  {
    q: '¿Dralo sustituye a una academia o a una profesora?',
    a: 'No. La academia o la profesora enseñan. Dralo sirve para practicar fuera de clase, ver el feedback y seguir el progreso.',
  },
  {
    q: '¿Qué ocurre si más adelante quiero Premium?',
    a: PREMIUM_PUBLIC_PRICE.startsWith('[')
      ? '[COMPLETAR]'
      : `El catálogo público tiene un plan Premium por encima de Plus, a ${PREMIUM_PUBLIC_PRICE}. Se consulta en la página de precios.`,
  },
];

export const GUIDE_FAQ = [
  {
    q: '¿Cuántas pruebas tiene el B2 First?',
    a: 'Cuatro: Reading and Use of English, Writing, Listening y Speaking. Use of English no es una prueba aparte.',
  },
  {
    q: '¿Cuánto pesa cada prueba?',
    a: 'Reading and Use of English pesa el 40 %. Writing, Listening y Speaking pesan el 20 % cada una.',
  },
  {
    q: '¿Con qué puntuación se aprueba?',
    a: 'En la Cambridge English Scale, el Grade C (aprobado B2) empieza en 160. Un resultado de 140 a 159 puede certificarse como B1. 180 o más puede reportarse como C1. No hay un porcentaje fijo del examen que, por sí solo, sea el aprobado.',
  },
  {
    q: '¿Dónde está la información oficial?',
    a: 'En la página de Cambridge English para B2 First. El enlace está al final de esta guía.',
  },
];

export const STUDY_PLAN = [
  'Diagnóstico: haz una práctica corta de cada prueba y anota qué tipo de error se repite.',
  'Formato: repasa partes, tiempos y qué se pide en cada una antes de acumular horas.',
  'Writing: escribe, pide la corrección y reescribe solo los puntos que el feedback marca.',
  'Reading and Use of English, Listening y Speaking: practica cada prueba con el tiempo del examen, no solo la que más te gusta.',
  'Simulacro: junta las cuatro pruebas y revisa los errores antes de repetir.',
];

export const COMMON_MISTAKES = [
  'Preparar solo gramática y dejar Speaking o Listening para el final.',
  'Contar Use of English como si fuera una quinta prueba y olvidar que comparte tiempo con Reading.',
  'Escribir sin mirar las notas obligatorias del essay o sin llegar al mínimo de palabras.',
  'En Listening, elegir una opción solo porque oyes una palabra que aparece en ella.',
  'En Speaking, responder con una frase memorizada que no contesta la pregunta.',
  'Repetir ejercicios sin leer por qué la respuesta era incorrecta.',
];

export function guideMetadata(variant) {
  const letter = abVariantLetter(variant);
  const url = guideAbsoluteUrl(variant);
  const title = 'Cómo preparar el B2 First de Cambridge';
  const description =
    normalizeAbVariant(variant) === 'b'
      ? 'Guía del B2 First: cuatro pruebas, pesos 40/20/20/20 y Cambridge English Scale. Cuando sepas el formato, practica con feedback en Dralo.'
      : 'Guía para preparar el B2 First de Cambridge: qué es, cómo es cada prueba, tiempos, plan de estudio y errores frecuentes.';
  return {
    title: { absolute: `${title} | Dralo` },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: guideCanonicalUrl() },
    openGraph: {
      title: `${title} (${letter})`,
      description,
      url,
      locale: 'es_ES',
      type: 'article',
      siteName: 'Dralo',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} (${letter})`,
      description,
    },
    other: {
      'ab-variant': letter,
    },
  };
}

export function campaignMetadata(variant) {
  const letter = abVariantLetter(variant);
  const url = campaignAbsoluteUrl(variant);
  const title =
    normalizeAbVariant(variant) === 'b'
      ? 'Estudias en clase. Aquí ves el fallo en lo que tú has escrito | Dralo'
      : `Plan Plus gratis para los primeros ${MAX_FOUNDING_SLOT} registros | Dralo`;
  const description =
    normalizeAbVariant(variant) === 'b'
      ? `Mira la corrección de Writing y las fotos de Speaking. Plan Plus gratis para los primeros ${MAX_FOUNDING_SLOT}, si completas el formulario a los ${FOUNDING_SURVEY_DELAY_DAYS} días.`
      : `Practica el B2 First y mejora tu Writing. Plan Plus gratis para los primeros ${MAX_FOUNDING_SLOT} registros, si completas el formulario a los ${FOUNDING_SURVEY_DELAY_DAYS} días.`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: 'es_ES',
      type: 'website',
      siteName: 'Dralo',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const CAMBRIDGE_OFFICIAL_URL = CAMBRIDGE_B2_URL;

/** Texto público de las variantes, para comprobar que no se cuelan afirmaciones prohibidas. */
export function publicExperimentCopy() {
  return [
    CONDITION_SUMMARY,
    ...PAPERS.map((paper) => `${paper.name} ${paper.weight} ${paper.detail}`),
    ...CAMPAIGN_FAQ.map((item) => `${item.q} ${item.a}`),
    ...GUIDE_FAQ.map((item) => `${item.q} ${item.a}`),
    ...STUDY_PLAN,
    ...COMMON_MISTAKES,
    ...PLUS_HIGHLIGHTS,
    PLUS_PUBLIC_PRICE,
    AB_CTA_LABEL,
  ].join('\n');
}

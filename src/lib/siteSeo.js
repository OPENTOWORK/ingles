/** Canonical production URL for SEO (metadataBase, Open Graph, canonical). Never vercel.app. */
export const SITE_URL = 'https://www.dralo.es';

export const SOCIAL_SHARE = {
  locale: 'es_ES',
  imageAlt: 'Dralo Academy — practica inglés con exámenes e IA',
};

export const SITE_FOOTER_TAGLINE =
  'Ejercicios diseñados para practicar tus exámenes de inglés.';

export function canonicalPath(path = '/') {
  if (path === '/') return '/';
  return `/${String(path).replace(/^\/+|\/+$/g, '')}/`;
}

export function canonicalUrl(path = '/') {
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${canonicalPath(path)}`;
}

/**
 * Metadata de una página pública.
 * El título final siempre incluye " | Dralo" (salvo `absoluteTitle`) para que
 * las rutas anidadas no pierdan el sufijo: Next 14 no aplica `title.template`
 * del layout raíz cuando un layout padre ya definió `title`.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  robots,
}) {
  const url = canonicalUrl(path);
  const resolvedTitle = absoluteTitle || `${title} | Dralo`;
  return {
    title: { absolute: resolvedTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
    },
    twitter: {
      title: resolvedTitle,
      description,
    },
    ...(robots ? { robots } : {}),
  };
}

export const SEO_PAGE_META = {
  home: {
    title: 'Práctica B2 First online con corrección de Writing | Dralo',
    description:
      'Practica el B2 First con ejercicios en formato examen, entiende tus errores y recibe correcciones de Writing. Crea tu cuenta gratis, sin tarjeta.',
  },
  registro: {
    title: 'Crea tu cuenta gratis',
    description:
      'Crea tu cuenta en Dralo y practica el B2 First con correcciones y seguimiento de tu progreso. Sin tarjeta: solo nombre, correo y contraseña.',
  },
  precios: {
    title: 'Precios y Plan Plus gratis',
    description:
      'Compara el plan gratuito y el Plan Plus de Dralo. Prueba 30 días sin tarjeta y conserva el Plan Plus gratis si completas el formulario.',
  },
  examPractice: {
    title: 'Práctica de exámenes Cambridge',
    description:
      'Practica ejercicios de inglés por niveles con actividades de Reading, Use of English, Writing y Listening.',
  },
  examPracticeB2: {
    title: 'Práctica B2 First: Reading, Writing y Listening',
    description:
      'Ejercicios de Reading and Use of English, Writing y Listening con formato de examen B2 First. Practica, revisa tus errores y sigue tu progreso.',
  },
  examPracticeB2Reading: {
    title: 'Reading and Use of English B2 First: práctica',
    description:
      'Practica Reading and Use of English del B2 First con ejercicios en formato examen y revisa tus errores con explicaciones claras.',
  },
  examPracticeB2Writing: {
    title: 'Writing B2 First: práctica y corrección de textos',
    description:
      'Practica el Writing del B2 First y recibe correcciones de gramática, vocabulario y coherencia con comentarios claros para mejorar.',
  },
  examPracticeB2Listening: {
    title: 'Listening B2 First: práctica de examen con audio',
    description:
      'Practica el Listening del B2 First con audios y ejercicios en formato examen. Revisa tus resultados y mejora tu comprensión oral.',
  },
  examStrategies: {
    title: 'Estrategias para el examen B2 First',
    description:
      'Estrategias y consejos para cada parte del B2 First: Reading and Use of English, Writing, Listening y Speaking.',
  },
  training: {
    title: 'Training: gramática y Use of English',
    description:
      'Practica gramática y Use of English por niveles. Sigue el camino, gana estrellas y desbloquea el siguiente nivel.',
  },
  blog: {
    title: 'Blog para preparar el B2 First',
    description:
      'Guías y consejos para preparar el B2 First: Reading, Writing, Listening y Speaking.',
  },
  contact: {
    title: 'Contacto',
    description: '¿Dudas sobre Dralo o la preparación del B2 First? Escríbenos y te ayudamos.',
  },
  contactFaq: {
    title: 'Preguntas frecuentes',
    description:
      'Respuestas sobre Dralo, la preparación del B2 First y el funcionamiento de la plataforma.',
  },
  login: {
    title: 'Iniciar sesión',
    description: 'Accede a tu cuenta de Dralo para continuar practicando.',
  },
  contactEmailSetup: {
    title: 'Configurar correo',
    description: 'Página interna para configurar el correo de contacto de Dralo.',
  },
  resetPassword: {
    title: 'Restablecer contraseña',
    description: 'Solicita un enlace para restablecer la contraseña de tu cuenta de Dralo.',
  },
  updatePassword: {
    title: 'Nueva contraseña',
    description: 'Elige una nueva contraseña para tu cuenta de Dralo.',
  },
  foundingSurvey: {
    title: 'Encuesta de bienvenida',
    description: 'Cuéntanos cómo te va con Dralo después de registrarte.',
  },
  auth: {
    title: 'Autenticación',
    description: 'Confirmación de acceso a tu cuenta de Dralo.',
  },
  draloAi: {
    title: 'Dralo AI',
    description:
      'Writing, listening, speaking y grammar coach: practica inglés con IA adaptada a niveles A2–C2.',
  },
};

const EXAM_STRATEGY_PARTS = {
  'reading-and-use-of-english': {
    title: 'Reading and Use of English: estrategias B2 First',
    part: 'Reading and Use of English',
  },
  writing: {
    title: 'Writing: estrategias para el B2 First',
    part: 'Writing',
  },
  listening: {
    title: 'Listening: estrategias para el B2 First',
    part: 'Listening',
  },
  speaking: {
    title: 'Speaking: estrategias para el B2 First',
    part: 'Speaking',
  },
  'use-of-english': {
    title: 'Use of English: estrategias para el B2 First',
    part: 'Use of English',
  },
  reading: {
    title: 'Reading: estrategias para el B2 First',
    part: 'Reading',
  },
};

export function examStrategyPartMetadata(slug) {
  const part = EXAM_STRATEGY_PARTS[slug];
  if (!part) return null;
  return pageMetadata({
    title: part.title,
    description: `Consejos prácticos para abordar la parte de ${part.part} del examen B2 First.`,
    path: `/exam-strategies/${slug}/`,
  });
}

export function examPracticeLevelMetadata(level) {
  const cefr = String(level || '').toLowerCase();
  const label = cefr.toUpperCase();
  if (cefr === 'b2') {
    return pageMetadata({
      title: SEO_PAGE_META.examPracticeB2.title,
      description: SEO_PAGE_META.examPracticeB2.description,
      path: '/exam-practice/b2/',
    });
  }
  return pageMetadata({
    title: `Práctica ${label}: Reading, Writing y Listening`,
    description: `Ejercicios de Reading and Use of English, Writing y Listening con formato de examen ${label}. Practica, revisa tus errores y sigue tu progreso.`,
    path: `/exam-practice/${cefr}/`,
  });
}

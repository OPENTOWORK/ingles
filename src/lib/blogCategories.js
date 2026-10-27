/**
 * Categorías del blog. El slug vive en blog_articles.category_slug.
 * Esta lista es el catálogo (nombre, texto e SEO). La asignación por slug
 * cubre los artículos ya publicados si la columna aún no está en la respuesta.
 */

export const BLOG_PILLAR_PATH = '/preparar-b2-cambridge';

export const BLOG_CATEGORIES = [
  {
    slug: 'preparar-b2-first',
    name: 'Preparar el B2 First',
    intro:
      'Guías para organizar el estudio del B2 First de Cambridge: qué partes tiene el examen, cómo repartir el tiempo y cómo saber si vas a llegar preparado.',
    seoTitle: 'Preparar el B2 First de Cambridge: guías y consejos',
    seoDescription:
      'Descubre cómo preparar el B2 First de Cambridge con guías, estrategias de estudio y recursos para mejorar tu inglés y llegar preparado al examen.',
    guide: {
      slug: 'como-preparar-b2-first',
      title:
        '¿Cómo preparar el B2 First de Cambridge? Guía completa para llegar preparado al examen',
    },
  },
  {
    slug: 'reading-b2-first',
    name: 'Reading B2 First',
    intro:
      'Cómo abordar el Reading del B2 First: qué pide cada ejercicio, cómo leer los textos del examen y qué practicar para mejorar la comprensión lectora.',
    seoTitle: 'Reading B2 First: estrategias y consejos para mejorar',
    seoDescription:
      'Aprende a mejorar el Reading B2 First de Cambridge con estrategias de comprensión lectora, vocabulario y práctica para el examen.',
    guide: {
      slug: 'reading-b2-first',
      title: 'Reading B2 First: cómo prepararlo y mejorar',
    },
  },
  {
    slug: 'use-of-english-b2-first',
    name: 'Use of English B2 First',
    intro:
      'El Use of English del B2 First mezcla gramática y vocabulario en contexto. Aquí tienes cómo preparar cada tipo de ejercicio y cómo revisar los fallos que se repiten.',
    seoTitle: 'Use of English B2 First: gramática y vocabulario',
    seoDescription:
      'Prepara el Use of English del B2 First con estrategias de gramática, vocabulario y práctica de los ejercicios del examen de Cambridge.',
    guide: {
      slug: 'use-of-english-b2-first',
      title: 'Use of English B2 First: cómo prepararlo y mejorar',
    },
  },
  {
    slug: 'listening-b2-first',
    name: 'Listening B2 First',
    intro:
      'Estrategias para el Listening del B2 First: cómo anticipar las preguntas, seguir los audios y perder menos respuestas por un detalle que se escapa.',
    seoTitle: 'Listening B2 First: cómo entender los audios',
    seoDescription:
      'Mejora el Listening B2 First de Cambridge con estrategias para entender los audios, anticipar las preguntas y fallar menos en el examen.',
    guide: {
      slug: 'listening-b2-first',
      title: 'Listening B2 First: cómo entender los audios y fallar menos',
    },
  },
  {
    slug: 'writing-b2-first',
    name: 'Writing B2 First',
    intro:
      'Cómo mejorar las redacciones del Writing B2 First: estructura, registro y los errores que más bajan la nota en el examen de Cambridge.',
    seoTitle: 'Writing B2 First: cómo mejorar tus redacciones',
    seoDescription:
      'Aprende a mejorar el Writing B2 First de Cambridge: estructura, registro y práctica para escribir redacciones con mejor puntuación.',
    guide: {
      slug: 'writing-b2-first-como-mejorar-tus-redacciones',
      title: 'Writing B2 First: Cómo mejorar tus redacciones y conseguir una mejor puntuación',
    },
  },
  {
    slug: 'speaking-b2-first',
    name: 'Speaking B2 First',
    intro:
      'Cómo preparar el Speaking del B2 First: desarrollar respuestas, comparar imágenes y hablar con más seguridad el día del examen oral.',
    seoTitle: 'Speaking B2 First: cómo hablar con más seguridad',
    seoDescription:
      'Prepara el Speaking B2 First de Cambridge con ideas para desarrollar respuestas, comparar imágenes y ganar seguridad al hablar.',
    guide: {
      slug: 'speaking-b2-first-como-hablar-con-mas-seguridad',
      title: 'Cómo hablar con más seguridad',
    },
  },
];

/**
 * Artículos existentes. `published` refleja el estado al asignar la categoría
 * y decide qué categorías entran en el sitemap sin consultar la base de datos.
 */
export const BLOG_ARTICLE_CATEGORY_ASSIGNMENTS = [
  { slug: 'como-preparar-b2-first', categorySlug: 'preparar-b2-first', published: true },
  {
    slug: 'como-saber-si-estoy-preparado-b2-first',
    categorySlug: 'preparar-b2-first',
    published: false,
  },
  {
    slug: 'cambios-cambridge-english-2026',
    categorySlug: 'preparar-b2-first',
    published: true,
  },
  {
    slug: 'dralo-empieza-en-septiembre-una-nueva-forma-de-preparar-tus-examenes-oficiales-de-ingles',
    categorySlug: 'preparar-b2-first',
    published: true,
  },
  { slug: 'reading-b2-first', categorySlug: 'reading-b2-first', published: true },
  { slug: 'use-of-english-b2-first', categorySlug: 'use-of-english-b2-first', published: true },
  { slug: 'listening-b2-first', categorySlug: 'listening-b2-first', published: true },
  {
    slug: 'writing-b2-first-como-mejorar-tus-redacciones',
    categorySlug: 'writing-b2-first',
    published: true,
  },
  {
    slug: 'speaking-b2-first-como-hablar-con-mas-seguridad',
    categorySlug: 'speaking-b2-first',
    published: true,
  },
  {
    slug: 'como-hablar-sin-sonar-borde-en-ingles-que-decir-en-su-lugar',
    categorySlug: 'speaking-b2-first',
    published: true,
  },
];

const CATEGORY_BY_SLUG = new Map(BLOG_CATEGORIES.map((category) => [category.slug, category]));
const ASSIGNMENT_BY_ARTICLE = new Map(
  BLOG_ARTICLE_CATEGORY_ASSIGNMENTS.map((item) => [item.slug, item.categorySlug]),
);

/** @param {string | null | undefined} slug */
export function blogCategoryBySlug(slug) {
  return CATEGORY_BY_SLUG.get(String(slug || '').trim()) || null;
}

/** @param {string | null | undefined} value */
export function normalizeBlogCategorySlug(value) {
  const slug = String(value || '').trim();
  return CATEGORY_BY_SLUG.has(slug) ? slug : '';
}

/** @param {string} slug */
export function blogCategoryPath(slug) {
  const normalized = normalizeBlogCategorySlug(slug);
  return normalized ? `/blog/categoria/${normalized}` : '/blog';
}

/** @param {{ slug?: string, category_slug?: string | null } | null | undefined} article */
export function categoryForArticle(article) {
  const fromColumn = blogCategoryBySlug(article?.category_slug);
  if (fromColumn) return fromColumn;
  return blogCategoryBySlug(ASSIGNMENT_BY_ARTICLE.get(article?.slug));
}

/** @param {Array<{ slug?: string, category_slug?: string | null }>} articles */
export function articlesInCategory(articles, categorySlug) {
  if (!blogCategoryBySlug(categorySlug)) return [];
  return (articles || []).filter((article) => categoryForArticle(article)?.slug === categorySlug);
}

/**
 * Otros artículos publicados de la misma categoría.
 * @param {Array<{ slug?: string }>} articles
 * @param {{ slug?: string, category_slug?: string | null }} article
 */
export function relatedArticlesInCategory(articles, article, limit = 3) {
  const category = categoryForArticle(article);
  if (!category || !article?.slug) return [];
  return articlesInCategory(articles, category.slug)
    .filter((item) => item.slug !== article.slug)
    .slice(0, limit);
}

/** Rutas de categorías con al menos un artículo publicado. */
export function indexableBlogCategoryPaths() {
  const published = new Set(
    BLOG_ARTICLE_CATEGORY_ASSIGNMENTS.filter((item) => item.published).map(
      (item) => item.categorySlug,
    ),
  );
  return BLOG_CATEGORIES.filter((category) => published.has(category.slug)).map((category) =>
    blogCategoryPath(category.slug),
  );
}

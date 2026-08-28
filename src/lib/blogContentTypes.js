export const BLOG_TYPE_NEWS = 'news';
export const BLOG_TYPE_ARTICLE = 'article';

/** @typedef {'news' | 'article'} BlogContentType */

export const BLOG_CONTENT_TYPE_META = {
  [BLOG_TYPE_NEWS]: {
    value: BLOG_TYPE_NEWS,
    queryParam: 'noticia',
    label: 'Noticia',
    labelPlural: 'Noticias',
    createLabel: 'Crear noticia',
    saveLabel: 'Guardar noticia',
    createdLabel: 'Noticia creada.',
    updatedLabel: 'Noticia actualizada.',
    deletedLabel: 'Noticia eliminada.',
    deleteConfirm: '¿Eliminar esta noticia?',
    publishLabel: 'Publicar noticia en el blog',
    publishActionLabel: 'Publicar noticia',
    scheduleActionLabel: 'Programar publicación',
    readCta: 'Leer noticia',
    editLabel: 'Editar noticia',
    editPluralLabel: 'Editar noticias',
    emptyTitle: 'Próximamente nuevas noticias',
    emptyText: 'Estamos preparando novedades. Vuelve pronto para leer las últimas noticias.',
    editorSubtitle: 'Anuncios breves y novedades de Dralo.',
    contentPlaceholder: 'Escribe aquí el contenido de la noticia…',
    excerptPlaceholder: 'Resumen breve para el listado de noticias.',
  },
  [BLOG_TYPE_ARTICLE]: {
    value: BLOG_TYPE_ARTICLE,
    queryParam: 'articulo',
    label: 'Artículo',
    labelPlural: 'Artículos',
    createLabel: 'Crear artículo',
    saveLabel: 'Guardar artículo',
    createdLabel: 'Artículo creado.',
    updatedLabel: 'Artículo actualizado.',
    deletedLabel: 'Artículo eliminado.',
    deleteConfirm: '¿Eliminar este artículo?',
    publishLabel: 'Publicar artículo en el blog',
    publishActionLabel: 'Publicar artículo',
    scheduleActionLabel: 'Programar publicación',
    readCta: 'Leer artículo',
    editLabel: 'Editar artículo',
    editPluralLabel: 'Editar artículos',
    emptyTitle: 'Próximamente nuevos artículos',
    emptyText: 'Estamos preparando contenido. Vuelve pronto para leer los últimos artículos.',
    editorSubtitle: 'Contenido largo con portada, imágenes y campos SEO para marketing.',
    contentPlaceholder: 'Escribe aquí el contenido del artículo…',
    excerptPlaceholder: 'Resumen breve que aparece en el listado del blog.',
  },
};

/** @param {string | null | undefined} value */
export function normalizeBlogContentType(value) {
  return value === BLOG_TYPE_NEWS ? BLOG_TYPE_NEWS : BLOG_TYPE_ARTICLE;
}

/** @param {string | null | undefined} queryParam */
export function blogTypeFromQueryParam(queryParam) {
  const key = String(queryParam || '').trim().toLowerCase();
  if (key === BLOG_CONTENT_TYPE_META[BLOG_TYPE_NEWS].queryParam) return BLOG_TYPE_NEWS;
  if (key === BLOG_CONTENT_TYPE_META[BLOG_TYPE_ARTICLE].queryParam) return BLOG_TYPE_ARTICLE;
  return BLOG_TYPE_ARTICLE;
}

/** @param {BlogContentType} type */
export function blogTypeMeta(type) {
  return BLOG_CONTENT_TYPE_META[normalizeBlogContentType(type)];
}

const ALLOWED_TAGS = new Set([
  'p',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'span',
  'a',
  'ul',
  'ol',
  'li',
  'img',
  'blockquote',
  'br',
  'figure',
  'figcaption',
  'div',
]);

function sanitizeInlineStyle(styleValue = '') {
  const allowed = [];
  const parts = String(styleValue).split(';');
  for (const part of parts) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const val = part.slice(colon + 1).trim();
    if (!prop || !val) continue;
    if (prop === 'font-size' && /^(\d+(\.\d+)?(px|em|rem|%))$/i.test(val)) {
      allowed.push(`font-size: ${val}`);
    }
    if (
      prop === 'font-family' &&
      /^[a-z0-9\s,"'%-]+$/i.test(val) &&
      val.length <= 120
    ) {
      allowed.push(`font-family: ${val}`);
    }
  }
  return allowed.join('; ');
}

function stripDangerousAttributes(tagHtml) {
  return tagHtml
    .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+style\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+style\s*=\s*[^\s>]+/gi, '');
}

function sanitizeSpan(tagHtml) {
  const styleMatch = tagHtml.match(/\sstyle\s*=\s*(['"])(.*?)\1/i);
  if (!styleMatch) return '<span>';
  const safeStyle = sanitizeInlineStyle(styleMatch[2]);
  if (!safeStyle) return '<span>';
  return `<span style="${safeStyle.replace(/"/g, '&quot;')}">`;
}

function sanitizeAnchor(tagHtml) {
  const hrefMatch = tagHtml.match(/\shref\s*=\s*(['"])(.*?)\1/i);
  if (!hrefMatch) return tagHtml.replace(/<a\b/i, '<a');
  const href = hrefMatch[2].trim();
  if (!/^https?:\/\//i.test(href) && !href.startsWith('/')) {
    return tagHtml.replace(/<a\b[^>]*>/i, '<a>');
  }
  return stripDangerousAttributes(tagHtml);
}

function sanitizeImage(tagHtml) {
  const srcMatch = tagHtml.match(/\ssrc\s*=\s*(['"])(.*?)\1/i);
  if (!srcMatch) return '';
  const src = srcMatch[2].trim();
  if (!/^https?:\/\//i.test(src) && !src.startsWith('/')) return '';
  const altMatch = tagHtml.match(/\salt\s*=\s*(['"])(.*?)\1/i);
  const alt = altMatch ? altMatch[2] : '';
  return `<img src="${src.replace(/"/g, '&quot;')}" alt="${String(alt).replace(/"/g, '&quot;')}" loading="lazy" />`;
}

function slotFigureHtml(slot, url, alt = '') {
  const safeAlt = String(alt || '').replace(/"/g, '');
  const safeUrl = String(url || '').replace(/"/g, '&quot;');
  return `<figure data-blog-image="${slot}"><img src="${safeUrl}" alt="${safeAlt}" loading="lazy" /></figure>`;
}

/**
 * Inserta o sustituye la imagen 1, 2 o 3 dentro del HTML del artículo/noticia.
 * @param {string} html
 * @param {1 | 2 | 3} slot
 * @param {string} url
 * @param {string} [alt]
 */
export function upsertBlogSlotImage(html, slot, url, alt = '') {
  const index = Number(slot);
  if (![1, 2, 3].includes(index) || !url) return String(html || '');
  const figure = slotFigureHtml(index, url, alt);
  const raw = String(html || '');
  const marked = new RegExp(
    `<figure\\b[^>]*data-blog-image=["']${index}["'][^>]*>[\\s\\S]*?<\\/figure>`,
    'i',
  );
  if (marked.test(raw)) return raw.replace(marked, figure);

  const figures = [...raw.matchAll(/<figure\b[\s\S]*?<\/figure>/gi)];
  const existing = figures[index - 1];
  if (existing && typeof existing.index === 'number') {
    const start = existing.index;
    return `${raw.slice(0, start)}${figure}${raw.slice(start + existing[0].length)}`;
  }

  const spacer = raw.trim() ? '<div><br /></div>' : '';
  return `${raw}${spacer}${figure}`;
}

/**
 * Sanitiza HTML de artículos del blog (lista blanca básica).
 * @param {string} html
 */
export function sanitizeBlogHtml(html = '') {
  const input = String(html || '').trim();
  if (!input) return '';

  let output = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  output = output.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (match.startsWith('</')) return `</${tag}>`;
    if (tag === 'img') return sanitizeImage(match);
    if (tag === 'a') return sanitizeAnchor(match);
    if (tag === 'span') return sanitizeSpan(match);
    if (tag === 'br') return '<br />';
    if (tag === 'div') return '<div>';
    return stripDangerousAttributes(match.replace(/\s+/g, ' '));
  });

  return output.trim();
}

/**
 * Convierte texto plano legacy a párrafos HTML.
 * @param {string} content
 */
export function normalizeBlogContent(content = '') {
  const raw = String(content || '').trim();
  if (!raw) return '';
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeBlogHtml(raw);
  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('\n');
}

export function blogSeoTitle(article) {
  return String(article?.seo_title || article?.title || '').trim();
}

export function blogSeoDescription(article) {
  return String(article?.seo_description || article?.excerpt || '').trim();
}

export function blogOgImage(article) {
  return (
    String(article?.og_image_url || article?.cover_image_url || '').trim() || null
  );
}

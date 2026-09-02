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
  'aside',
]);

const ALLOWED_BLOG_CLASSES = new Set([
  'blog-callout',
  'blog-callout__kicker',
  'blog-callout__media',
  'blog-callout__content',
  'blog-callout__mascot',
]);

const BLOG_CALLOUT_MASCOT_SRC = '/mascot/6.png';

function calloutMediaHtml() {
  return `<div class="blog-callout__media"><img class="blog-callout__mascot" src="${BLOG_CALLOUT_MASCOT_SRC}" alt="" /></div>`;
}

function wrapCalloutInner(inner) {
  return `${calloutMediaHtml()}<div class="blog-callout__content">${inner}</div>`;
}

/** HTML de caja destacada Dralo para insertar desde el editor. */
export const BLOG_CALLOUT_TEMPLATE = `<div class="blog-callout">${wrapCalloutInner(
  '<p class="blog-callout__kicker">Destacado</p><p>Escribe aquí el contenido destacado.</p>',
)}</div>`;

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
  const classMatch = tagHtml.match(/\sclass\s*=\s*(['"])(.*?)\1/i);
  const isMascot =
    classMatch?.[2]?.split(/\s+/).includes('blog-callout__mascot') &&
    src === BLOG_CALLOUT_MASCOT_SRC;
  const classAttr = isMascot ? ' class="blog-callout__mascot"' : '';
  return `<img src="${src.replace(/"/g, '&quot;')}" alt="${String(alt).replace(/"/g, '&quot;')}" loading="lazy"${classAttr} />`;
}

function getSafeBlogClassAttr(tagHtml) {
  const classMatch = tagHtml.match(/\sclass\s*=\s*(['"])(.*?)\1/i);
  if (!classMatch) return '';
  const safe = classMatch[2]
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => ALLOWED_BLOG_CLASSES.has(c));
  return safe.length ? ` class="${safe.join(' ')}"` : '';
}

function sanitizeOpeningTag(tag, match) {
  if (tag === 'img') return sanitizeImage(match);
  if (tag === 'a') return sanitizeAnchor(match);
  if (tag === 'span') return sanitizeSpan(match);
  if (tag === 'br') return '<br />';
  if (tag === 'aside') {
    const cls = getSafeBlogClassAttr(match);
    return cls.includes('blog-callout') ? `<div${cls}>` : '';
  }
  if (tag === 'p') {
    const cls = getSafeBlogClassAttr(match);
    return cls ? `<p${cls}>` : '<p>';
  }
  if (tag === 'div') {
    const cls = getSafeBlogClassAttr(match);
    return cls ? `<div${cls}>` : '<div>';
  }
  return stripDangerousAttributes(match.replace(/\s+/g, ' '));
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

function isInsideBlogCallout(before) {
  const lastCallout = before.lastIndexOf('<div class="blog-callout"');
  if (lastCallout === -1) return false;
  const afterCallout = before.slice(lastCallout);
  const opens = (afterCallout.match(/<div\b/gi) || []).length;
  const closes = (afterCallout.match(/<\/div>/gi) || []).length;
  return opens > closes;
}

/** Convierte <figure> sin imagen (artefacto del editor) en párrafos normales. */
function repairSpuriousFigures(html = '') {
  return String(html).replace(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi, (match, inner) => {
    if (/<img\b/i.test(inner)) return match;
    const trimmed = inner.trim();
    if (!trimmed || /^<br\s*\/?>$/i.test(trimmed)) return '<div><br /></div>';
    if (/^<(p|h[2-4]|ul|ol|blockquote|div)\b/i.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  });
}

function findMatchingCloseDiv(html, openIdx) {
  let depth = 0;
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = openIdx;
  let match = re.exec(html);
  while (match) {
    if (match[1] === '/') {
      depth -= 1;
      if (depth === 0) return match.index;
    } else {
      depth += 1;
    }
    match = re.exec(html);
  }
  return -1;
}

function upgradeLegacyCallouts(html = '') {
  const marker = '<div class="blog-callout">';
  let result = '';
  let cursor = 0;
  let idx = html.indexOf(marker);

  while (idx !== -1) {
    result += html.slice(cursor, idx);
    const closeIdx = findMatchingCloseDiv(html, idx);
    if (closeIdx === -1) {
      result += html.slice(idx);
      return result;
    }

    const inner = html.slice(idx + marker.length, closeIdx);
    if (inner.includes('blog-callout__media')) {
      result += html.slice(idx, closeIdx + 6);
    } else {
      result += `${marker}${wrapCalloutInner(inner.trim())}</div>`;
    }

    cursor = closeIdx + 6;
    idx = html.indexOf(marker, cursor);
  }

  return result + html.slice(cursor);
}

function repairOrphanCalloutKickers(html = '') {
  const kickerRe = /<p class="blog-callout__kicker">[\s\S]*?<\/p>/gi;
  let result = html;
  let match = kickerRe.exec(result);

  while (match) {
    const idx = match.index;
    if (!isInsideBlogCallout(result.slice(0, idx))) {
      const after = result.slice(idx + match[0].length);
      const bodyMatch = after.match(
        /^\s*<p(?![^>]*blog-callout__kicker)[^>]*>[\s\S]*?<\/p>/i,
      );
      if (bodyMatch) {
        const callout = `<div class="blog-callout">${wrapCalloutInner(
          match[0] + bodyMatch[0],
        )}</div>`;
        result =
          result.slice(0, idx) +
          callout +
          result.slice(idx + match[0].length + bodyMatch[0].length);
        kickerRe.lastIndex = idx + callout.length;
        match = kickerRe.exec(result);
        continue;
      }
    }
    match = kickerRe.exec(result);
  }

  return result;
}

/** Repara cajas Destacado rotas o en formato legacy (aside / solo kicker). */
function repairBlogCallouts(html = '') {
  let output = String(html)
    .replace(/<aside class="blog-callout">/gi, '<div class="blog-callout">')
    .replace(/<\/aside>/gi, '</div>');

  output = upgradeLegacyCallouts(output);
  return repairOrphanCalloutKickers(output);
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
    if (match.startsWith('</')) {
      if (tag === 'aside') return '</div>';
      return `</${tag}>`;
    }
    return sanitizeOpeningTag(tag, match);
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
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    const repaired = repairBlogCallouts(repairSpuriousFigures(raw));
    return sanitizeBlogHtml(repaired);
  }
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

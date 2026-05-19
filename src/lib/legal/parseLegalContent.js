/** Títulos oficiales que marcan el inicio del texto publicable (sin borradores previos). */
const OFFICIAL_START_MARKERS = [
  'POLÍTICA DE PRIVACIDAD',
  'POLITICA DE PRIVACIDAD',
  'POLÍTICA DE COOKIES',
  'POLITICA DE COOKIES',
  'POLÍTICA DE REEMBOLSOS',
  'POLITICA DE REEMBOLSOS',
  'TÉRMINOS Y CONDICIONES',
  'TERMINOS Y CONDICIONES',
  'AVISO LEGAL',
  'NORMAS DE COMUNIDAD',
  'TEXTOS CORTOS',
];

/**
 * Elimina texto de borrador anterior al título oficial del documento.
 */
export function stripLegalPreamble(raw) {
  if (!raw) return '';
  let text = raw.trim();
  for (const marker of OFFICIAL_START_MARKERS) {
    const idx = text.indexOf(marker);
    if (idx >= 0) {
      text = text.slice(idx);
      break;
    }
  }
  return text;
}

/**
 * Extrae fecha de actualización si aparece tras el título.
 */
export function extractLastUpdated(text) {
  const match = text.match(/Última actualización:\s*(\d{2}\/\d{2}\/\d{4})/i);
  return match ? match[1] : null;
}

/**
 * Divide el cuerpo legal en secciones numeradas (1. Título …).
 */
export function parseNumberedSections(text) {
  const body = stripLegalPreamble(text);
  const updatedAt = extractLastUpdated(body);

  let intro = body;
  const sections = [];

  const sectionRegex = /(\d+)\.\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g;
  const matches = [...body.matchAll(sectionRegex)];

  if (matches.length === 0) {
    return { updatedAt, intro: body, sections: [] };
  }

  const firstIndex = matches[0].index;
  intro = body.slice(0, firstIndex).trim();

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index;
    const end = next ? next.index : body.length;
    const chunk = body.slice(start, end).trim();
    const headerMatch = chunk.match(
      /^(\d+)\.\s+(.+?)(?=[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ])/s,
    );
    const num = Number(current[1]);
    const heading = headerMatch
      ? headerMatch[2].trim()
      : chunk.replace(/^\d+\.\s+/, '').slice(0, 80).trim();
    const sectionBody = headerMatch
      ? chunk.slice(headerMatch[0].length).trim()
      : chunk.replace(/^\d+\.\s+/, '').trim();

    sections.push({
      number: num,
      title: `${num}. ${heading}`,
      body: sectionBody,
    });
  }

  return { updatedAt, intro, sections };
}

/**
 * Convierte secciones a HTML seguro (solo párrafos y listas simples).
 */
export function sectionsToHtml(sections) {
  return sections
    .map((s) => {
      const paragraphs = s.body
        .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜ0-9])/)
        .map((p) => p.trim())
        .filter(Boolean);
      const inner = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
      return `<section><h2>${escapeHtml(s.title)}</h2>${inner}</section>`;
    })
    .join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function introToParagraphs(intro) {
  const clean = intro
    .replace(/Última actualización:\s*\d{2}\/\d{2}\/\d{4}/i, '')
    .replace(/^POL[IÍ]TICA DE [^.]+/i, '')
    .replace(/^AVISO LEGAL/i, '')
    .replace(/^NORMAS DE COMUNIDAD/i, '')
    .replace(/^T[EÉ]RMINOS Y CONDICIONES[^.]*\.?/i, '')
    .trim();

  if (!clean) return [];

  return clean
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
}

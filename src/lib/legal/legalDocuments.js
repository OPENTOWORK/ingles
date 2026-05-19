import politicaPrivacidad from '@/data/legal/politica-privacidad-dralo.json';
import politicaCookies from '@/data/legal/politica-cookies.json';
import terminos from '@/data/legal/terminos-y-condiciones-de-uso.json';
import avisoLegal from '@/data/legal/aviso-legal-dralo.json';
import normasComunidad from '@/data/legal/normas-de-comunidad.json';
import politicaReembolsos from '@/data/legal/politica-de-reembolsos.json';
import textosFormularios from '@/data/legal/textos-cortos-formularios.json';
import {
  introToParagraphs,
  parseNumberedSections,
  stripLegalPreamble,
} from '@/lib/legal/parseLegalContent';

/** Configuración de documentos legales publicados en DRALO. */
export const LEGAL_DOCUMENTS = {
  'politica-privacidad': {
    slug: 'politica-privacidad',
    title: 'Política de privacidad',
    category: 'privacidad',
    footerLabel: 'Política de privacidad',
    order: 1,
    source: politicaPrivacidad,
  },
  'politica-cookies': {
    slug: 'politica-cookies',
    title: 'Política de cookies',
    category: 'privacidad',
    footerLabel: 'Política de cookies',
    order: 2,
    source: politicaCookies,
  },
  'terminos-condiciones': {
    slug: 'terminos-condiciones',
    title: 'Términos y condiciones de uso',
    category: 'legal',
    footerLabel: 'Términos y condiciones',
    order: 3,
    source: terminos,
  },
  'proteccion-datos': {
    slug: 'proteccion-datos',
    title: 'Protección de datos',
    category: 'privacidad',
    footerLabel: 'Protección de datos',
    order: 4,
    /** Subconjunto de la política de privacidad (derechos, seguridad, menores). */
    sectionNumbers: [11, 12, 13, 14, 15, 16, 17],
    parentSlug: 'politica-privacidad',
    source: politicaPrivacidad,
  },
  'aviso-legal': {
    slug: 'aviso-legal',
    title: 'Aviso legal',
    category: 'legal',
    footerLabel: 'Aviso legal',
    order: 5,
    source: avisoLegal,
  },
  'normas-comunidad': {
    slug: 'normas-comunidad',
    title: 'Normas de comunidad',
    category: 'comunidad',
    footerLabel: 'Normas de comunidad',
    order: 6,
    source: normasComunidad,
  },
  'politica-reembolsos': {
    slug: 'politica-reembolsos',
    title: 'Política de reembolsos',
    category: 'comercial',
    footerLabel: 'Política de reembolsos',
    order: 7,
    source: politicaReembolsos,
  },
};

export const FORM_LEGAL_SNIPPETS = parseFormSnippets(textosFormularios.content);

function parseFormSnippets(raw) {
  const text = stripLegalPreamble(raw);
  const snippets = {};

  const registroMatch = text.match(
    /Al crear una cuenta[^.]*\.[^.]*\./i,
  );
  if (registroMatch) snippets.registration = registroMatch[0].trim();

  const marketingMatch = text.match(
    /Quiero recibir comunicaciones comerciales[^.]*\./i,
  );
  if (marketingMatch) snippets.marketing = marketingMatch[0].trim();

  const contactoMatch = text.match(
    /Trataremos tus datos para responder[^.]*\./i,
  );
  if (contactoMatch) snippets.contact = contactoMatch[0].trim();

  return snippets;
}

export function getLegalDocument(slug) {
  const config = LEGAL_DOCUMENTS[slug];
  if (!config) return null;

  const parsed = parseNumberedSections(config.source.content);
  let sections = parsed.sections;

  if (config.sectionNumbers?.length) {
    sections = sections.filter((s) => config.sectionNumbers.includes(s.number));
  }

  const introParagraphs = config.sectionNumbers?.length
    ? [
        'En Dralo tratamos tus datos personales conforme al Reglamento General de Protección de Datos (RGPD) y la normativa española aplicable. A continuación encontrarás información sobre conservación, menores, derechos y seguridad.',
      ]
    : introToParagraphs(parsed.intro);

  return {
    slug: config.slug,
    title: config.title,
    category: config.category,
    updatedAt: parsed.updatedAt,
    introParagraphs,
    sections,
    rawIntro: parsed.intro,
  };
}
export function getFooterLegalLinks() {
  return Object.values(LEGAL_DOCUMENTS)
    .sort((a, b) => a.order - b.order)
    .map((doc) => ({
      href: `/${doc.slug}`,
      label: doc.footerLabel,
      category: doc.category,
    }));
}

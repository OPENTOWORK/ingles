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
      title: heading,
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

const LEGAL_FIELD_LABELS = [
  'Titular',
  'CIF',
  'Domicilio',
  'Nombre comercial',
  'Email de contacto',
  'Correo electrónico',
  'Formulario de contacto',
  'Web',
  'Dirección de correo electrónico',
];

/** Separa campos y frases pegadas en el texto legal exportado desde Word. */
export function normalizeLegalSpacing(text) {
  if (!text) return '';

  let normalized = String(text)
    .replace(/–\s*DRALO/i, ' – DRALO')
    .replace(/DRALO(Última actualización)/i, 'DRALO\n$1')
    .replace(/([.!?])([A-ZÁÉÍÓÚÜÁÉÍÓÚÜ0-9])/g, '$1 $2')
    .replace(/(\d)([A-ZÁÉÍÓÚÜÁÉÍÓÚÜ])/g, '$1 $2')
    .replace(/([a-záéíóúüñ])([A-ZÁÉÍÓÚÜ][a-záéíóúüñ])/g, '$1 $2');

  for (const label of LEGAL_FIELD_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`([^\\n\\s])\\s*(${escaped}:)`, 'gi');
    normalized = normalized.replace(re, '$1\n$2');
  }

  normalized = normalized
    .replace(/([^\s\n])(Email de contacto:)/gi, '$1\n$2')
    .replace(/([^\s\n])(Nombre comercial:)/gi, '$1\n$2')
    .replace(/([^\s\n])(Formulario de contacto:)/gi, '$1\n$2')
    .replace(/([^\s\n.])(Web:)/gi, '$1\n$2')
    .replace(/:\s*(?=[A-ZÁÉÍÓÚÜÁÉÍÓÚÜ])/g, ': ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized;
}

function parseStructuredFields(text) {
  const normalized = normalizeLegalSpacing(text);
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  const fields = [];
  const paragraphs = [];

  for (const line of lines) {
    const fieldMatch = line.match(/^([^:]{2,50}):\s*(.+)$/);
    const label = fieldMatch?.[1]?.trim() || '';
    const isFieldLabel =
      fieldMatch
      && !label.includes('.')
      && !/^https?$/i.test(label)
      && (LEGAL_FIELD_LABELS.some((item) => label.toLowerCase() === item.toLowerCase())
        || /^(titular|cif|domicilio|web|email|correo|nombre comercial|formulario)/i.test(label));

    if (isFieldLabel) {
      fields.push({
        term: `${label}:`,
        description: fieldMatch[2].trim().replace(/\s+-\s*$/, ''),
      });
      continue;
    }

    paragraphs.push(line);
  }

  if (fields.length < 2) return null;

  fields.forEach((field, index) => {
    const remainderMatch = field.description.match(
      /^(.+?)\s+((?:Dralo se encuentra|Antes del lanzamiento|La plataforma|El acceso|Los presentes|Al acceder).+)$/i,
    );
    if (remainderMatch) {
      fields[index] = {
        ...field,
        description: remainderMatch[1].replace(/\s+-\s*$/, '').trim(),
      };
      paragraphs.unshift(remainderMatch[2].trim());
    }
  });

  const blocks = [{ type: 'definitions', entries: fields }];
  paragraphs.forEach((paragraph) => {
    splitLongParagraphs(paragraph).forEach((part) => {
      blocks.push({ type: 'paragraph', text: part });
    });
  });
  return blocks;
}

export function introToParagraphs(intro) {
  let clean = normalizeLegalSpacing(intro)
    .replace(/^POL[IÍ]TICA DE PRIVACIDAD\s*/i, '')
    .replace(/^POL[IÍ]TICA DE COOKIES\s*/i, '')
    .replace(/^POL[IÍ]TICA DE REEMBOLSOS\s*/i, '')
    .replace(/^T[EÉ]RMINOS Y CONDICIONES DE USO[^.\n]*\.?\s*/i, '')
    .replace(/^AVISO LEGAL\s*/i, '')
    .replace(/^NORMAS DE COMUNIDAD\s*/i, '')
    .replace(/Última actualización:\s*\d{2}\/\d{2}\/\d{4}\s*/i, '')
    .trim();

  if (!clean) return [];

  return splitLongParagraphs(clean).filter((paragraph) => paragraph.length > 20);
}

function splitLongParagraphs(text) {
  return normalizeLegalSpacing(text)
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜÁÉÍÓÚÜ])/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function injectBodyBreaks(text) {
  return normalizeLegalSpacing(text)
    .replace(/:\s*(Derecho )/g, ':\n$1')
    .replace(/([.!?])\s+(Derecho (?:de|a) )/g, '$1\n$2')
    .replace(/([.!?])\s+([a-z]\))/gi, '$1\n$2')
    .replace(/([.!?])\s+(Los datos )/g, '$1\n$2')
    .replace(
      /([.!?])\s+((?:utilizar|intentar|introducir|vulnerar|copiar|extraer|reproducir|distribuir|transformar|comunicar)\s)/gi,
      '$1\n$2',
    )
    .replace(
      /([.!?])\s+((?:textos|diseños|logotipos|marcas|ejercicios|recursos|código|bases de datos|interfaces|imágenes|materiales)\s)/gi,
      '$1\n$2',
    )
    .replace(/([.!?])\s+(Proveedor |Herramientas |Pasarelas |También podremos|Email:|Web:)/g, '$1\n$2')
    .replace(/([.!?])\s+(La persona usuaria|El acceso|Dralo podrá|No se permite|Si eres|Si Dralo|Cuando Dralo|En particular|Para ejercer|Podrás |Puedes )/g, '$1\n$2');
}

function parseColonListBlock(text) {
  const colonIdx = text.indexOf(':');
  if (colonIdx === -1) return null;
  if (/FinalidadDatos tratadosBase jurídica/i.test(text)) return null;

  const intro = text.slice(0, colonIdx + 1).trim();
  const rest = text.slice(colonIdx + 1).trim();
  if (intro.length > 120 || !rest.includes(',') || rest.split('.').length > 2) return null;

  const items = rest
    .split(/,\s*(?=[a-záéíóúüñ])/)
    .map((item) => item.replace(/\.\s*$/, '').trim())
    .filter((item) => item.length > 3 && item.length < 120);

  if (items.length < 2) return null;

  return [
    { type: 'paragraph', text: intro },
    { type: 'list', items },
  ];
}

const PRIVACY_FINALIDADES_TABLE = [
  {
    purpose: 'Crear y gestionar cuentas de usuario',
    data: 'Nombre, email, credenciales, datos de cuenta',
    legalBasis: 'Ejecución de la relación con el usuario y aceptación de los términos de uso',
  },
  {
    purpose: 'Permitir el uso de la plataforma educativa',
    data: 'Datos de cuenta, progreso, ejercicios, respuestas, nivel, actividad',
    legalBasis: 'Ejecución del servicio solicitado',
  },
  {
    purpose: 'Ofrecer ejercicios, correcciones y asistencia interactiva',
    data: 'Respuestas, mensajes, interacciones, datos académicos',
    legalBasis: 'Ejecución del servicio y, en su caso, consentimiento cuando se usen funciones opcionales',
  },
  {
    purpose: 'Responder consultas y solicitudes',
    data: 'Datos de contacto y contenido del mensaje',
    legalBasis: 'Consentimiento del usuario al enviar la consulta y/o interés legítimo en atender la solicitud',
  },
  {
    purpose: 'Gestionar descargas de recursos',
    data: 'Nombre, email, recurso solicitado, registro de descarga',
    legalBasis: 'Consentimiento o ejecución de la solicitud realizada por el usuario',
  },
  {
    purpose: 'Enviar comunicaciones comerciales o informativas',
    data: 'Email, consentimiento, preferencias',
    legalBasis: 'Consentimiento del usuario',
  },
  {
    purpose: 'Analizar el uso de la web y mejorar la plataforma',
    data: 'Datos técnicos, navegación, estadísticas, cookies',
    legalBasis: 'Consentimiento para cookies analíticas y/o interés legítimo en métricas agregadas no intrusivas',
  },
  {
    purpose: 'Garantizar la seguridad de la web',
    data: 'IP, logs, registros técnicos, actividad sospechosa',
    legalBasis: 'Interés legítimo en proteger la plataforma y prevenir abusos',
  },
  {
    purpose: 'Gestionar pagos y facturación, cuando se habiliten',
    data: 'Datos de compra, pago, facturación, transacción',
    legalBasis: 'Ejecución contractual y cumplimiento de obligaciones legales',
  },
  {
    purpose: 'Cumplir obligaciones legales',
    data: 'Datos necesarios según la obligación aplicable',
    legalBasis: 'Cumplimiento de obligaciones legales',
  },
];

function parseDefinitionLine(line) {
  const match = line.match(/^(Derecho (?:de|a) [^:]+:)\s*(.*)$/s);
  if (!match) return null;
  return {
    term: match[1].trim(),
    description: match[2].trim(),
  };
}

/**
 * Convierte el cuerpo de una sección en bloques legibles (párrafos, listas, definiciones).
 * @returns {{ type: string, text?: string, items?: string[], entries?: { term: string, description: string }[], columns?: string[], rows?: object[] }[]}
 */
export function parseBodyBlocks(body, options = {}) {
  if (!body?.trim()) return [];

  const { sectionNumber } = options;

  if (sectionNumber === 4 && /FinalidadDatos tratadosBase jurídica/i.test(body)) {
    return [
      {
        type: 'paragraph',
        text: 'Tratamos los datos personales para las siguientes finalidades:',
      },
      {
        type: 'table',
        columns: ['Finalidad', 'Datos tratados', 'Base jurídica'],
        rows: PRIVACY_FINALIDADES_TABLE,
      },
    ];
  }

  const structuredFields = parseStructuredFields(body.trim());
  if (structuredFields) return structuredFields;

  const colonBlocks = parseColonListBlock(normalizeLegalSpacing(body.trim()));
  if (colonBlocks) return colonBlocks;

  const normalized = injectBodyBreaks(body.trim());
  const segments = normalized
    .split('\n')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const blocks = [];
  let listItems = [];
  let definitionItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: 'list', items: [...listItems] });
    listItems = [];
  };

  const flushDefinitions = () => {
    if (definitionItems.length === 0) return;
    blocks.push({ type: 'definitions', entries: [...definitionItems] });
    definitionItems = [];
  };

  for (const segment of segments) {
    if (/^[a-z]\)\s/i.test(segment)) {
      flushList();
      flushDefinitions();
      blocks.push({ type: 'subheading', text: segment });
      continue;
    }

    const definition = parseDefinitionLine(segment);
    if (definition) {
      flushList();
      definitionItems.push(definition);
      continue;
    }

    flushDefinitions();

    if (
      segment.length < 220
      && (
        /^(?:Los datos |Proveedor |Herramientas |Pasarelas |utilizar |intentar |introducir |textos|diseños|logotipos|marcas|ejercicios|recursos|código|interfaces|imágenes|materiales)/i.test(segment)
        || (/^[a-záéíóúüñ]/.test(segment) && !/^[A-ZÁÉÍÓÚÜÑ]{2,}/.test(segment.slice(0, 8)))
      )
    ) {
      listItems.push(segment.replace(/\.\s*$/, '').trim());
      continue;
    }

    flushList();
    splitLongParagraphs(segment).forEach((paragraph) => {
      blocks.push({ type: 'paragraph', text: paragraph });
    });
  }

  flushList();
  flushDefinitions();

  if (blocks.length === 0) {
    return [{ type: 'paragraph', text: body.trim() }];
  }

  return blocks;
}

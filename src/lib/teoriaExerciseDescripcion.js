import { normalizeTopicHref } from '@/lib/normalizeTopicHref';

/** Separador entre metadatos de unidad y texto para el alumno. */
export const TEORIA_UNIT_META_SEP = ' · ';

/**
 * Metadatos de unidad al inicio de `descripcion` (obligatorio para vincular el ejercicio al tema).
 */
export function buildTeoriaUnitMetaDescripcion({
  topicHref,
  theoryPartLabel,
  tipoLabel,
  nivelNombre,
  skillNombre,
  topicHint = '',
}) {
  const href = normalizeTopicHref(topicHref);
  return [
    href,
    theoryPartLabel,
    tipoLabel,
    nivelNombre ? `Nivel ${String(nivelNombre).toUpperCase()}` : null,
    skillNombre,
    topicHint?.trim() || null,
  ]
    .filter(Boolean)
    .join(TEORIA_UNIT_META_SEP);
}

/**
 * `descripcion` completa: metadatos + instrucción opcional para el alumno.
 */
export function buildTeoriaPreguntaDescripcion(metaDesc, studentInstruction = '') {
  const instruction = String(studentInstruction || '').trim();
  if (!instruction || instruction.includes(normalizeTopicHref(metaDesc.split(TEORIA_UNIT_META_SEP)[0]))) {
    return metaDesc;
  }
  return `${metaDesc} | ${instruction}`;
}

const TOPIC_HREF_RE = /(\/teoria\/[^\s·|]+)/;

/** @param {string | null | undefined} descripcion */
export function parseTopicHrefFromTeoriaDescripcion(descripcion) {
  const raw = String(descripcion || '');
  const match = raw.match(TOPIC_HREF_RE);
  return match ? normalizeTopicHref(match[1]) : null;
}

/** Instrucción para el alumno (tras el separador ` | `). */
export function parseStudentInstructionFromTeoriaDescripcion(descripcion) {
  const raw = String(descripcion || '');
  const pipe = raw.indexOf(' | ');
  if (pipe === -1) {
    const parts = raw.split(TEORIA_UNIT_META_SEP);
    if (parts.length > 4) return parts.slice(4).join(TEORIA_UNIT_META_SEP).trim();
    return '';
  }
  return raw.slice(pipe + 3).trim();
}

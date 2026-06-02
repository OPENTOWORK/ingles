/**
 * Tipos de pregunta en `levels_teoria_tipos_preguntas` (BD).
 * Define si el ejercicio usa respuestas cerradas o abiertas.
 */

/** @param {{ Nombre?: string, Descripcion?: string } | null} tipo */
export function parseTeoriaTipoNumber(tipo) {
  const match = String(tipo?.Nombre || tipo?.Descripcion || '').match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

/** Tipos que guardan filas en levels_teoria_respuestas_abiertas. */
const OPEN_TIPO_NUMBERS = new Set([4, 5, 6, 8, 9]);

/** @param {{ Nombre?: string, Descripcion?: string } | null} tipo */
export function isTeoriaTipoOpen(tipo) {
  const n = parseTeoriaTipoNumber(tipo);
  if (n == null) return false;
  return OPEN_TIPO_NUMBERS.has(n);
}

export function teoriaTipoLabel(tipo) {
  const nombre = String(tipo?.Nombre || '').trim();
  const desc = String(tipo?.Descripcion || '').trim();
  if (nombre && desc) return `${nombre} — ${desc}`;
  return nombre || desc || 'Tipo desconocido';
}

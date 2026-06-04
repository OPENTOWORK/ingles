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

/** Nombre corto y comercial para la UI (banner Dralo Sprint, etc.). */
export const TEORIA_TIPO_COLLOQUIAL = {
  1: 'Pick the word',
  2: 'True or false?',
  3: 'Odd one out',
  4: 'Synonym hunt',
  5: 'Antonym flip',
  6: 'Best title',
  7: 'Sounds right?',
  8: 'Fill the gaps',
  9: 'Spot the mistake',
  10: 'Extra word',
  11: 'Best sentence',
  12: 'Rebuild the sentence',
  13: 'Match the meaning',
  15: 'Q & A match',
  16: 'Picture match',
};

/** @param {{ Nombre?: string, Descripcion?: string } | null} tipo */
export function teoriaTipoColloquialLabel(tipo) {
  const n = parseTeoriaTipoNumber(tipo);
  if (n != null && TEORIA_TIPO_COLLOQUIAL[n]) return TEORIA_TIPO_COLLOQUIAL[n];
  const formal = teoriaTipoLabel(tipo);
  if (formal && formal !== 'Tipo desconocido') return formal;
  return 'Quick challenge';
}

function optionTextLooksTrue(text) {
  const t = String(text || '').toLowerCase();
  if (/false|falso|uncertain|misleading|not true/i.test(t)) return false;
  return /\btrue\b|verdader/i.test(t) || /statement is true/.test(t);
}

function optionTextLooksFalse(text) {
  const t = String(text || '').toLowerCase();
  return /\bfalse\b|fals[oa]/i.test(t) || /statement is false/.test(t);
}

/** Tipo 2 o opciones estilo “statement is true/false…”. */
export function isTeoriaTrueFalseExercise(tipoNum, opciones = []) {
  if (tipoNum === 2) return true;
  const texts = opciones.map((o) => String(o?.text || '').toLowerCase());
  if (texts.length < 2) return false;
  const hasTrue = texts.some(optionTextLooksTrue);
  const hasFalse = texts.some(optionTextLooksFalse);
  const hasStatementStyle = texts.some((t) => /statement is/.test(t));
  return hasStatementStyle || (hasTrue && hasFalse);
}

/**
 * Deja solo True / False y conserva cuál era la correcta en BD.
 * @param {{ text: string, correcta: boolean }[]} opciones
 */
export function normalizeTrueFalseOpciones(opciones) {
  const list = opciones || [];
  const trueOpts = list.filter((o) => optionTextLooksTrue(o.text));
  const falseOpts = list.filter((o) => optionTextLooksFalse(o.text));
  const correctTrue = trueOpts.some((o) => o.correcta);
  const correctFalse = falseOpts.some((o) => o.correcta);

  if (!correctTrue && !correctFalse) {
    const marked = list.find((o) => o.correcta);
    if (marked && optionTextLooksFalse(marked.text)) {
      return [
        { text: 'True', correcta: false },
        { text: 'False', correcta: true },
      ];
    }
    return [
      { text: 'True', correcta: true },
      { text: 'False', correcta: false },
    ];
  }

  return [
    { text: 'True', correcta: correctTrue },
    { text: 'False', correcta: correctFalse },
  ];
}

/**
 * @param {number|null|undefined} tipoNum
 * @param {{ text: string, correcta: boolean }[]} opciones
 */
export function normalizeTeoriaClosedOpciones(tipoNum, opciones) {
  if (!isTeoriaTrueFalseExercise(tipoNum, opciones)) return opciones;
  return normalizeTrueFalseOpciones(opciones);
}

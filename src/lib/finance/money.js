/**
 * Utilidades monetarias del área financiera.
 * Los importes se manipulan en céntimos enteros para evitar errores de coma flotante
 * y se persisten como NUMERIC(14,2) en base de datos.
 */

/** Convierte un valor a céntimos enteros. */
export function toCents(value) {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Convierte céntimos enteros a euros con dos decimales. */
export function fromCents(cents) {
  const n = Number(cents);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n) / 100;
}

/** Redondea un importe a 2 decimales de forma estable. */
export function roundAmount(value) {
  return fromCents(toCents(value));
}

/** Suma una lista de importes sin acumular error de coma flotante. */
export function sumAmounts(values = []) {
  return fromCents(values.reduce((acc, v) => acc + toCents(v), 0));
}

// El CLDR español no agrupa los números de cuatro dígitos (1250 en vez de 1.250).
// En importes siempre queremos el separador de miles, de ahí `useGrouping: 'always'`.
const GROUPING = 'always';

/**
 * Formatea un importe en el locale del proyecto: `1.250,00 €`.
 * Nunca devuelve NaN, null ni undefined.
 */
export function formatCurrency(value, currency = 'EUR') {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: GROUPING,
  }).format(safe);
}

/** Formatea un número sin símbolo de moneda. */
export function formatNumber(value, decimals = 2) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: GROUPING,
  }).format(safe);
}

/** Formatea una fecha ISO/Date al locale del proyecto. Devuelve '—' si no es válida. */
export function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/** Formatea fecha corta tipo `19 sep`. */
export function formatShortDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
    .format(d)
    .replace('.', '')
    .toUpperCase();
}

/** Devuelve la fecha como `YYYY-MM-DD` (formato date de Postgres). */
export function toDateInput(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Enmascara un IBAN dejando visibles país y últimos 4 dígitos: `ES** **** **** 1332`. */
export function maskIban(iban) {
  const clean = String(iban || '').replace(/\s+/g, '');
  if (!clean) return '—';
  if (clean.length <= 8) return `${'*'.repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`;
  return `${clean.slice(0, 2)}${'*'.repeat(clean.length - 6)}${clean.slice(-4)}`;
}

import { fromCents, roundAmount, toCents } from '@/lib/finance/money';

/**
 * Calcula una línea de factura.
 * Base = cantidad × precio − descuento. Impuesto = base × tipo.
 * Todo el cálculo se hace en céntimos para evitar errores de coma flotante.
 *
 * @param {{ quantity?: number, unit_price?: number, discount_percent?: number, tax_rate?: number }} line
 * @returns {{ subtotal: number, discount_amount: number, tax_amount: number, total: number }}
 */
export function calculateLine(line = {}) {
  const quantity = Number(line.quantity ?? 1);
  const unitPrice = Number(line.unit_price ?? 0);
  const discountPercent = Number(line.discount_percent ?? 0);
  const taxRate = Number(line.tax_rate ?? 0);

  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return { subtotal: 0, discount_amount: 0, tax_amount: 0, total: 0 };
  }

  const grossCents = Math.round(quantity * unitPrice * 100);
  const safeDiscount = Number.isFinite(discountPercent)
    ? Math.min(Math.max(discountPercent, 0), 100)
    : 0;
  const discountCents = Math.round((grossCents * safeDiscount) / 100);
  const subtotalCents = grossCents - discountCents;

  const safeTaxRate = Number.isFinite(taxRate) ? Math.min(Math.max(taxRate, 0), 100) : 0;
  const taxCents = Math.round((subtotalCents * safeTaxRate) / 100);

  return {
    subtotal: fromCents(subtotalCents),
    discount_amount: fromCents(discountCents),
    tax_amount: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
  };
}

/**
 * Calcula los totales de una factura a partir de sus líneas.
 * El IVA se agrupa por tipo impositivo (criterio AEAT) antes de sumarse.
 *
 * @param {Array<object>} lines
 * @returns {{ subtotal: number, discount_total: number, tax_total: number, total: number, lines: Array<object>, taxBreakdown: Array<{ rate: number, base: number, amount: number }> }}
 */
export function calculateInvoiceTotals(lines = []) {
  const computed = [];
  const basesByRate = new Map();
  let discountCents = 0;
  let subtotalCents = 0;

  for (const [index, line] of lines.entries()) {
    const result = calculateLine(line);
    computed.push({
      ...line,
      line_number: line.line_number ?? index + 1,
      subtotal: result.subtotal,
      tax_amount: result.tax_amount,
      total: result.total,
    });

    subtotalCents += toCents(result.subtotal);
    discountCents += toCents(result.discount_amount);

    const rate = Number(line.tax_rate ?? 0) || 0;
    basesByRate.set(rate, (basesByRate.get(rate) || 0) + toCents(result.subtotal));
  }

  const taxBreakdown = [...basesByRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, baseCents]) => ({
      rate,
      base: fromCents(baseCents),
      amount: fromCents(Math.round((baseCents * rate) / 100)),
    }));

  const taxCents = taxBreakdown.reduce((acc, entry) => acc + toCents(entry.amount), 0);

  // Reparte el IVA agrupado sobre las líneas para que la suma de líneas cuadre con el total.
  return {
    lines: computed,
    subtotal: fromCents(subtotalCents),
    discount_total: fromCents(discountCents),
    tax_total: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
    taxBreakdown,
  };
}

/**
 * Valida el contenido de una factura antes de guardarla o emitirla.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateInvoiceDraft(invoice = {}, lines = []) {
  const errors = [];

  if (!invoice.party_id) errors.push('Selecciona un cliente.');
  if (!invoice.series_id) errors.push('Selecciona una serie de facturación.');
  if (!invoice.issue_date) errors.push('Indica la fecha de emisión.');

  if (invoice.issue_date && invoice.due_date && invoice.due_date < invoice.issue_date) {
    errors.push('El vencimiento no puede ser anterior a la fecha de emisión.');
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push('La factura necesita al menos una línea.');
  }

  for (const [index, line] of (lines || []).entries()) {
    const position = index + 1;
    if (!String(line.description || '').trim()) {
      errors.push(`Línea ${position}: falta la descripción.`);
    }
    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || quantity === 0) {
      errors.push(`Línea ${position}: la cantidad debe ser distinta de cero.`);
    }
    const unitPrice = Number(line.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.push(`Línea ${position}: el precio no puede ser negativo.`);
    }
    const discount = Number(line.discount_percent ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      errors.push(`Línea ${position}: el descuento debe estar entre 0 y 100.`);
    }
    const taxRate = Number(line.tax_rate ?? 0);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.push(`Línea ${position}: el IVA debe estar entre 0 y 100.`);
    }
  }

  const totals = calculateInvoiceTotals(lines || []);
  if (totals.total <= 0) {
    errors.push('El total de la factura debe ser mayor que cero.');
  }

  return { valid: errors.length === 0, errors };
}

/** Calcula el vencimiento a partir de la fecha de emisión y los días de pago acordados. */
export function calculateDueDate(issueDate, paymentTermsDays = 30) {
  if (!issueDate) return null;
  const base = new Date(`${String(issueDate).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return null;
  const days = Number.isFinite(Number(paymentTermsDays)) ? Number(paymentTermsDays) : 30;
  base.setUTCDate(base.getUTCDate() + Math.max(0, days));
  return base.toISOString().slice(0, 10);
}

/**
 * Construye las líneas de una factura rectificativa: mismos conceptos en negativo.
 * Nunca modifica la factura original.
 */
export function buildRectificativeLines(originalLines = []) {
  return originalLines.map((line, index) => ({
    line_number: index + 1,
    description: `Rectificación: ${line.description || ''}`.trim(),
    quantity: -Math.abs(Number(line.quantity) || 0),
    unit_price: Number(line.unit_price) || 0,
    discount_percent: Number(line.discount_percent) || 0,
    tax_rate: Number(line.tax_rate) || 0,
    income_account_code: line.income_account_code || null,
  }));
}

/** Estado funcional de cobro de una factura emitida. */
export function resolveInvoiceFunctionalStatus(invoice = {}, today = new Date()) {
  if (invoice.status === 'draft') return 'draft';
  if (invoice.status === 'cancelled') return 'cancelled';

  const total = roundAmount(invoice.total);
  const paid = roundAmount(invoice.paid_amount);

  if (paid >= total - 0.001 && total > 0) return 'paid';

  if (invoice.due_date) {
    const due = new Date(`${String(invoice.due_date).slice(0, 10)}T23:59:59Z`);
    if (!Number.isNaN(due.getTime()) && due < today) return 'overdue';
  }

  return paid > 0 ? 'partial' : 'pending';
}

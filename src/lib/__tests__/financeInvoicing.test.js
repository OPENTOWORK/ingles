import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRectificativeLines,
  calculateDueDate,
  calculateInvoiceTotals,
  calculateLine,
  resolveInvoiceFunctionalStatus,
  validateInvoiceDraft,
} from '@/lib/finance/invoiceCalc';
import { formatCurrency, formatDate, maskIban, roundAmount, sumAmounts } from '@/lib/finance/money';

/* ------------------------------------------------------------------ */
/* Cálculo de líneas                                                   */
/* ------------------------------------------------------------------ */

test('calculateLine: base, IVA y total de una línea simple', () => {
  const result = calculateLine({ quantity: 1, unit_price: 10000, tax_rate: 21 });
  assert.equal(result.subtotal, 10000);
  assert.equal(result.tax_amount, 2100);
  assert.equal(result.total, 12100);
});

test('calculateLine: aplica el descuento antes de calcular el impuesto', () => {
  const result = calculateLine({
    quantity: 2,
    unit_price: 500,
    discount_percent: 10,
    tax_rate: 21,
  });
  assert.equal(result.subtotal, 900);
  assert.equal(result.discount_amount, 100);
  assert.equal(result.tax_amount, 189);
  assert.equal(result.total, 1089);
});

test('calculateLine: tipo de IVA cero deja el total igual a la base', () => {
  const result = calculateLine({ quantity: 3, unit_price: 33.33, tax_rate: 0 });
  assert.equal(result.subtotal, 99.99);
  assert.equal(result.tax_amount, 0);
  assert.equal(result.total, 99.99);
});

test('calculateLine: no produce error de coma flotante en precios con decimales', () => {
  const result = calculateLine({ quantity: 3, unit_price: 0.1, tax_rate: 21 });
  assert.equal(result.subtotal, 0.3);
  assert.equal(result.tax_amount, 0.06);
  assert.equal(result.total, 0.36);
});

test('calculateLine: cantidades negativas (abonos) mantienen el signo', () => {
  const result = calculateLine({ quantity: -1, unit_price: 1000, tax_rate: 21 });
  assert.equal(result.subtotal, -1000);
  assert.equal(result.total, -1210);
});

test('calculateLine: entradas no numéricas devuelven ceros, nunca NaN', () => {
  const result = calculateLine({ quantity: 'abc', unit_price: undefined, tax_rate: null });
  assert.equal(result.subtotal, 0);
  assert.equal(result.total, 0);
  assert.ok(!Number.isNaN(result.total));
});

/* ------------------------------------------------------------------ */
/* Totales de factura                                                  */
/* ------------------------------------------------------------------ */

test('calculateInvoiceTotals: suma varias líneas del mismo tipo impositivo', () => {
  const totals = calculateInvoiceTotals([
    { description: 'A', quantity: 1, unit_price: 6000, tax_rate: 21 },
    { description: 'B', quantity: 1, unit_price: 4000, tax_rate: 21 },
  ]);

  assert.equal(totals.subtotal, 10000);
  assert.equal(totals.tax_total, 2100);
  assert.equal(totals.total, 12100);
});

test('calculateInvoiceTotals: agrupa el IVA por tipo impositivo', () => {
  const totals = calculateInvoiceTotals([
    { description: 'General', quantity: 1, unit_price: 1000, tax_rate: 21 },
    { description: 'Reducido', quantity: 1, unit_price: 1000, tax_rate: 10 },
    { description: 'Exento', quantity: 1, unit_price: 500, tax_rate: 0 },
  ]);

  assert.equal(totals.subtotal, 2500);
  assert.equal(totals.tax_total, 310);
  assert.equal(totals.total, 2810);
  assert.equal(totals.taxBreakdown.length, 3);

  const general = totals.taxBreakdown.find((entry) => entry.rate === 21);
  assert.equal(general.base, 1000);
  assert.equal(general.amount, 210);
});

test('calculateInvoiceTotals: la suma de las líneas cuadra con el total', () => {
  const lines = Array.from({ length: 17 }, (_, index) => ({
    description: `Línea ${index}`,
    quantity: 1,
    unit_price: 33.33,
    tax_rate: 21,
  }));

  const totals = calculateInvoiceTotals(lines);
  const sumOfLines = sumAmounts(totals.lines.map((line) => line.subtotal));

  assert.equal(sumOfLines, totals.subtotal);
  assert.equal(roundAmount(totals.subtotal + totals.tax_total), totals.total);
});

test('calculateInvoiceTotals: acumula el descuento total de todas las líneas', () => {
  const totals = calculateInvoiceTotals([
    { description: 'A', quantity: 1, unit_price: 1000, discount_percent: 20, tax_rate: 21 },
    { description: 'B', quantity: 1, unit_price: 500, discount_percent: 50, tax_rate: 21 },
  ]);

  assert.equal(totals.discount_total, 450);
  assert.equal(totals.subtotal, 1050);
});

/* ------------------------------------------------------------------ */
/* Validación                                                          */
/* ------------------------------------------------------------------ */

test('validateInvoiceDraft: acepta una factura completa', () => {
  const result = validateInvoiceDraft(
    {
      party_id: 'a7c1e2b0-1111-4222-8333-444455556666',
      series_id: 'a7c1e2b0-1111-4222-8333-444455556667',
      issue_date: '2026-01-15',
      due_date: '2026-02-14',
    },
    [{ description: 'Servicios', quantity: 1, unit_price: 1000, tax_rate: 21 }],
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateInvoiceDraft: rechaza una factura sin líneas', () => {
  const result = validateInvoiceDraft(
    { party_id: 'x', series_id: 'y', issue_date: '2026-01-15' },
    [],
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('al menos una línea')));
});

test('validateInvoiceDraft: rechaza un vencimiento anterior a la emisión', () => {
  const result = validateInvoiceDraft(
    { party_id: 'x', series_id: 'y', issue_date: '2026-02-01', due_date: '2026-01-01' },
    [{ description: 'A', quantity: 1, unit_price: 100, tax_rate: 21 }],
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('vencimiento')));
});

test('validateInvoiceDraft: rechaza descuentos fuera de rango y cantidad cero', () => {
  const result = validateInvoiceDraft(
    { party_id: 'x', series_id: 'y', issue_date: '2026-01-01' },
    [
      { description: 'A', quantity: 0, unit_price: 100, tax_rate: 21 },
      { description: 'B', quantity: 1, unit_price: 100, discount_percent: 120, tax_rate: 21 },
    ],
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('Línea 1')));
  assert.ok(result.errors.some((error) => error.includes('Línea 2')));
});

test('validateInvoiceDraft: rechaza una factura cuyo total es cero', () => {
  const result = validateInvoiceDraft(
    { party_id: 'x', series_id: 'y', issue_date: '2026-01-01' },
    [{ description: 'Gratis', quantity: 1, unit_price: 0, tax_rate: 21 }],
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('mayor que cero')));
});

/* ------------------------------------------------------------------ */
/* Vencimiento                                                         */
/* ------------------------------------------------------------------ */

test('calculateDueDate: suma los días de pago acordados', () => {
  assert.equal(calculateDueDate('2026-01-15', 30), '2026-02-14');
  assert.equal(calculateDueDate('2026-01-15', 0), '2026-01-15');
  assert.equal(calculateDueDate('2026-12-20', 60), '2027-02-18');
});

test('calculateDueDate: devuelve null si la fecha no es válida', () => {
  assert.equal(calculateDueDate('', 30), null);
  assert.equal(calculateDueDate('no-es-fecha', 30), null);
});

/* ------------------------------------------------------------------ */
/* Rectificativas                                                      */
/* ------------------------------------------------------------------ */

test('buildRectificativeLines: invierte las cantidades y conserva los conceptos', () => {
  const lines = buildRectificativeLines([
    { description: 'Servicios', quantity: 2, unit_price: 500, tax_rate: 21, income_account_code: '705000' },
  ]);

  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, -2);
  assert.equal(lines[0].unit_price, 500);
  assert.equal(lines[0].income_account_code, '705000');
  assert.ok(lines[0].description.startsWith('Rectificación:'));
});

test('buildRectificativeLines: la rectificativa anula el importe de la original', () => {
  const originalLines = [{ description: 'Servicios', quantity: 1, unit_price: 10000, tax_rate: 21 }];
  const original = calculateInvoiceTotals(originalLines);
  const rectificative = calculateInvoiceTotals(buildRectificativeLines(originalLines));

  assert.equal(roundAmount(original.total + rectificative.total), 0);
});

/* ------------------------------------------------------------------ */
/* Estado funcional                                                    */
/* ------------------------------------------------------------------ */

test('resolveInvoiceFunctionalStatus: refleja el ciclo de cobro completo', () => {
  const today = new Date('2026-01-20T12:00:00Z');
  const base = { status: 'issued', total: 10000, due_date: '2026-02-20' };

  assert.equal(resolveInvoiceFunctionalStatus({ ...base, paid_amount: 0 }, today), 'pending');
  assert.equal(resolveInvoiceFunctionalStatus({ ...base, paid_amount: 4000 }, today), 'partial');
  assert.equal(resolveInvoiceFunctionalStatus({ ...base, paid_amount: 10000 }, today), 'paid');
});

test('resolveInvoiceFunctionalStatus: marca vencida solo si queda importe pendiente', () => {
  const today = new Date('2026-03-01T12:00:00Z');
  const base = { status: 'issued', total: 10000, due_date: '2026-02-20' };

  assert.equal(resolveInvoiceFunctionalStatus({ ...base, paid_amount: 0 }, today), 'overdue');
  assert.equal(resolveInvoiceFunctionalStatus({ ...base, paid_amount: 10000 }, today), 'paid');
});

test('resolveInvoiceFunctionalStatus: borrador y anulada no dependen del vencimiento', () => {
  const today = new Date('2030-01-01T00:00:00Z');
  assert.equal(
    resolveInvoiceFunctionalStatus({ status: 'draft', total: 100, due_date: '2020-01-01' }, today),
    'draft',
  );
  assert.equal(
    resolveInvoiceFunctionalStatus({ status: 'cancelled', total: 100, due_date: '2020-01-01' }, today),
    'cancelled',
  );
});

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

test('formatCurrency: usa el formato español con separador de miles', () => {
  const formatted = formatCurrency(1250);
  assert.ok(formatted.includes('1.250,00'));
  assert.ok(formatted.includes('€'));
});

test('formatCurrency: valores inválidos se muestran como cero, nunca NaN', () => {
  for (const value of [undefined, null, NaN, 'abc']) {
    const formatted = formatCurrency(value);
    assert.ok(!formatted.includes('NaN'), `«${formatted}» no debe contener NaN`);
    assert.ok(formatted.includes('0,00'));
  }
});

test('formatDate: fechas inválidas devuelven un guion, nunca Invalid Date', () => {
  for (const value of [undefined, null, '', 'no-es-fecha']) {
    assert.equal(formatDate(value), '—');
  }
  assert.equal(formatDate('2026-09-19T10:00:00Z'), '19/09/2026');
});

test('maskIban: solo deja visibles el país y los cuatro últimos dígitos', () => {
  const masked = maskIban('ES9121000418450200051332');
  assert.ok(masked.startsWith('ES'));
  assert.ok(masked.endsWith('1332'));
  assert.ok(!masked.includes('2100041845'));
});

test('sumAmounts: suma sin arrastrar error de coma flotante', () => {
  assert.equal(sumAmounts([0.1, 0.2]), 0.3);
  assert.equal(sumAmounts(Array.from({ length: 10 }, () => 0.1)), 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateDueDate, calculateInvoiceTotals, validateInvoiceDraft } from '@/lib/finance/invoiceCalc';
import {
  applyPayment,
  buildInvoiceJournalLines,
  buildPaymentJournalLines,
  canPostToFiscalYear,
  computeAccountBalance,
  findFiscalYear,
  validateJournalEntry,
} from '@/lib/finance/ledger';
import { buildForecast, calculateRealBalance } from '@/lib/finance/treasury';
import { sumAmounts } from '@/lib/finance/money';

const TODAY = new Date('2026-09-19T10:00:00Z');
const FISCAL_YEARS = [{ year: 2026, starts_on: '2026-01-01', ends_on: '2026-12-31', status: 'open' }];

/**
 * Simula el ciclo completo que garantizan las RPC de base de datos:
 * factura → emisión → contabilización → cobros → tesorería.
 */
function runFullCycle() {
  const journal = [];
  const movements = [];

  // 1. Factura de 10.000 € + IVA
  const lines = [
    { description: 'Servicios de formación', quantity: 1, unit_price: 10000, tax_rate: 21, income_account_code: '705000' },
  ];
  const draft = {
    party_id: 'party-1',
    series_id: 'series-1',
    issue_date: '2026-09-19',
    due_date: calculateDueDate('2026-09-19', 30),
  };

  const validation = validateInvoiceDraft(draft, lines);
  const totals = calculateInvoiceTotals(lines);

  // 2. Emisión: número de serie y asiento contable
  const fiscalYear = findFiscalYear(FISCAL_YEARS, draft.issue_date);
  const postable = canPostToFiscalYear(fiscalYear, draft.issue_date);

  let invoice = {
    id: 'inv-1',
    direction: 'sale',
    status: 'issued',
    invoice_number: 'OTW-2026-0001',
    issue_date: draft.issue_date,
    due_date: draft.due_date,
    subtotal: totals.subtotal,
    tax_total: totals.tax_total,
    total: totals.total,
    paid_amount: 0,
    payment_status: 'pending',
  };

  journal.push(buildInvoiceJournalLines(invoice, totals.lines));

  // 3. Primer cobro de 4.000 €
  const firstCollection = applyPayment(invoice, {
    amount: 4000,
    treasuryAccountId: 'acc-1',
    paymentDate: '2026-09-20',
  });
  invoice = firstCollection.invoice;
  movements.push(firstCollection.movement);
  journal.push(buildPaymentJournalLines({ direction: 'sale', amount: 4000 }));

  const afterFirst = { ...invoice };

  // 4. Segundo cobro por el resto
  const secondCollection = applyPayment(invoice, {
    amount: invoice.pending_amount,
    treasuryAccountId: 'acc-1',
    paymentDate: '2026-09-30',
  });
  invoice = secondCollection.invoice;
  movements.push(secondCollection.movement);
  journal.push(buildPaymentJournalLines({ direction: 'sale', amount: secondCollection.movement.amount_in }));

  return { validation, postable, totals, invoice, afterFirst, journal, movements };
}

test('integración: la factura se valida y se emite con su vencimiento a 30 días', () => {
  const { validation, postable, totals } = runFullCycle();

  assert.equal(validation.valid, true);
  assert.equal(postable.allowed, true);
  assert.equal(totals.subtotal, 10000);
  assert.equal(totals.tax_total, 2100);
  assert.equal(totals.total, 12100);
});

test('integración: la emisión genera un asiento cuadrado con cliente, ingreso e IVA', () => {
  const { journal } = runFullCycle();
  const invoiceEntry = journal[0];

  assert.equal(validateJournalEntry(invoiceEntry).valid, true);
  assert.equal(invoiceEntry.find((line) => line.account_code === '430000').debit, 12100);
  assert.equal(invoiceEntry.find((line) => line.account_code === '705000').credit, 10000);
  assert.equal(invoiceEntry.find((line) => line.account_code === '477000').credit, 2100);
});

test('integración: tras el primer cobro la factura queda parcial con el pendiente correcto', () => {
  const { afterFirst } = runFullCycle();

  assert.equal(afterFirst.paid_amount, 4000);
  assert.equal(afterFirst.pending_amount, 8100);
  assert.equal(afterFirst.payment_status, 'partial');
});

test('integración: tras el segundo cobro la factura queda cobrada y sin pendiente', () => {
  const { invoice } = runFullCycle();

  assert.equal(invoice.paid_amount, 12100);
  assert.equal(invoice.pending_amount, 0);
  assert.equal(invoice.payment_status, 'paid');
});

test('integración: el saldo bancario sube solo por los movimientos reales', () => {
  const { movements } = runFullCycle();

  assert.equal(movements.length, 2);
  assert.equal(movements[0].amount_in, 4000);
  assert.equal(movements[1].amount_in, 8100);
  assert.equal(computeAccountBalance(0, movements), 12100);
});

test('integración: todos los asientos generados cuadran y el conjunto también', () => {
  const { journal } = runFullCycle();

  for (const entry of journal) {
    assert.equal(validateJournalEntry(entry).valid, true);
  }

  const allLines = journal.flat();
  assert.equal(
    sumAmounts(allLines.map((line) => line.debit)),
    sumAmounts(allLines.map((line) => line.credit)),
  );
});

test('integración: la cuenta de cliente queda saldada al cobrar la factura completa', () => {
  const { journal } = runFullCycle();
  const clientLines = journal.flat().filter((line) => line.account_code === '430000');

  const debit = sumAmounts(clientLines.map((line) => line.debit));
  const credit = sumAmounts(clientLines.map((line) => line.credit));

  assert.equal(debit, 12100);
  assert.equal(credit, 12100);
  assert.equal(debit - credit, 0);
});

test('integración: el pendiente de cobro desaparece de la previsión al cobrar', () => {
  const { invoice, movements } = runFullCycle();

  const realBalance = calculateRealBalance([
    { current_balance: computeAccountBalance(0, movements), is_active: true },
  ]);

  const receivables =
    invoice.pending_amount > 0
      ? [{ due_date: invoice.due_date, pending_amount: invoice.pending_amount }]
      : [];

  const forecast = buildForecast({ realBalance, receivables, payables: [], today: TODAY });
  const thirtyDays = forecast.find((h) => h.days === 30);

  assert.equal(realBalance, 12100);
  assert.equal(thirtyDays.expected_in, 0);
  assert.equal(thirtyDays.forecast_balance, 12100);
});

test('integración: antes de cobrar, el importe está en previsión pero no en el saldo real', () => {
  const totals = calculateInvoiceTotals([
    { description: 'Servicios', quantity: 1, unit_price: 10000, tax_rate: 21 },
  ]);

  const realBalance = calculateRealBalance([{ current_balance: 0, is_active: true }]);
  const forecast = buildForecast({
    realBalance,
    receivables: [{ due_date: '2026-10-19', pending_amount: totals.total }],
    payables: [],
    today: TODAY,
  });

  const thirtyDays = forecast.find((h) => h.days === 30);

  assert.equal(realBalance, 0, 'la factura emitida no aumenta el saldo bancario');
  assert.equal(thirtyDays.expected_in, 12100);
  assert.equal(thirtyDays.forecast_balance, 12100);
});

test('integración: una factura de proveedor genera cuenta por pagar, pago y salida de tesorería', () => {
  const totals = calculateInvoiceTotals([
    { description: 'Software', quantity: 1, unit_price: 1000, tax_rate: 21, income_account_code: '629000' },
  ]);

  let invoice = {
    id: 'inv-2',
    direction: 'purchase',
    status: 'issued',
    total: totals.total,
    tax_total: totals.tax_total,
    paid_amount: 0,
  };

  const invoiceEntry = buildInvoiceJournalLines(invoice, totals.lines);
  assert.equal(validateJournalEntry(invoiceEntry).valid, true);
  assert.equal(invoiceEntry.find((line) => line.account_code === '400000').credit, 1210);

  const payment = applyPayment(invoice, { amount: 1210, treasuryAccountId: 'acc-1' });
  invoice = payment.invoice;

  assert.equal(invoice.payment_status, 'paid');
  assert.equal(payment.movement.amount_out, 1210);
  assert.equal(computeAccountBalance(5000, [payment.movement]), 3790);

  const paymentEntry = buildPaymentJournalLines({ direction: 'purchase', amount: 1210 });
  assert.equal(validateJournalEntry(paymentEntry).valid, true);
});

test('integración: no se puede contabilizar nada en un ejercicio cerrado', () => {
  const closedYears = [{ year: 2025, starts_on: '2025-01-01', ends_on: '2025-12-31', status: 'closed' }];
  const result = canPostToFiscalYear(findFiscalYear(closedYears, '2025-06-01'), '2025-06-01');

  assert.equal(result.allowed, false);
  assert.ok(result.reason.includes('cerrado'));
});

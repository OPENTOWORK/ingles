import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInvoiceJournalLines,
  buildPaymentJournalLines,
  canPostToFiscalYear,
  computeLedgerBalance,
  findFiscalYear,
  validateJournalEntry,
} from '@/lib/finance/ledger';
import { calculateInvoiceTotals } from '@/lib/finance/invoiceCalc';
import { sumAmounts } from '@/lib/finance/money';

const FISCAL_YEARS = [
  { year: 2025, starts_on: '2025-01-01', ends_on: '2025-12-31', status: 'closed' },
  { year: 2026, starts_on: '2026-01-01', ends_on: '2026-12-31', status: 'open' },
];

/* ------------------------------------------------------------------ */
/* Cuadre de asientos                                                  */
/* ------------------------------------------------------------------ */

test('validateJournalEntry: acepta un asiento cuadrado', () => {
  const result = validateJournalEntry([
    { account_code: '430000', debit: 1210, credit: 0 },
    { account_code: '705000', debit: 0, credit: 1000 },
    { account_code: '477000', debit: 0, credit: 210 },
  ]);

  assert.equal(result.valid, true);
  assert.equal(result.totalDebit, 1210);
  assert.equal(result.totalCredit, 1210);
});

test('validateJournalEntry: rechaza un asiento descuadrado', () => {
  const result = validateJournalEntry([
    { account_code: '430000', debit: 1210, credit: 0 },
    { account_code: '705000', debit: 0, credit: 1000 },
  ]);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('descuadrado')));
});

test('validateJournalEntry: rechaza un descuadre de un solo céntimo', () => {
  const result = validateJournalEntry([
    { account_code: '430000', debit: 100.01, credit: 0 },
    { account_code: '705000', debit: 0, credit: 100 },
  ]);
  assert.equal(result.valid, false);
});

test('validateJournalEntry: rechaza un asiento con una sola línea', () => {
  const result = validateJournalEntry([{ account_code: '430000', debit: 100, credit: 0 }]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('al menos dos líneas')));
});

test('validateJournalEntry: rechaza una línea con debe y haber a la vez', () => {
  const result = validateJournalEntry([
    { account_code: '430000', debit: 100, credit: 100 },
    { account_code: '705000', debit: 100, credit: 100 },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('no ambas')));
});

test('validateJournalEntry: rechaza importes negativos', () => {
  const result = validateJournalEntry([
    { account_code: '430000', debit: -100, credit: 0 },
    { account_code: '705000', debit: 0, credit: -100 },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('negativos')));
});

test('validateJournalEntry: rechaza un asiento sin cuenta contable', () => {
  const result = validateJournalEntry([
    { account_code: '', debit: 100, credit: 0 },
    { account_code: '705000', debit: 0, credit: 100 },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('cuenta contable')));
});

/* ------------------------------------------------------------------ */
/* Ejercicios contables                                                */
/* ------------------------------------------------------------------ */

test('findFiscalYear: localiza el ejercicio que contiene la fecha', () => {
  assert.equal(findFiscalYear(FISCAL_YEARS, '2026-06-15').year, 2026);
  assert.equal(findFiscalYear(FISCAL_YEARS, '2025-12-31').year, 2025);
  assert.equal(findFiscalYear(FISCAL_YEARS, '2030-01-01'), null);
});

test('canPostToFiscalYear: un ejercicio cerrado rechaza asientos', () => {
  const closed = findFiscalYear(FISCAL_YEARS, '2025-06-01');
  const result = canPostToFiscalYear(closed, '2025-06-01');

  assert.equal(result.allowed, false);
  assert.ok(result.reason.includes('cerrado'));
});

test('canPostToFiscalYear: un ejercicio abierto acepta asientos dentro de su rango', () => {
  const open = findFiscalYear(FISCAL_YEARS, '2026-06-01');
  assert.equal(canPostToFiscalYear(open, '2026-06-01').allowed, true);
});

test('canPostToFiscalYear: rechaza fechas sin ejercicio asociado', () => {
  const result = canPostToFiscalYear(null, '2030-01-01');
  assert.equal(result.allowed, false);
  assert.ok(result.reason.includes('No existe ejercicio'));
});

/* ------------------------------------------------------------------ */
/* Asientos generados automáticamente                                  */
/* ------------------------------------------------------------------ */

test('buildInvoiceJournalLines: el asiento de una factura de venta cuadra', () => {
  const lines = [{ description: 'Servicios', quantity: 1, unit_price: 10000, tax_rate: 21, income_account_code: '705000' }];
  const totals = calculateInvoiceTotals(lines);

  const journalLines = buildInvoiceJournalLines(
    { direction: 'sale', total: totals.total, tax_total: totals.tax_total },
    totals.lines,
  );

  const validation = validateJournalEntry(journalLines);
  assert.equal(validation.valid, true);
  assert.equal(validation.totalDebit, 12100);

  const receivable = journalLines.find((line) => line.account_code === '430000');
  const income = journalLines.find((line) => line.account_code === '705000');
  const vat = journalLines.find((line) => line.account_code === '477000');

  assert.equal(receivable.debit, 12100);
  assert.equal(income.credit, 10000);
  assert.equal(vat.credit, 2100);
});

test('buildInvoiceJournalLines: el asiento de una factura de compra cuadra e invierte los lados', () => {
  const lines = [{ description: 'Software', quantity: 1, unit_price: 1000, tax_rate: 21, income_account_code: '629000' }];
  const totals = calculateInvoiceTotals(lines);

  const journalLines = buildInvoiceJournalLines(
    { direction: 'purchase', total: totals.total, tax_total: totals.tax_total },
    totals.lines,
  );

  assert.equal(validateJournalEntry(journalLines).valid, true);

  const expense = journalLines.find((line) => line.account_code === '629000');
  const vat = journalLines.find((line) => line.account_code === '472000');
  const payable = journalLines.find((line) => line.account_code === '400000');

  assert.equal(expense.debit, 1000);
  assert.equal(vat.debit, 210);
  assert.equal(payable.credit, 1210);
});

test('buildInvoiceJournalLines: agrupa varias líneas en la misma cuenta de ingreso', () => {
  const lines = [
    { description: 'A', quantity: 1, unit_price: 600, tax_rate: 21, income_account_code: '705000' },
    { description: 'B', quantity: 1, unit_price: 400, tax_rate: 21, income_account_code: '705000' },
    { description: 'C', quantity: 1, unit_price: 200, tax_rate: 21, income_account_code: '700000' },
  ];
  const totals = calculateInvoiceTotals(lines);

  const journalLines = buildInvoiceJournalLines(
    { direction: 'sale', total: totals.total, tax_total: totals.tax_total },
    totals.lines,
  );

  assert.equal(journalLines.filter((line) => line.account_code === '705000').length, 1);
  assert.equal(journalLines.find((line) => line.account_code === '705000').credit, 1000);
  assert.equal(journalLines.find((line) => line.account_code === '700000').credit, 200);
  assert.equal(validateJournalEntry(journalLines).valid, true);
});

test('buildPaymentJournalLines: el asiento de un cobro cuadra y mueve tesorería al debe', () => {
  const journalLines = buildPaymentJournalLines({ direction: 'sale', amount: 4000 });

  assert.equal(validateJournalEntry(journalLines).valid, true);
  assert.equal(journalLines.find((line) => line.account_code === '572000').debit, 4000);
  assert.equal(journalLines.find((line) => line.account_code === '430000').credit, 4000);
});

test('buildPaymentJournalLines: el asiento de un pago cuadra y mueve tesorería al haber', () => {
  const journalLines = buildPaymentJournalLines({ direction: 'purchase', amount: 1210 });

  assert.equal(validateJournalEntry(journalLines).valid, true);
  assert.equal(journalLines.find((line) => line.account_code === '400000').debit, 1210);
  assert.equal(journalLines.find((line) => line.account_code === '572000').credit, 1210);
});

/* ------------------------------------------------------------------ */
/* Libro mayor                                                         */
/* ------------------------------------------------------------------ */

test('computeLedgerBalance: arrastra el saldo acumulado apunte a apunte', () => {
  const result = computeLedgerBalance(
    [
      { debit: 12100, credit: 0 },
      { debit: 0, credit: 4000 },
      { debit: 0, credit: 8100 },
    ],
    0,
  );

  assert.deepEqual(
    result.map((line) => line.balance),
    [12100, 8100, 0],
  );
});

test('computeLedgerBalance: parte del saldo de apertura indicado', () => {
  const result = computeLedgerBalance([{ debit: 500, credit: 0 }], 1000);
  assert.equal(result[0].balance, 1500);
});

test('computeLedgerBalance: no acumula error de coma flotante en muchos apuntes', () => {
  const lines = Array.from({ length: 100 }, () => ({ debit: 0.1, credit: 0 }));
  const result = computeLedgerBalance(lines, 0);
  assert.equal(result.at(-1).balance, 10);
});

/* ------------------------------------------------------------------ */
/* Invariante global                                                   */
/* ------------------------------------------------------------------ */

test('el conjunto de asientos de una factura y sus cobros mantiene DEBE = HABER', () => {
  const lines = [{ description: 'Servicios', quantity: 1, unit_price: 10000, tax_rate: 21 }];
  const totals = calculateInvoiceTotals(lines);

  const entries = [
    buildInvoiceJournalLines({ direction: 'sale', total: totals.total, tax_total: totals.tax_total }, totals.lines),
    buildPaymentJournalLines({ direction: 'sale', amount: 4000 }),
    buildPaymentJournalLines({ direction: 'sale', amount: 8100 }),
  ];

  for (const entry of entries) {
    assert.equal(validateJournalEntry(entry).valid, true);
  }

  const allLines = entries.flat();
  assert.equal(
    sumAmounts(allLines.map((line) => line.debit)),
    sumAmounts(allLines.map((line) => line.credit)),
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPayment, computeAccountBalance } from '@/lib/finance/ledger';
import {
  buildBalanceEvolution,
  buildForecast,
  buildUpcomingMovements,
  calculateRealBalance,
  suggestReconciliationMatches,
} from '@/lib/finance/treasury';

const TODAY = new Date('2026-09-19T10:00:00Z');

function issuedInvoice(overrides = {}) {
  return {
    id: 'inv-1',
    direction: 'sale',
    status: 'issued',
    total: 10000,
    paid_amount: 0,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* Cobros                                                              */
/* ------------------------------------------------------------------ */

test('applyPayment: un cobro total deja la factura cobrada y sin pendiente', () => {
  const result = applyPayment(issuedInvoice(), { amount: 10000, treasuryAccountId: 'acc-1' });

  assert.equal(result.ok, true);
  assert.equal(result.invoice.paid_amount, 10000);
  assert.equal(result.invoice.pending_amount, 0);
  assert.equal(result.invoice.payment_status, 'paid');
  assert.equal(result.movement.amount_in, 10000);
  assert.equal(result.movement.amount_out, 0);
  assert.equal(result.movement.kind, 'collection');
});

test('applyPayment: un cobro parcial deja la factura en estado parcial', () => {
  const result = applyPayment(issuedInvoice(), { amount: 4000, treasuryAccountId: 'acc-1' });

  assert.equal(result.ok, true);
  assert.equal(result.invoice.paid_amount, 4000);
  assert.equal(result.invoice.pending_amount, 6000);
  assert.equal(result.invoice.payment_status, 'partial');
});

test('applyPayment: el segundo cobro completa la factura', () => {
  const first = applyPayment(issuedInvoice(), { amount: 4000, treasuryAccountId: 'acc-1' });
  const second = applyPayment(first.invoice, { amount: 6000, treasuryAccountId: 'acc-1' });

  assert.equal(second.ok, true);
  assert.equal(second.invoice.paid_amount, 10000);
  assert.equal(second.invoice.pending_amount, 0);
  assert.equal(second.invoice.payment_status, 'paid');
});

test('applyPayment: rechaza cobrar más que el importe pendiente', () => {
  const first = applyPayment(issuedInvoice(), { amount: 4000, treasuryAccountId: 'acc-1' });
  const second = applyPayment(first.invoice, { amount: 6000.01, treasuryAccountId: 'acc-1' });

  assert.equal(second.ok, false);
  assert.ok(second.error.includes('supera el pendiente'));
});

test('applyPayment: rechaza un segundo cobro sobre una factura ya cobrada', () => {
  const paid = applyPayment(issuedInvoice(), { amount: 10000, treasuryAccountId: 'acc-1' }).invoice;
  const result = applyPayment(paid, { amount: 100, treasuryAccountId: 'acc-1' });

  assert.equal(result.ok, false);
});

test('applyPayment: rechaza importes nulos o negativos', () => {
  for (const amount of [0, -100, null, undefined, NaN]) {
    const result = applyPayment(issuedInvoice(), { amount, treasuryAccountId: 'acc-1' });
    assert.equal(result.ok, false, `importe ${amount} debe rechazarse`);
  }
});

test('applyPayment: rechaza cobrar sobre una factura en borrador', () => {
  const result = applyPayment(issuedInvoice({ status: 'draft' }), {
    amount: 1000,
    treasuryAccountId: 'acc-1',
  });

  assert.equal(result.ok, false);
  assert.ok(result.error.includes('emitidas'));
});

/* ------------------------------------------------------------------ */
/* Pagos                                                               */
/* ------------------------------------------------------------------ */

test('applyPayment: un pago parcial genera un movimiento de salida', () => {
  const invoice = issuedInvoice({ direction: 'purchase', total: 1210 });
  const result = applyPayment(invoice, { amount: 610, treasuryAccountId: 'acc-1' });

  assert.equal(result.ok, true);
  assert.equal(result.invoice.payment_status, 'partial');
  assert.equal(result.movement.amount_out, 610);
  assert.equal(result.movement.amount_in, 0);
  assert.equal(result.movement.kind, 'payment');
});

test('applyPayment: un pago total deja la factura de proveedor pagada', () => {
  const invoice = issuedInvoice({ direction: 'purchase', total: 1210 });
  const first = applyPayment(invoice, { amount: 610, treasuryAccountId: 'acc-1' });
  const second = applyPayment(first.invoice, { amount: 600, treasuryAccountId: 'acc-1' });

  assert.equal(second.invoice.payment_status, 'paid');
  assert.equal(second.invoice.pending_amount, 0);
});

/* ------------------------------------------------------------------ */
/* Saldo real                                                          */
/* ------------------------------------------------------------------ */

test('computeAccountBalance: el saldo refleja solo los movimientos reales', () => {
  const balance = computeAccountBalance(0, [
    { amount_in: 4000, amount_out: 0 },
    { amount_in: 6000, amount_out: 0 },
    { amount_in: 0, amount_out: 1500 },
  ]);

  assert.equal(balance, 8500);
});

test('computeAccountBalance: parte del saldo inicial de la cuenta', () => {
  assert.equal(computeAccountBalance(1000, [{ amount_in: 0, amount_out: 250 }]), 750);
});

test('calculateRealBalance: ignora las cuentas inactivas', () => {
  const balance = calculateRealBalance([
    { current_balance: 5000, is_active: true },
    { current_balance: 3000, is_active: true },
    { current_balance: 9999, is_active: false },
  ]);

  assert.equal(balance, 8000);
});

/* ------------------------------------------------------------------ */
/* Previsión                                                           */
/* ------------------------------------------------------------------ */

test('buildForecast: una factura futura no altera el saldo real', () => {
  const forecast = buildForecast({
    realBalance: 5000,
    receivables: [{ due_date: '2026-10-15', pending_amount: 8000 }],
    payables: [],
    today: TODAY,
  });

  for (const horizon of forecast) {
    assert.equal(horizon.real_balance, 5000);
  }
});

test('buildForecast: el saldo previsto suma cobros y resta pagos del periodo', () => {
  const forecast = buildForecast({
    realBalance: 5000,
    receivables: [{ due_date: '2026-09-25', pending_amount: 8000 }],
    payables: [{ due_date: '2026-09-30', pending_amount: 3000 }],
    today: TODAY,
  });

  const thirtyDays = forecast.find((h) => h.days === 30);
  assert.equal(thirtyDays.expected_in, 8000);
  assert.equal(thirtyDays.expected_out, 3000);
  assert.equal(thirtyDays.forecast_balance, 10000);
});

test('buildForecast: un vencimiento fuera del horizonte no se computa en ese plazo', () => {
  const forecast = buildForecast({
    realBalance: 1000,
    receivables: [{ due_date: '2026-12-01', pending_amount: 5000 }],
    payables: [],
    today: TODAY,
  });

  assert.equal(forecast.find((h) => h.days === 7).expected_in, 0);
  assert.equal(forecast.find((h) => h.days === 90).expected_in, 5000);
});

test('buildForecast: los vencimientos ya vencidos se computan en todos los horizontes', () => {
  const forecast = buildForecast({
    realBalance: 0,
    receivables: [{ due_date: '2026-08-01', pending_amount: 2000 }],
    payables: [],
    today: TODAY,
  });

  assert.equal(forecast.find((h) => h.days === 7).overdue_in, 2000);
  assert.equal(forecast.find((h) => h.days === 7).expected_in, 2000);
});

test('buildForecast: cubre los cinco horizontes previstos', () => {
  const forecast = buildForecast({ realBalance: 0, receivables: [], payables: [], today: TODAY });
  assert.deepEqual(
    forecast.map((h) => h.days),
    [7, 15, 30, 60, 90],
  );
});

/* ------------------------------------------------------------------ */
/* Próximos movimientos                                                */
/* ------------------------------------------------------------------ */

test('buildUpcomingMovements: distingue movimientos reales de previstos', () => {
  const items = buildUpcomingMovements({
    movements: [{ id: 'm1', movement_date: '2026-09-19', concept: 'Cobro ABC', amount_in: 8500, amount_out: 0 }],
    receivables: [
      { id: 'r1', due_date: '2026-09-30', pending_amount: 14000, party_name: 'Cliente XYZ', invoice_number: 'OTW-1' },
    ],
    payables: [{ id: 'p1', due_date: '2026-09-20', pending_amount: 12850, party_name: 'Nóminas' }],
    today: TODAY,
  });

  assert.equal(items.length, 3);
  assert.equal(items[0].nature, 'real');
  assert.equal(items[0].amount, 8500);

  const payable = items.find((item) => item.label === 'Nóminas');
  assert.equal(payable.nature, 'forecast');
  assert.equal(payable.amount, -12850);
});

test('buildUpcomingMovements: ordena por fecha ascendente', () => {
  const items = buildUpcomingMovements({
    movements: [],
    receivables: [
      { id: 'r1', due_date: '2026-10-30', pending_amount: 100, party_name: 'B' },
      { id: 'r2', due_date: '2026-09-25', pending_amount: 100, party_name: 'A' },
    ],
    payables: [],
    today: TODAY,
  });

  assert.deepEqual(
    items.map((item) => item.label),
    ['A', 'B'],
  );
});

test('buildUpcomingMovements: descarta vencimientos pasados y saldos a cero', () => {
  const items = buildUpcomingMovements({
    movements: [],
    receivables: [
      { id: 'r1', due_date: '2026-01-01', pending_amount: 500, party_name: 'Vencida' },
      { id: 'r2', due_date: '2026-10-01', pending_amount: 0, party_name: 'Sin pendiente' },
    ],
    payables: [],
    today: TODAY,
  });

  assert.equal(items.length, 0);
});

/* ------------------------------------------------------------------ */
/* Evolución de saldo                                                  */
/* ------------------------------------------------------------------ */

test('buildBalanceEvolution: acumula el saldo por fecha', () => {
  const evolution = buildBalanceEvolution(
    [
      { movement_date: '2026-09-01', amount_in: 4000, amount_out: 0 },
      { movement_date: '2026-09-05', amount_in: 6000, amount_out: 0 },
      { movement_date: '2026-09-05', amount_in: 0, amount_out: 1000 },
    ],
    0,
  );

  assert.equal(evolution.length, 2);
  assert.equal(evolution[0].balance, 4000);
  assert.equal(evolution[1].balance, 9000);
});

/* ------------------------------------------------------------------ */
/* Conciliación                                                        */
/* ------------------------------------------------------------------ */

const CANDIDATES = [
  {
    id: 'inv-abc',
    direction: 'sale',
    invoice_number: 'OTW-2026-0042',
    party_name: 'Empresa ABC',
    due_date: '2026-09-20',
    pending_amount: 4500,
  },
  {
    id: 'inv-other',
    direction: 'sale',
    invoice_number: 'OTW-2026-0043',
    party_name: 'Otra empresa',
    due_date: '2026-11-30',
    pending_amount: 999,
  },
  {
    id: 'inv-purchase',
    direction: 'purchase',
    invoice_number: 'COM-2026-0001',
    party_name: 'Proveedor',
    due_date: '2026-09-20',
    pending_amount: 4500,
  },
];

test('suggestReconciliationMatches: propone la factura del importe y nombre coincidentes', () => {
  const matches = suggestReconciliationMatches(
    {
      movement_date: '2026-09-19',
      concept: 'TRANSFERENCIA EMPRESA ABC',
      amount_in: 4500,
      amount_out: 0,
    },
    CANDIDATES,
  );

  assert.ok(matches.length > 0);
  assert.equal(matches[0].id, 'inv-abc');
  assert.ok(matches[0].reasons.includes('Importe exacto'));
  assert.ok(matches[0].reasons.includes('Nombre en el concepto'));
});

test('suggestReconciliationMatches: un ingreso nunca se propone contra una factura de compra', () => {
  const matches = suggestReconciliationMatches(
    { movement_date: '2026-09-19', concept: 'Ingreso', amount_in: 4500, amount_out: 0 },
    CANDIDATES,
  );

  assert.ok(matches.every((match) => match.direction === 'sale'));
});

test('suggestReconciliationMatches: una salida se propone contra facturas de compra', () => {
  const matches = suggestReconciliationMatches(
    { movement_date: '2026-09-19', concept: 'Pago proveedor', amount_in: 0, amount_out: 4500 },
    CANDIDATES,
  );

  assert.equal(matches[0].id, 'inv-purchase');
});

test('suggestReconciliationMatches: el número de factura en el concepto refuerza la coincidencia', () => {
  const matches = suggestReconciliationMatches(
    { movement_date: '2026-09-19', concept: 'Pago otw-2026-0043', amount_in: 999, amount_out: 0 },
    CANDIDATES,
  );

  assert.equal(matches[0].id, 'inv-other');
  assert.ok(matches[0].reasons.includes('Número de factura en el concepto'));
});

test('suggestReconciliationMatches: sin coincidencias devuelve lista vacía', () => {
  const matches = suggestReconciliationMatches(
    { movement_date: '2026-09-19', concept: 'Comisión bancaria', amount_in: 0, amount_out: 3.5 },
    CANDIDATES,
  );

  assert.equal(matches.length, 0);
});

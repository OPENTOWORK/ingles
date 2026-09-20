import { fromCents, roundAmount, toCents } from '@/lib/finance/money';

export const FORECAST_HORIZONS = [7, 15, 30, 60, 90];

/** Fecha UTC normalizada a medianoche a partir de un valor arbitrario. */
function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Saldo real: suma de los saldos de las cuentas activas.
 * Solo los movimientos reales de tesorería alteran este importe.
 */
export function calculateRealBalance(accounts = []) {
  return fromCents(
    accounts
      .filter((account) => account.is_active !== false)
      .reduce((acc, account) => acc + toCents(account.current_balance), 0),
  );
}

/**
 * Previsión de tesorería sobre un horizonte en días.
 *
 * Saldo previsto = saldo real + cobros pendientes del periodo − pagos pendientes del periodo.
 * Una factura futura nunca incrementa el saldo real.
 *
 * @param {{ realBalance: number, receivables: Array<{due_date: string, pending_amount: number}>, payables: Array<{due_date: string, pending_amount: number}>, horizons?: number[], today?: Date }} params
 */
export function buildForecast({
  realBalance = 0,
  receivables = [],
  payables = [],
  horizons = FORECAST_HORIZONS,
  today = new Date(),
} = {}) {
  const start = normalizeDate(today.toISOString()) || new Date();

  return horizons.map((days) => {
    const limit = addDays(start, days);

    let inflowCents = 0;
    let outflowCents = 0;
    let overdueInCents = 0;
    let overdueOutCents = 0;

    for (const item of receivables) {
      const due = normalizeDate(item.due_date);
      const amount = toCents(item.pending_amount);
      if (amount <= 0) continue;
      if (!due) continue;
      if (due < start) {
        overdueInCents += amount;
        inflowCents += amount;
      } else if (due <= limit) {
        inflowCents += amount;
      }
    }

    for (const item of payables) {
      const due = normalizeDate(item.due_date);
      const amount = toCents(item.pending_amount);
      if (amount <= 0) continue;
      if (!due) continue;
      if (due < start) {
        overdueOutCents += amount;
        outflowCents += amount;
      } else if (due <= limit) {
        outflowCents += amount;
      }
    }

    const realCents = toCents(realBalance);

    return {
      days,
      date: limit.toISOString().slice(0, 10),
      real_balance: fromCents(realCents),
      expected_in: fromCents(inflowCents),
      expected_out: fromCents(outflowCents),
      overdue_in: fromCents(overdueInCents),
      overdue_out: fromCents(overdueOutCents),
      forecast_balance: fromCents(realCents + inflowCents - outflowCents),
    };
  });
}

/**
 * Próximos movimientos: mezcla movimientos reales ya registrados con
 * vencimientos previstos, ordenados por fecha.
 */
export function buildUpcomingMovements({
  movements = [],
  receivables = [],
  payables = [],
  limit = 10,
  today = new Date(),
} = {}) {
  const start = normalizeDate(today.toISOString()) || new Date();
  const items = [];

  for (const movement of movements) {
    const date = normalizeDate(movement.movement_date);
    if (!date) continue;
    const amount = roundAmount(Number(movement.amount_in || 0) - Number(movement.amount_out || 0));
    items.push({
      id: `movement-${movement.id}`,
      date: movement.movement_date,
      label: movement.concept || 'Movimiento',
      amount,
      nature: 'real',
      kind: movement.kind,
    });
  }

  for (const item of receivables) {
    const due = normalizeDate(item.due_date);
    if (!due || due < start) continue;
    const amount = roundAmount(item.pending_amount);
    if (amount <= 0) continue;
    items.push({
      id: `receivable-${item.id}`,
      date: item.due_date,
      label: item.party_name || 'Cobro previsto',
      amount,
      nature: 'forecast',
      kind: 'collection',
      invoice_number: item.invoice_number || null,
    });
  }

  for (const item of payables) {
    const due = normalizeDate(item.due_date);
    if (!due || due < start) continue;
    const amount = roundAmount(item.pending_amount);
    if (amount <= 0) continue;
    items.push({
      id: `payable-${item.id}`,
      date: item.due_date,
      label: item.party_name || 'Pago previsto',
      amount: -amount,
      nature: 'forecast',
      kind: 'payment',
      invoice_number: item.invoice_number || null,
    });
  }

  return items
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, limit);
}

/**
 * Sugerencias de conciliación para un movimiento bancario sin identificar.
 * Puntúa por coincidencia exacta de importe, cercanía de fecha y nombre en el concepto.
 */
export function suggestReconciliationMatches(movement, candidates = [], { maxResults = 5 } = {}) {
  const movementAmount = toCents(Number(movement.amount_in || 0) - Number(movement.amount_out || 0));
  const isInflow = movementAmount > 0;
  const absAmount = Math.abs(movementAmount);
  const movementDate = normalizeDate(movement.movement_date);
  const concept = String(movement.concept || '').toLowerCase();

  const scored = candidates
    .filter((candidate) => (isInflow ? candidate.direction === 'sale' : candidate.direction === 'purchase'))
    .map((candidate) => {
      const pending = toCents(candidate.pending_amount);
      let score = 0;
      let amountScore = 0;
      const reasons = [];

      if (pending === absAmount) {
        amountScore = 60;
        reasons.push('Importe exacto');
      } else if (pending > 0 && Math.abs(pending - absAmount) <= Math.round(pending * 0.02)) {
        amountScore = 30;
        reasons.push('Importe aproximado');
      }
      score += amountScore;

      const partyName = String(candidate.party_name || '').toLowerCase();
      if (partyName && concept.includes(partyName)) {
        score += 25;
        reasons.push('Nombre en el concepto');
      } else if (partyName) {
        const token = partyName.split(/\s+/).find((word) => word.length >= 4);
        if (token && concept.includes(token)) {
          score += 15;
          reasons.push('Coincidencia parcial de nombre');
        }
      }

      const invoiceNumber = String(candidate.invoice_number || '').toLowerCase();
      if (invoiceNumber && concept.includes(invoiceNumber)) {
        score += 30;
        reasons.push('Número de factura en el concepto');
      }

      const dueDate = normalizeDate(candidate.due_date);
      if (movementDate && dueDate) {
        const diffDays = Math.abs((movementDate - dueDate) / 86400000);
        if (diffDays <= 7) {
          score += 15;
          reasons.push('Vencimiento próximo');
        } else if (diffDays <= 30) {
          score += 5;
        }
      }

      return { ...candidate, score, amountScore, reasons };
    })
    // Sin coincidencia de importe la propuesta es ruido: la fecha o el nombre solos no bastan.
    .filter((candidate) => candidate.amountScore > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}

/** Serie de evolución de saldo a partir de movimientos reales ordenados por fecha. */
export function buildBalanceEvolution(movements = [], openingBalance = 0) {
  const byDate = new Map();

  for (const movement of movements) {
    const date = String(movement.movement_date || '').slice(0, 10);
    if (!date) continue;
    const delta = toCents(movement.amount_in) - toCents(movement.amount_out);
    byDate.set(date, (byDate.get(date) || 0) + delta);
  }

  let running = toCents(openingBalance);
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, delta]) => {
      running += delta;
      return { date, delta: fromCents(delta), balance: fromCents(running) };
    });
}

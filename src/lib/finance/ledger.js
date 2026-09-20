import { fromCents, roundAmount, toCents } from '@/lib/finance/money';

/**
 * Reglas de negocio contables y de tesorería expresadas como funciones puras.
 *
 * Son el mismo contrato que aplican los triggers y las RPC de base de datos
 * (`fin_check_entry_balanced`, `fin_register_payment`, `fin_guard_closed_fiscal_year`).
 * Aquí sirven para validar en servidor antes de llamar a la base de datos y para
 * poder verificar las invariantes con tests sin depender de una conexión.
 */

/**
 * Valida un asiento contable: DEBE debe igualar a HABER.
 * @returns {{ valid: boolean, errors: string[], totalDebit: number, totalCredit: number }}
 */
export function validateJournalEntry(lines = []) {
  const errors = [];

  if (!Array.isArray(lines) || lines.length < 2) {
    errors.push('El asiento necesita al menos dos líneas.');
  }

  let debitCents = 0;
  let creditCents = 0;

  for (const [index, line] of (lines || []).entries()) {
    const position = index + 1;
    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;

    if (!String(line.account_code || '').trim()) {
      errors.push(`Línea ${position}: falta la cuenta contable.`);
    }
    if (debit < 0 || credit < 0) {
      errors.push(`Línea ${position}: los importes no pueden ser negativos.`);
    }
    if (debit > 0 && credit > 0) {
      errors.push(`Línea ${position}: una línea es al debe o al haber, no ambas.`);
    }
    if (debit === 0 && credit === 0) {
      errors.push(`Línea ${position}: indica un importe.`);
    }

    debitCents += toCents(debit);
    creditCents += toCents(credit);
  }

  if (debitCents !== creditCents) {
    errors.push(
      `Asiento descuadrado: debe ${fromCents(debitCents)} frente a haber ${fromCents(creditCents)}.`,
    );
  }
  if (debitCents === 0 && creditCents === 0 && (lines || []).length >= 2) {
    errors.push('Un asiento contabilizado no puede tener importe cero.');
  }

  return {
    valid: errors.length === 0,
    errors,
    totalDebit: fromCents(debitCents),
    totalCredit: fromCents(creditCents),
  };
}

/** Un ejercicio cerrado no admite asientos. */
export function canPostToFiscalYear(fiscalYear, entryDate) {
  if (!fiscalYear) {
    return { allowed: false, reason: `No existe ejercicio contable para la fecha ${entryDate}.` };
  }
  if (fiscalYear.status === 'closed') {
    return { allowed: false, reason: `El ejercicio ${fiscalYear.year} está cerrado.` };
  }
  const date = String(entryDate || '').slice(0, 10);
  if (date < fiscalYear.starts_on || date > fiscalYear.ends_on) {
    return { allowed: false, reason: `La fecha ${date} está fuera del ejercicio ${fiscalYear.year}.` };
  }
  return { allowed: true, reason: null };
}

/** Localiza el ejercicio contable que contiene una fecha. */
export function findFiscalYear(fiscalYears = [], date) {
  const value = String(date || '').slice(0, 10);
  return fiscalYears.find((year) => value >= year.starts_on && value <= year.ends_on) || null;
}

/**
 * Construye el asiento de una factura emitida o recibida.
 * Venta: cliente al debe; ingresos e IVA repercutido al haber.
 * Compra: gasto e IVA soportado al debe; proveedor al haber.
 */
export function buildInvoiceJournalLines(invoice, lines = []) {
  const isSale = invoice.direction !== 'purchase';
  const defaultAccount = isSale ? '705000' : '629000';

  const basesByAccount = new Map();
  for (const line of lines) {
    const code = line.income_account_code || defaultAccount;
    basesByAccount.set(code, (basesByAccount.get(code) || 0) + toCents(line.subtotal));
  }

  const result = [];

  if (isSale) {
    result.push({ account_code: '430000', concept: 'Cliente', debit: roundAmount(invoice.total), credit: 0 });
    for (const [code, baseCents] of basesByAccount) {
      result.push({ account_code: code, concept: 'Ingresos', debit: 0, credit: fromCents(baseCents) });
    }
    if (toCents(invoice.tax_total) > 0) {
      result.push({
        account_code: '477000',
        concept: 'IVA repercutido',
        debit: 0,
        credit: roundAmount(invoice.tax_total),
      });
    }
  } else {
    for (const [code, baseCents] of basesByAccount) {
      result.push({ account_code: code, concept: 'Gasto', debit: fromCents(baseCents), credit: 0 });
    }
    if (toCents(invoice.tax_total) > 0) {
      result.push({
        account_code: '472000',
        concept: 'IVA soportado',
        debit: roundAmount(invoice.tax_total),
        credit: 0,
      });
    }
    result.push({ account_code: '400000', concept: 'Proveedor', debit: 0, credit: roundAmount(invoice.total) });
  }

  return result;
}

/** Construye el asiento de un cobro o de un pago. */
export function buildPaymentJournalLines({ direction, amount, treasuryAccountCode = '572000' }) {
  const value = roundAmount(amount);
  if (direction === 'purchase') {
    return [
      { account_code: '400000', concept: 'Proveedor', debit: value, credit: 0 },
      { account_code: treasuryAccountCode, concept: 'Tesorería', debit: 0, credit: value },
    ];
  }
  return [
    { account_code: treasuryAccountCode, concept: 'Tesorería', debit: value, credit: 0 },
    { account_code: '430000', concept: 'Cliente', debit: 0, credit: value },
  ];
}

/**
 * Aplica un cobro o pago sobre una factura y devuelve su nuevo estado.
 * Rechaza importes no positivos y cualquier importe superior al pendiente,
 * que es lo que impide dobles cobros.
 *
 * @returns {{ ok: true, invoice: object, movement: object } | { ok: false, error: string }}
 */
export function applyPayment(invoice, { amount, treasuryAccountId, paymentDate, reference } = {}) {
  const value = roundAmount(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: 'El importe debe ser mayor que cero.' };
  }
  if (invoice.status !== 'issued') {
    return { ok: false, error: 'Solo se registran cobros/pagos sobre facturas emitidas.' };
  }

  const totalCents = toCents(invoice.total);
  const paidCents = toCents(invoice.paid_amount);
  const pendingCents = totalCents - paidCents;
  const amountCents = toCents(value);

  if (amountCents > pendingCents) {
    return {
      ok: false,
      error: `El importe (${value}) supera el pendiente (${fromCents(pendingCents)}).`,
    };
  }

  const newPaidCents = paidCents + amountCents;
  const payment_status =
    newPaidCents >= totalCents ? 'paid' : newPaidCents > 0 ? 'partial' : 'pending';

  const isSale = invoice.direction !== 'purchase';

  return {
    ok: true,
    invoice: {
      ...invoice,
      paid_amount: fromCents(newPaidCents),
      pending_amount: fromCents(totalCents - newPaidCents),
      payment_status,
    },
    movement: {
      treasury_account_id: treasuryAccountId,
      movement_date: paymentDate,
      kind: isSale ? 'collection' : 'payment',
      amount_in: isSale ? value : 0,
      amount_out: isSale ? 0 : value,
      reference: reference || null,
      document_type: 'invoice',
      document_id: invoice.id,
    },
  };
}

/** Saldo de una cuenta a partir de su saldo inicial y sus movimientos. */
export function computeAccountBalance(openingBalance, movements = []) {
  return fromCents(
    movements.reduce(
      (acc, movement) => acc + toCents(movement.amount_in) - toCents(movement.amount_out),
      toCents(openingBalance),
    ),
  );
}

/** Saldo acumulado de una cuenta contable a partir de sus apuntes. */
export function computeLedgerBalance(lines = [], openingBalance = 0) {
  let running = toCents(openingBalance);
  return lines.map((line) => {
    running += toCents(line.debit) - toCents(line.credit);
    return { ...line, balance: fromCents(running) };
  });
}

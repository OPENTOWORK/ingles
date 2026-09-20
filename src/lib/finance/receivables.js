import { NextResponse } from 'next/server';
import {
  describeDbError,
  financeError,
  optionalText,
  parseAmount,
  parseDate,
  parseUuid,
  readPagination,
} from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

/**
 * Listado de cuentas por cobrar (`sale`) o por pagar (`purchase`).
 * Comparte implementación porque la lógica funcional es simétrica.
 */
export async function listOpenItems({ db, searchParams, direction }) {
  const { page, pageSize, from, to } = readPagination(searchParams);

  const status = optionalText(searchParams.get('status')) || 'open';
  const partyId = parseUuid(searchParams.get('partyId'));
  const search = optionalText(searchParams.get('search'));
  const dueFrom = parseDate(searchParams.get('dueFrom'));
  const dueTo = parseDate(searchParams.get('dueTo'));

  let query = db
    .from('fin_invoice_overview')
    .select('*', { count: 'exact' })
    .eq('direction', direction)
    .eq('status', 'issued');

  if (status === 'open') query = query.neq('payment_status', 'paid');
  else if (status === 'paid') query = query.eq('payment_status', 'paid');
  else if (status === 'partial') query = query.eq('payment_status', 'partial');
  else if (status === 'pending') query = query.eq('payment_status', 'pending');
  else if (status === 'overdue') query = query.eq('is_overdue', true);

  if (partyId) query = query.eq('party_id', partyId);
  if (dueFrom) query = query.gte('due_date', dueFrom);
  if (dueTo) query = query.lte('due_date', dueTo);
  if (search) {
    const escaped = search.replace(/[%,()]/g, '');
    query = query.or(`invoice_number.ilike.%${escaped}%,party_name.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query
    .order('due_date', { ascending: true, nullsFirst: false })
    .range(from, to);

  if (error) return financeError(describeDbError(error), 500);

  // Totales globales del filtro, no solo de la página.
  let totalsQuery = db
    .from('fin_invoice_overview')
    .select('total, paid_amount, pending_amount, is_overdue')
    .eq('direction', direction)
    .eq('status', 'issued');

  if (status === 'open') totalsQuery = totalsQuery.neq('payment_status', 'paid');
  if (partyId) totalsQuery = totalsQuery.eq('party_id', partyId);

  const { data: totalsRows } = await totalsQuery;

  const totals = (totalsRows || []).reduce(
    (acc, row) => {
      acc.total += toCents(row.total);
      acc.paid += toCents(row.paid_amount);
      acc.pending += toCents(row.pending_amount);
      if (row.is_overdue) acc.overdue += toCents(row.pending_amount);
      return acc;
    },
    { total: 0, paid: 0, pending: 0, overdue: 0 },
  );

  return NextResponse.json({
    items: data || [],
    totals: {
      total: fromCents(totals.total),
      paid: fromCents(totals.paid),
      pending: fromCents(totals.pending),
      overdue: fromCents(totals.overdue),
    },
    pagination: { page, pageSize, total: count ?? 0 },
  });
}

/**
 * Registra un cobro o un pago.
 *
 * Toda la operación (pago + movimiento de tesorería + asiento + actualización
 * del estado de la factura) ocurre dentro de la RPC `fin_register_payment`,
 * que es atómica y bloquea la factura y la cuenta para evitar dobles cobros.
 */
export async function registerPayment({ db, user, body, direction }) {
  const invoiceId = parseUuid(body.invoice_id);
  if (!invoiceId) return financeError('Selecciona una factura.', 400);

  const treasuryAccountId = parseUuid(body.treasury_account_id);
  if (!treasuryAccountId) return financeError('Selecciona la cuenta de tesorería.', 400);

  const amount = parseAmount(body.amount);
  if (amount === null || amount <= 0) return financeError('Indica un importe mayor que cero.', 400);

  const paymentDate = parseDate(body.payment_date) || new Date().toISOString().slice(0, 10);

  const { data: invoice, error: invErr } = await db
    .from('fin_invoices')
    .select('id, direction, status, total, paid_amount, invoice_number')
    .eq('id', invoiceId)
    .maybeSingle();

  if (invErr) return financeError(describeDbError(invErr), 500);
  if (!invoice) return financeError('Factura no encontrada.', 404);
  if (invoice.direction !== direction) {
    return financeError(
      direction === 'sale'
        ? 'Esta factura es de compra: regístrala desde Pagos.'
        : 'Esta factura es de venta: regístrala desde Cobros.',
      400,
    );
  }

  const { data, error } = await db.rpc('fin_register_payment', {
    p_invoice_id: invoiceId,
    p_treasury_account_id: treasuryAccountId,
    p_amount: amount,
    p_payment_date: paymentDate,
    p_reference: optionalText(body.reference),
    p_notes: optionalText(body.notes),
    p_actor: user.id,
    p_idempotency_key: optionalText(body.idempotency_key),
  });

  if (error) {
    return financeError(
      describeDbError(error, direction === 'sale' ? 'No se ha podido registrar el cobro.' : 'No se ha podido registrar el pago.'),
      400,
    );
  }

  if (data?.duplicate) {
    return NextResponse.json({ ...data, message: 'Esta operación ya estaba registrada.' }, { status: 200 });
  }

  return NextResponse.json(data, { status: 201 });
}

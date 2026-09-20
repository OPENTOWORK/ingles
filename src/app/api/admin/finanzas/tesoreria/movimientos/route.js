import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  optionalText,
  parseAmount,
  parseDate,
  parseUuid,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

export const dynamic = 'force-dynamic';

const KINDS = ['collection', 'payment', 'transfer', 'adjustment'];

/** Movimientos de tesorería con saldo acumulado por cuenta. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);

    const accountId = parseUuid(searchParams.get('accountId'));
    const kind = optionalText(searchParams.get('kind'));
    const reconciliation = optionalText(searchParams.get('reconciliation'));
    const dateFrom = parseDate(searchParams.get('dateFrom'));
    const dateTo = parseDate(searchParams.get('dateTo'));
    const minAmount = parseAmount(searchParams.get('minAmount'));
    const maxAmount = parseAmount(searchParams.get('maxAmount'));
    const search = optionalText(searchParams.get('search'));

    let query = db
      .from('fin_treasury_movements')
      .select('*, treasury_account:fin_treasury_accounts(id, name, kind, currency)', { count: 'exact' });

    if (accountId) query = query.eq('treasury_account_id', accountId);
    if (kind && KINDS.includes(kind)) query = query.eq('kind', kind);
    if (reconciliation && reconciliation !== 'all') {
      query = query.eq('reconciliation_status', reconciliation);
    }
    if (dateFrom) query = query.gte('movement_date', dateFrom);
    if (dateTo) query = query.lte('movement_date', dateTo);
    if (search) {
      const escaped = search.replace(/[%,()]/g, '');
      query = query.or(`concept.ilike.%${escaped}%,reference.ilike.%${escaped}%`);
    }
    if (minAmount !== null) {
      query = query.or(`amount_in.gte.${minAmount},amount_out.gte.${minAmount}`);
    }
    if (maxAmount !== null) {
      query = query.lte('amount_in', maxAmount).lte('amount_out', maxAmount);
    }

    const { data, error, count } = await query
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    // El saldo acumulado solo tiene sentido dentro de una única cuenta.
    let movements = data || [];

    if (accountId && movements.length) {
      const { data: account } = await db
        .from('fin_treasury_accounts')
        .select('current_balance')
        .eq('id', accountId)
        .maybeSingle();

      const { data: newer } = await db
        .from('fin_treasury_movements')
        .select('amount_in, amount_out')
        .eq('treasury_account_id', accountId)
        .order('movement_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(0, Math.max(0, from - 1));

      const newerNet = from > 0
        ? (newer || []).reduce((acc, m) => acc + toCents(m.amount_in) - toCents(m.amount_out), 0)
        : 0;

      let runningCents = toCents(account?.current_balance) - newerNet;

      movements = movements.map((movement) => {
        const balance = fromCents(runningCents);
        runningCents -= toCents(movement.amount_in) - toCents(movement.amount_out);
        return { ...movement, balance };
      });
    }

    const totals = (data || []).reduce(
      (acc, m) => {
        acc.in += toCents(m.amount_in);
        acc.out += toCents(m.amount_out);
        return acc;
      },
      { in: 0, out: 0 },
    );

    return NextResponse.json({
      movements,
      pageTotals: { amount_in: fromCents(totals.in), amount_out: fromCents(totals.out) },
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/**
 * Movimiento manual (ajuste o transferencia).
 * Los cobros y pagos se registran desde sus propios endpoints para mantener
 * el vínculo con la factura y el asiento contable.
 */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    if (body.kind === 'transfer' && body.target_account_id) {
      return createTransfer(db, user, body);
    }

    const accountId = parseUuid(body.treasury_account_id);
    if (!accountId) return financeError('Selecciona una cuenta de tesorería.', 400);

    const kind = KINDS.includes(body.kind) ? body.kind : 'adjustment';
    if (kind === 'collection' || kind === 'payment') {
      return financeError(
        'Los cobros y pagos se registran desde Cobros o Pagos para mantener la trazabilidad con la factura.',
        400,
      );
    }

    const concept = optionalText(body.concept);
    if (!concept) return financeError('Indica el concepto del movimiento.', 400);

    const movementDate = parseDate(body.movement_date) || new Date().toISOString().slice(0, 10);
    const amountIn = parseAmount(body.amount_in ?? 0) ?? 0;
    const amountOut = parseAmount(body.amount_out ?? 0) ?? 0;

    if (amountIn < 0 || amountOut < 0) return financeError('Los importes no pueden ser negativos.', 400);
    if (amountIn > 0 && amountOut > 0) {
      return financeError('Un movimiento es entrada o salida, no ambas.', 400);
    }
    if (amountIn === 0 && amountOut === 0) return financeError('Indica un importe.', 400);

    const { data: movementId, error } = await db.rpc('fin_create_movement', {
      p_treasury_account_id: accountId,
      p_movement_date: movementDate,
      p_kind: kind,
      p_concept: concept,
      p_amount_in: amountIn,
      p_amount_out: amountOut,
      p_reference: optionalText(body.reference),
      p_notes: optionalText(body.notes),
      p_actor: user.id,
    });

    if (error) return financeError(describeDbError(error, 'No se ha podido crear el movimiento.'), 400);

    return NextResponse.json({ movementId }, { status: 201 });
  });
}

/** Transferencia entre cuentas propias: salida en origen y entrada en destino. */
async function createTransfer(db, user, body) {
  const sourceId = parseUuid(body.treasury_account_id);
  const targetId = parseUuid(body.target_account_id);

  if (!sourceId || !targetId) return financeError('Selecciona las cuentas de origen y destino.', 400);
  if (sourceId === targetId) return financeError('Las cuentas de origen y destino deben ser distintas.', 400);

  const amount = parseAmount(body.amount);
  if (!amount || amount <= 0) return financeError('Indica un importe mayor que cero.', 400);

  const movementDate = parseDate(body.movement_date) || new Date().toISOString().slice(0, 10);
  const concept = optionalText(body.concept) || 'Transferencia entre cuentas';
  const reference = optionalText(body.reference);

  const { data: accounts, error: accErr } = await db
    .from('fin_treasury_accounts')
    .select('id, name, is_active, accounting_account_code, kind, current_balance')
    .in('id', [sourceId, targetId]);

  if (accErr) return financeError(describeDbError(accErr), 500);

  const source = (accounts || []).find((a) => a.id === sourceId);
  const target = (accounts || []).find((a) => a.id === targetId);

  if (!source || !target) return financeError('Cuenta de tesorería no encontrada.', 404);
  if (!source.is_active || !target.is_active) return financeError('Ambas cuentas deben estar activas.', 400);

  const { data: outId, error: outErr } = await db.rpc('fin_create_movement', {
    p_treasury_account_id: sourceId,
    p_movement_date: movementDate,
    p_kind: 'transfer',
    p_concept: `${concept} → ${target.name}`,
    p_amount_in: 0,
    p_amount_out: amount,
    p_reference: reference,
    p_notes: optionalText(body.notes),
    p_actor: user.id,
  });

  if (outErr) return financeError(describeDbError(outErr), 400);

  const { data: inId, error: inErr } = await db.rpc('fin_create_movement', {
    p_treasury_account_id: targetId,
    p_movement_date: movementDate,
    p_kind: 'transfer',
    p_concept: `${concept} ← ${source.name}`,
    p_amount_in: amount,
    p_amount_out: 0,
    p_reference: reference,
    p_notes: optionalText(body.notes),
    p_actor: user.id,
  });

  if (inErr) {
    await db.from('fin_treasury_movements').delete().eq('id', outId);
    return financeError(describeDbError(inErr), 400);
  }

  // Asiento de traspaso entre las cuentas contables de tesorería.
  const sourceCode = source.accounting_account_code || (source.kind === 'cash' ? '570000' : '572000');
  const targetCode = target.accounting_account_code || (target.kind === 'cash' ? '570000' : '572000');

  if (sourceCode !== targetCode) {
    const { data: entryId } = await db.rpc('fin_create_journal_entry', {
      p_entry_date: movementDate,
      p_concept: `Traspaso ${source.name} → ${target.name}`,
      p_lines: [
        { account_code: targetCode, concept: target.name, debit: amount, credit: 0 },
        { account_code: sourceCode, concept: source.name, debit: 0, credit: amount },
      ],
      p_actor: user.id,
      p_origin: 'manual',
    });

    if (entryId) {
      await db.from('fin_treasury_movements').update({ journal_entry_id: entryId }).in('id', [outId, inId]);
    }
  }

  return NextResponse.json({ movementIds: [outId, inId] }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseUuid,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';
import { suggestReconciliationMatches } from '@/lib/finance/treasury';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'reconciled', 'unidentified'];

/**
 * Movimientos a conciliar con sugerencias de coincidencia.
 *
 * La arquitectura acepta movimientos creados por el sistema (cobros y pagos)
 * y movimientos importados externamente (`external_id`), de modo que una futura
 * importación CSV o conexión PSD2 solo tiene que insertar filas con `external_id`.
 */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);

    const status = optionalText(searchParams.get('status')) || 'pending';
    const accountId = parseUuid(searchParams.get('accountId'));

    let query = db
      .from('fin_treasury_movements')
      .select('*, treasury_account:fin_treasury_accounts(id, name, kind)', { count: 'exact' });

    if (status !== 'all' && STATUSES.includes(status)) {
      query = query.eq('reconciliation_status', status);
    }
    if (accountId) query = query.eq('treasury_account_id', accountId);

    const { data, error, count } = await query
      .order('movement_date', { ascending: false })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    const movements = data || [];

    // Candidatos: facturas emitidas con importe pendiente. Una sola consulta para toda la página.
    const { data: candidates, error: candErr } = await db
      .from('fin_invoice_overview')
      .select('id, direction, invoice_number, party_name, party_id, due_date, total, pending_amount')
      .eq('status', 'issued')
      .neq('payment_status', 'paid')
      .limit(500);

    if (candErr) return financeError(describeDbError(candErr), 500);

    const enriched = movements.map((movement) => ({
      ...movement,
      suggestions:
        movement.reconciliation_status === 'reconciled' || movement.payment_id
          ? []
          : suggestReconciliationMatches(movement, candidates || []),
    }));

    const { count: pendingCount } = await db
      .from('fin_treasury_movements')
      .select('id', { count: 'exact', head: true })
      .eq('reconciliation_status', 'pending');

    const { count: unidentifiedCount } = await db
      .from('fin_treasury_movements')
      .select('id', { count: 'exact', head: true })
      .eq('reconciliation_status', 'unidentified');

    return NextResponse.json({
      movements: enriched,
      counters: {
        pending: pendingCount ?? 0,
        unidentified: unidentifiedCount ?? 0,
      },
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/**
 * Concilia un movimiento.
 *
 * - Si se indica una factura, registra además el cobro/pago correspondiente
 *   mediante la RPC atómica y enlaza el movimiento resultante.
 * - Si no, marca el movimiento con el estado indicado.
 */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const movementId = parseUuid(body.movement_id);
    if (!movementId) return financeError('Movimiento no válido.', 400);

    const { data: movement, error: movErr } = await db
      .from('fin_treasury_movements')
      .select('*')
      .eq('id', movementId)
      .maybeSingle();

    if (movErr) return financeError(describeDbError(movErr), 500);
    if (!movement) return financeError('Movimiento no encontrado.', 404);
    if (movement.reconciliation_status === 'reconciled') {
      return financeError('El movimiento ya está conciliado.', 409);
    }

    const invoiceId = parseUuid(body.invoice_id);

    if (invoiceId) {
      const { data: invoice, error: invErr } = await db
        .from('fin_invoices')
        .select('id, direction, status, total, paid_amount, invoice_number')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invErr) return financeError(describeDbError(invErr), 500);
      if (!invoice) return financeError('Factura no encontrada.', 404);

      const isInflow = Number(movement.amount_in) > 0;
      if (isInflow && invoice.direction !== 'sale') {
        return financeError('Un ingreso solo se concilia con una factura de venta.', 400);
      }
      if (!isInflow && invoice.direction !== 'purchase') {
        return financeError('Un pago solo se concilia con una factura de compra.', 400);
      }

      const amount = Number(movement.amount_in) || Number(movement.amount_out);
      const pending = Math.round((Number(invoice.total) - Number(invoice.paid_amount)) * 100) / 100;

      if (amount > pending + 0.001) {
        return financeError(
          `El movimiento (${amount} €) supera el pendiente de la factura (${pending} €).`,
          400,
        );
      }

      // El movimiento original se sustituye por el que genera la RPC, que ya
      // queda enlazado a factura, pago y asiento contable.
      const { data: result, error: rpcErr } = await db.rpc('fin_register_payment', {
        p_invoice_id: invoiceId,
        p_treasury_account_id: movement.treasury_account_id,
        p_amount: amount,
        p_payment_date: movement.movement_date,
        p_reference: movement.reference || movement.concept,
        p_notes: `Conciliado desde movimiento bancario ${movement.id}`,
        p_actor: user.id,
        p_idempotency_key: `reconcile:${movement.id}`,
      });

      if (rpcErr) return financeError(describeDbError(rpcErr), 400);

      if (result?.movement_id && result.movement_id !== movementId) {
        await db.from('fin_treasury_movements').delete().eq('id', movementId);
        await db
          .from('fin_treasury_movements')
          .update({
            reconciliation_status: 'reconciled',
            reconciled_at: new Date().toISOString(),
            reconciled_by: user.id,
            external_id: movement.external_id,
            notes: movement.notes,
            updated_by: user.id,
          })
          .eq('id', result.movement_id);
      }

      await logFinanceAudit(db, {
        entityType: 'treasury_movement',
        entityId: result?.movement_id || movementId,
        action: 'reconciled',
        detail: { invoice_id: invoiceId, invoice_number: invoice.invoice_number, amount },
        actorId: user.id,
      });

      return NextResponse.json({ ...result, reconciled: true });
    }

    const status = STATUSES.includes(body.status) ? body.status : 'reconciled';

    const { data, error } = await db
      .from('fin_treasury_movements')
      .update({
        reconciliation_status: status,
        reconciled_at: status === 'reconciled' ? new Date().toISOString() : null,
        reconciled_by: status === 'reconciled' ? user.id : null,
        notes: optionalText(body.notes) ?? movement.notes,
        updated_by: user.id,
      })
      .eq('id', movementId)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 400);

    await logFinanceAudit(db, {
      entityType: 'treasury_movement',
      entityId: movementId,
      action: `reconciliation_${status}`,
      detail: { concept: movement.concept },
      actorId: user.id,
    });

    return NextResponse.json({ movement: data, reconciled: status === 'reconciled' });
  });
}

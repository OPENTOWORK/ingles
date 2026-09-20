import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseUuid,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

/** Ficha de cliente: datos fiscales, facturas, totales y últimas operaciones. */
export async function GET(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const { data: party, error } = await db
      .from('fin_parties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 500);
    if (!party) return financeError('Tercero no encontrado.', 404);

    const [{ data: invoices, error: invErr }, { data: payments, error: payErr }] = await Promise.all([
      db
        .from('fin_invoice_overview')
        .select('*')
        .eq('party_id', id)
        .order('issue_date', { ascending: false })
        .limit(100),
      db
        .from('fin_payments')
        .select('id, direction, payment_date, amount, reference, invoice_id')
        .eq('party_id', id)
        .order('payment_date', { ascending: false })
        .limit(20),
    ]);

    if (invErr) return financeError(describeDbError(invErr), 500);
    if (payErr) return financeError(describeDbError(payErr), 500);

    const issued = (invoices || []).filter((inv) => inv.status === 'issued');
    const summary = issued.reduce(
      (acc, inv) => {
        acc.invoiced_total += Number(inv.total) || 0;
        acc.paid_total += Number(inv.paid_amount) || 0;
        acc.pending_amount += Number(inv.pending_amount) || 0;
        if (inv.is_overdue) acc.overdue_amount += Number(inv.pending_amount) || 0;
        return acc;
      },
      { invoiced_total: 0, paid_total: 0, pending_amount: 0, overdue_amount: 0 },
    );

    return NextResponse.json({
      party,
      invoices: invoices || [],
      payments: payments || [],
      summary: {
        invoice_count: issued.length,
        invoiced_total: Math.round(summary.invoiced_total * 100) / 100,
        paid_total: Math.round(summary.paid_total * 100) / 100,
        pending_amount: Math.round(summary.pending_amount * 100) / 100,
        overdue_amount: Math.round(summary.overdue_amount * 100) / 100,
      },
    });
  });
}

/** Actualiza los datos fiscales de un tercero. */
export async function PATCH(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const body = await req.json().catch(() => ({}));
    const payload = { updated_by: user.id };

    const textFields = [
      'trade_name',
      'tax_id',
      'email',
      'phone',
      'address_line',
      'postal_code',
      'city',
      'province',
      'country',
      'payment_method',
      'accounting_account_code',
      'notes',
    ];

    for (const field of textFields) {
      if (field in body) payload[field] = optionalText(body[field]);
    }

    if ('legal_name' in body) {
      const legalName = optionalText(body.legal_name);
      if (!legalName) return financeError('La razón social es obligatoria.', 400);
      payload.legal_name = legalName;
    }
    if ('kind' in body && ['customer', 'supplier', 'both'].includes(body.kind)) {
      payload.kind = body.kind;
    }
    if ('payment_terms_days' in body) {
      const days = Number(body.payment_terms_days);
      if (!Number.isFinite(days) || days < 0) {
        return financeError('Los días de pago deben ser un número positivo.', 400);
      }
      payload.payment_terms_days = days;
    }
    if ('is_active' in body) payload.is_active = body.is_active !== false;

    const { data, error } = await db
      .from('fin_parties')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error, 'No se ha podido actualizar el tercero.'), 400);
    if (!data) return financeError('Tercero no encontrado.', 404);

    await logFinanceAudit(db, {
      entityType: 'party',
      entityId: id,
      action: 'updated',
      detail: { fields: Object.keys(payload).filter((k) => k !== 'updated_by') },
      actorId: user.id,
    });

    return NextResponse.json({ party: data });
  });
}

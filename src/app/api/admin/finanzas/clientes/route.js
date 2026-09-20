import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

/** Listado de terceros (clientes y proveedores) con importes agregados. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);
    const search = optionalText(searchParams.get('search'));
    const kind = optionalText(searchParams.get('kind'));
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = db.from('fin_parties').select('*', { count: 'exact' });

    if (search) {
      const escaped = search.replace(/[%,()]/g, '');
      query = query.or(
        `legal_name.ilike.%${escaped}%,trade_name.ilike.%${escaped}%,tax_id.ilike.%${escaped}%,email.ilike.%${escaped}%`,
      );
    }
    if (kind && kind !== 'all') {
      query = query.in('kind', kind === 'customer' ? ['customer', 'both'] : ['supplier', 'both']);
    }
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error, count } = await query
      .order('legal_name', { ascending: true })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    const partyIds = (data || []).map((row) => row.id);
    const totals = new Map();

    if (partyIds.length) {
      const { data: invoices, error: invErr } = await db
        .from('fin_invoice_overview')
        .select('party_id, direction, status, total, pending_amount, is_overdue')
        .in('party_id', partyIds)
        .eq('status', 'issued');

      if (invErr) return financeError(describeDbError(invErr), 500);

      for (const invoice of invoices || []) {
        const entry = totals.get(invoice.party_id) || {
          invoiced_total: 0,
          pending_amount: 0,
          overdue_amount: 0,
          invoice_count: 0,
        };
        entry.invoice_count += 1;
        entry.invoiced_total += Number(invoice.total) || 0;
        entry.pending_amount += Number(invoice.pending_amount) || 0;
        if (invoice.is_overdue) entry.overdue_amount += Number(invoice.pending_amount) || 0;
        totals.set(invoice.party_id, entry);
      }
    }

    const parties = (data || []).map((row) => {
      const aggregate = totals.get(row.id) || {
        invoiced_total: 0,
        pending_amount: 0,
        overdue_amount: 0,
        invoice_count: 0,
      };
      return {
        ...row,
        invoiced_total: Math.round(aggregate.invoiced_total * 100) / 100,
        pending_amount: Math.round(aggregate.pending_amount * 100) / 100,
        overdue_amount: Math.round(aggregate.overdue_amount * 100) / 100,
        invoice_count: aggregate.invoice_count,
      };
    });

    return NextResponse.json({
      parties,
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/** Alta de cliente o proveedor. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const legalName = optionalText(body.legal_name);
    if (!legalName) return financeError('La razón social es obligatoria.', 400);

    const kind = ['customer', 'supplier', 'both'].includes(body.kind) ? body.kind : 'customer';
    const paymentTerms = Number(body.payment_terms_days);

    const payload = {
      kind,
      legal_name: legalName,
      trade_name: optionalText(body.trade_name),
      tax_id: optionalText(body.tax_id),
      email: optionalText(body.email),
      phone: optionalText(body.phone),
      address_line: optionalText(body.address_line),
      postal_code: optionalText(body.postal_code),
      city: optionalText(body.city),
      province: optionalText(body.province),
      country: optionalText(body.country) || 'ES',
      payment_terms_days: Number.isFinite(paymentTerms) && paymentTerms >= 0 ? paymentTerms : 30,
      payment_method: optionalText(body.payment_method),
      accounting_account_code: optionalText(body.accounting_account_code),
      notes: optionalText(body.notes),
      is_active: body.is_active !== false,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await db.from('fin_parties').insert(payload).select('*').single();
    if (error) return financeError(describeDbError(error, 'No se ha podido crear el tercero.'), 400);

    await logFinanceAudit(db, {
      entityType: 'party',
      entityId: data.id,
      action: 'created',
      detail: { legal_name: data.legal_name, kind: data.kind },
      actorId: user.id,
    });

    return NextResponse.json({ party: data }, { status: 201 });
  });
}

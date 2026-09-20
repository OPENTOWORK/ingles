import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseAmount,
  parseDate,
  parseUuid,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';
import { calculateDueDate, calculateInvoiceTotals, validateInvoiceDraft } from '@/lib/finance/invoiceCalc';
import { buildPartySnapshot } from '@/lib/finance/party';

export const dynamic = 'force-dynamic';

const SORTABLE_COLUMNS = new Set([
  'issue_date',
  'due_date',
  'invoice_number',
  'total',
  'pending_amount',
  'party_name',
  'created_at',
]);

/** Listado paginado de facturas con filtrado y ordenación en servidor. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);

    const direction = searchParams.get('direction') === 'purchase' ? 'purchase' : 'sale';
    const search = optionalText(searchParams.get('search'));
    const partyId = parseUuid(searchParams.get('partyId'));
    const seriesId = parseUuid(searchParams.get('seriesId'));
    const status = optionalText(searchParams.get('status'));
    const paymentStatus = optionalText(searchParams.get('paymentStatus'));
    const dateFrom = parseDate(searchParams.get('dateFrom'));
    const dateTo = parseDate(searchParams.get('dateTo'));
    const minAmount = parseAmount(searchParams.get('minAmount'));
    const maxAmount = parseAmount(searchParams.get('maxAmount'));
    const overdueOnly = searchParams.get('overdue') === 'true';

    const sortBy = SORTABLE_COLUMNS.has(searchParams.get('sortBy'))
      ? searchParams.get('sortBy')
      : 'issue_date';
    const ascending = searchParams.get('sortDir') === 'asc';

    let query = db.from('fin_invoice_overview').select('*', { count: 'exact' }).eq('direction', direction);

    if (partyId) query = query.eq('party_id', partyId);
    if (seriesId) query = query.eq('series_id', seriesId);
    if (status && status !== 'all') query = query.eq('status', status);
    if (paymentStatus && paymentStatus !== 'all') query = query.eq('payment_status', paymentStatus);
    if (dateFrom) query = query.gte('issue_date', dateFrom);
    if (dateTo) query = query.lte('issue_date', dateTo);
    if (minAmount !== null) query = query.gte('total', minAmount);
    if (maxAmount !== null) query = query.lte('total', maxAmount);
    if (overdueOnly) query = query.eq('is_overdue', true);
    if (search) {
      const escaped = search.replace(/[%,()]/g, '');
      query = query.or(`invoice_number.ilike.%${escaped}%,party_name.ilike.%${escaped}%`);
    }

    const { data, error, count } = await query
      .order(sortBy, { ascending, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    return NextResponse.json({
      invoices: data || [],
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/** Crea una factura en borrador con sus líneas y totales calculados en servidor. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const direction = body.direction === 'purchase' ? 'purchase' : 'sale';
    const partyId = parseUuid(body.party_id);
    const seriesId = parseUuid(body.series_id);
    const issueDate = parseDate(body.issue_date) || new Date().toISOString().slice(0, 10);
    const lines = Array.isArray(body.lines) ? body.lines : [];

    const validation = validateInvoiceDraft(
      { party_id: partyId, series_id: seriesId, issue_date: issueDate, due_date: parseDate(body.due_date) },
      lines,
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const { data: party, error: partyErr } = await db
      .from('fin_parties')
      .select('*')
      .eq('id', partyId)
      .maybeSingle();
    if (partyErr) return financeError(describeDbError(partyErr), 500);
    if (!party) return financeError('Cliente no encontrado.', 404);

    const { data: series, error: seriesErr } = await db
      .from('fin_invoice_series')
      .select('*')
      .eq('id', seriesId)
      .maybeSingle();
    if (seriesErr) return financeError(describeDbError(seriesErr), 500);
    if (!series) return financeError('Serie no encontrada.', 404);
    if (series.direction !== direction) {
      return financeError('La serie seleccionada no corresponde a este tipo de factura.', 400);
    }

    const totals = calculateInvoiceTotals(lines);
    const dueDate = parseDate(body.due_date) || calculateDueDate(issueDate, party.payment_terms_days);

    const { data: invoice, error: invErr } = await db
      .from('fin_invoices')
      .insert({
        direction,
        series_id: seriesId,
        party_id: partyId,
        issue_date: issueDate,
        due_date: dueDate,
        status: 'draft',
        payment_status: 'pending',
        subtotal: totals.subtotal,
        discount_total: totals.discount_total,
        tax_total: totals.tax_total,
        total: totals.total,
        payment_method: optionalText(body.payment_method) || party.payment_method,
        notes: optionalText(body.notes),
        internal_notes: optionalText(body.internal_notes),
        party_snapshot: buildPartySnapshot(party),
        rectifies_invoice_id: parseUuid(body.rectifies_invoice_id),
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single();

    if (invErr) return financeError(describeDbError(invErr, 'No se ha podido crear la factura.'), 400);

    const lineRows = totals.lines.map((line, index) => ({
      invoice_id: invoice.id,
      line_number: index + 1,
      description: String(line.description || '').trim(),
      quantity: Number(line.quantity) || 0,
      unit_price: Number(line.unit_price) || 0,
      discount_percent: Number(line.discount_percent) || 0,
      tax_rate: Number(line.tax_rate) || 0,
      income_account_code: optionalText(line.income_account_code) || series.default_income_account_code,
      subtotal: line.subtotal,
      tax_amount: line.tax_amount,
      total: line.total,
    }));

    const { error: linesErr } = await db.from('fin_invoice_lines').insert(lineRows);
    if (linesErr) {
      await db.from('fin_invoices').delete().eq('id', invoice.id);
      return financeError(describeDbError(linesErr, 'No se han podido guardar las líneas.'), 400);
    }

    await logFinanceAudit(db, {
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'created',
      detail: { direction, total: totals.total, party: party.legal_name },
      actorId: user.id,
    });

    if (body.issue === true) {
      const { data: issued, error: issueErr } = await db.rpc('fin_issue_invoice', {
        p_invoice_id: invoice.id,
        p_actor: user.id,
      });
      if (issueErr) {
        return NextResponse.json(
          { invoice, warning: describeDbError(issueErr, 'La factura se guardó como borrador.') },
          { status: 201 },
        );
      }
      return NextResponse.json({ invoice: issued }, { status: 201 });
    }

    return NextResponse.json({ invoice }, { status: 201 });
  });
}

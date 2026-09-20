import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseDate,
  parseUuid,
  withFinanceAuth,
} from '@/lib/finance/api';
import { calculateInvoiceTotals, validateInvoiceDraft } from '@/lib/finance/invoiceCalc';
import { buildPartySnapshot } from '@/lib/finance/party';

export const dynamic = 'force-dynamic';

/** Detalle completo de una factura: líneas, cobros, asientos y rectificativas. */
export async function GET(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const { data: invoice, error } = await db
      .from('fin_invoices')
      .select('*, party:fin_parties(*), series:fin_invoice_series(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 500);
    if (!invoice) return financeError('Factura no encontrada.', 404);

    const [lines, payments, entries, rectificative, original] = await Promise.all([
      db.from('fin_invoice_lines').select('*').eq('invoice_id', id).order('line_number'),
      db
        .from('fin_payments')
        .select('*, treasury_account:fin_treasury_accounts(id, name, kind)')
        .eq('invoice_id', id)
        .order('payment_date', { ascending: false }),
      db
        .from('fin_journal_entries')
        .select('id, entry_number, entry_date, concept, origin, total_debit, total_credit')
        .eq('document_type', 'invoice')
        .eq('document_id', id),
      invoice.rectified_by_invoice_id
        ? db
            .from('fin_invoices')
            .select('id, invoice_number, issue_date, total, status')
            .eq('id', invoice.rectified_by_invoice_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      invoice.rectifies_invoice_id
        ? db
            .from('fin_invoices')
            .select('id, invoice_number, issue_date, total, status')
            .eq('id', invoice.rectifies_invoice_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const pending = Math.round((Number(invoice.total) - Number(invoice.paid_amount)) * 100) / 100;

    return NextResponse.json({
      invoice: { ...invoice, pending_amount: pending },
      lines: lines.data || [],
      payments: payments.data || [],
      journalEntries: entries.data || [],
      rectificativeInvoice: rectificative.data || null,
      originalInvoice: original.data || null,
    });
  });
}

/** Edita una factura en borrador. Las emitidas son inmutables por diseño. */
export async function PATCH(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const body = await req.json().catch(() => ({}));

    const { data: current, error: currentErr } = await db
      .from('fin_invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (currentErr) return financeError(describeDbError(currentErr), 500);
    if (!current) return financeError('Factura no encontrada.', 404);

    // Sobre una factura emitida solo se permiten campos no fiscales.
    if (current.status !== 'draft') {
      const payload = { updated_by: user.id };
      if ('notes' in body) payload.notes = optionalText(body.notes);
      if ('internal_notes' in body) payload.internal_notes = optionalText(body.internal_notes);
      if ('payment_method' in body) payload.payment_method = optionalText(body.payment_method);
      if ('due_date' in body) {
        const dueDate = parseDate(body.due_date);
        if (!dueDate) return financeError('La fecha de vencimiento no es válida.', 400);
        if (dueDate < current.issue_date) {
          return financeError('El vencimiento no puede ser anterior a la emisión.', 400);
        }
        payload.due_date = dueDate;
      }

      if (Object.keys(payload).length === 1) {
        return financeError('Una factura emitida solo admite cambios en notas, vencimiento y forma de pago.', 400);
      }

      const { data, error } = await db
        .from('fin_invoices')
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) return financeError(describeDbError(error), 400);

      await logFinanceAudit(db, {
        entityType: 'invoice',
        entityId: id,
        action: 'updated_non_fiscal',
        detail: { fields: Object.keys(payload).filter((k) => k !== 'updated_by') },
        actorId: user.id,
      });

      return NextResponse.json({ invoice: data });
    }

    const lines = Array.isArray(body.lines) ? body.lines : null;
    const partyId = 'party_id' in body ? parseUuid(body.party_id) : current.party_id;
    const seriesId = 'series_id' in body ? parseUuid(body.series_id) : current.series_id;
    const issueDate = 'issue_date' in body ? parseDate(body.issue_date) : current.issue_date;
    const dueDate = 'due_date' in body ? parseDate(body.due_date) : current.due_date;

    if (lines) {
      const validation = validateInvoiceDraft(
        { party_id: partyId, series_id: seriesId, issue_date: issueDate, due_date: dueDate },
        lines,
      );
      if (!validation.valid) {
        return NextResponse.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
      }
    }

    const payload = {
      party_id: partyId,
      series_id: seriesId,
      issue_date: issueDate,
      due_date: dueDate,
      updated_by: user.id,
    };

    if ('notes' in body) payload.notes = optionalText(body.notes);
    if ('internal_notes' in body) payload.internal_notes = optionalText(body.internal_notes);
    if ('payment_method' in body) payload.payment_method = optionalText(body.payment_method);

    if ('party_id' in body && partyId !== current.party_id) {
      const { data: party } = await db.from('fin_parties').select('*').eq('id', partyId).maybeSingle();
      if (!party) return financeError('Cliente no encontrado.', 404);
      payload.party_snapshot = buildPartySnapshot(party);
    }

    if (lines) {
      const totals = calculateInvoiceTotals(lines);
      payload.subtotal = totals.subtotal;
      payload.discount_total = totals.discount_total;
      payload.tax_total = totals.tax_total;
      payload.total = totals.total;

      const { error: delErr } = await db.from('fin_invoice_lines').delete().eq('invoice_id', id);
      if (delErr) return financeError(describeDbError(delErr), 400);

      const { data: series } = await db
        .from('fin_invoice_series')
        .select('default_income_account_code')
        .eq('id', seriesId)
        .maybeSingle();

      const { error: insErr } = await db.from('fin_invoice_lines').insert(
        totals.lines.map((line, index) => ({
          invoice_id: id,
          line_number: index + 1,
          description: String(line.description || '').trim(),
          quantity: Number(line.quantity) || 0,
          unit_price: Number(line.unit_price) || 0,
          discount_percent: Number(line.discount_percent) || 0,
          tax_rate: Number(line.tax_rate) || 0,
          income_account_code:
            optionalText(line.income_account_code) || series?.default_income_account_code || null,
          subtotal: line.subtotal,
          tax_amount: line.tax_amount,
          total: line.total,
        })),
      );
      if (insErr) return financeError(describeDbError(insErr), 400);
    }

    const { data, error } = await db
      .from('fin_invoices')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 400);

    await logFinanceAudit(db, {
      entityType: 'invoice',
      entityId: id,
      action: 'draft_updated',
      detail: { total: data?.total },
      actorId: user.id,
    });

    return NextResponse.json({ invoice: data });
  });
}

/** Elimina una factura en borrador. Las emitidas nunca se borran (trazabilidad fiscal). */
export async function DELETE(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const { data: invoice, error } = await db
      .from('fin_invoices')
      .select('id, status, invoice_number')
      .eq('id', id)
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 500);
    if (!invoice) return financeError('Factura no encontrada.', 404);

    if (invoice.status !== 'draft') {
      return financeError(
        'Una factura emitida no se puede eliminar. Anúlala o emite una rectificativa.',
        409,
      );
    }

    const { error: delErr } = await db.from('fin_invoices').delete().eq('id', id);
    if (delErr) return financeError(describeDbError(delErr), 400);

    await logFinanceAudit(db, {
      entityType: 'invoice',
      entityId: id,
      action: 'draft_deleted',
      detail: {},
      actorId: user.id,
    });

    return NextResponse.json({ ok: true });
  });
}

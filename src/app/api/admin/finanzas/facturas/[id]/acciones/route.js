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
import { buildRectificativeLines, calculateInvoiceTotals } from '@/lib/finance/invoiceCalc';

export const dynamic = 'force-dynamic';

/**
 * Acciones sobre una factura: emitir, rectificar y anular.
 * Todas delegan la parte crítica en RPC transaccionales de base de datos.
 */
export async function POST(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '').trim();

    if (action === 'issue') return issueInvoice(db, user, id);
    if (action === 'rectify') return rectifyInvoice(db, user, id, body);
    if (action === 'cancel') return cancelInvoice(db, user, id, body);

    return financeError('Acción no reconocida.', 400);
  });
}

/** Emisión: numeración atómica y asiento contable en una única transacción SQL. */
async function issueInvoice(db, user, id) {
  const { data, error } = await db.rpc('fin_issue_invoice', {
    p_invoice_id: id,
    p_actor: user.id,
  });

  if (error) return financeError(describeDbError(error, 'No se ha podido emitir la factura.'), 400);

  return NextResponse.json({ invoice: data });
}

/**
 * Rectificativa: crea y emite una factura nueva con los importes en negativo,
 * enlazada a la original. La original nunca se modifica ni se sobrescribe.
 */
async function rectifyInvoice(db, user, id, body) {
  const { data: original, error: origErr } = await db
    .from('fin_invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (origErr) return financeError(describeDbError(origErr), 500);
  if (!original) return financeError('Factura no encontrada.', 404);
  if (original.status !== 'issued') {
    return financeError('Solo se pueden rectificar facturas emitidas.', 400);
  }
  if (original.rectified_by_invoice_id) {
    return financeError('Esta factura ya tiene una rectificativa asociada.', 409);
  }

  const { data: originalLines, error: linesErr } = await db
    .from('fin_invoice_lines')
    .select('*')
    .eq('invoice_id', id)
    .order('line_number');

  if (linesErr) return financeError(describeDbError(linesErr), 500);

  const seriesId = parseUuid(body.series_id);
  let series = null;

  if (seriesId) {
    const { data } = await db.from('fin_invoice_series').select('*').eq('id', seriesId).maybeSingle();
    series = data;
  } else {
    const { data } = await db
      .from('fin_invoice_series')
      .select('*')
      .eq('direction', original.direction)
      .eq('is_rectificative', true)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    series = data;
  }

  if (!series) return financeError('No hay una serie rectificativa configurada.', 400);

  const issueDate = parseDate(body.issue_date) || new Date().toISOString().slice(0, 10);
  const lines = buildRectificativeLines(originalLines || []);
  const totals = calculateInvoiceTotals(lines);

  // Los importes de la rectificativa se almacenan en positivo y el asiento
  // invierte la factura original; el enlace conserva la trazabilidad.
  const { data: draft, error: draftErr } = await db
    .from('fin_invoices')
    .insert({
      direction: original.direction,
      series_id: series.id,
      party_id: original.party_id,
      issue_date: issueDate,
      due_date: issueDate,
      status: 'draft',
      payment_status: 'pending',
      subtotal: Math.abs(totals.subtotal),
      discount_total: Math.abs(totals.discount_total),
      tax_total: Math.abs(totals.tax_total),
      total: Math.abs(totals.total),
      payment_method: original.payment_method,
      notes: optionalText(body.reason) || `Rectifica la factura ${original.invoice_number}`,
      party_snapshot: original.party_snapshot,
      rectifies_invoice_id: original.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('*')
    .single();

  if (draftErr) {
    return financeError(describeDbError(draftErr, 'No se ha podido crear la rectificativa.'), 400);
  }

  const { error: insErr } = await db.from('fin_invoice_lines').insert(
    totals.lines.map((line, index) => ({
      invoice_id: draft.id,
      line_number: index + 1,
      description: line.description,
      quantity: Math.abs(Number(line.quantity) || 0),
      unit_price: Number(line.unit_price) || 0,
      discount_percent: Number(line.discount_percent) || 0,
      tax_rate: Number(line.tax_rate) || 0,
      income_account_code: line.income_account_code || series.default_income_account_code,
      subtotal: Math.abs(line.subtotal),
      tax_amount: Math.abs(line.tax_amount),
      total: Math.abs(line.total),
    })),
  );

  if (insErr) {
    await db.from('fin_invoices').delete().eq('id', draft.id);
    return financeError(describeDbError(insErr), 400);
  }

  const { data: issued, error: issueErr } = await db.rpc('fin_issue_invoice', {
    p_invoice_id: draft.id,
    p_actor: user.id,
  });

  if (issueErr) {
    return financeError(describeDbError(issueErr, 'No se ha podido emitir la rectificativa.'), 400);
  }

  await db.from('fin_invoices').update({ rectified_by_invoice_id: draft.id }).eq('id', original.id);

  await logFinanceAudit(db, {
    entityType: 'invoice',
    entityId: original.id,
    action: 'rectified',
    detail: {
      rectificative_id: draft.id,
      rectificative_number: issued?.invoice_number,
      original_number: original.invoice_number,
    },
    actorId: user.id,
  });

  return NextResponse.json({ invoice: issued, originalId: original.id }, { status: 201 });
}

/** Anulación: solo si no hay cobros registrados. Genera asiento inverso. */
async function cancelInvoice(db, user, id, body) {
  const { data: invoice, error } = await db
    .from('fin_invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return financeError(describeDbError(error), 500);
  if (!invoice) return financeError('Factura no encontrada.', 404);
  if (invoice.status === 'cancelled') return financeError('La factura ya está anulada.', 409);
  if (invoice.status !== 'issued') {
    return financeError('Solo se pueden anular facturas emitidas.', 400);
  }
  if (Number(invoice.paid_amount) > 0) {
    return financeError(
      'La factura tiene cobros registrados. Emite una rectificativa en lugar de anularla.',
      409,
    );
  }

  const reason = optionalText(body.reason);
  if (!reason) return financeError('Indica el motivo de la anulación.', 400);

  // Asiento inverso de la factura original.
  const { data: entry } = await db
    .from('fin_journal_entries')
    .select('id')
    .eq('document_type', 'invoice')
    .eq('document_id', id)
    .maybeSingle();

  if (entry?.id) {
    const { data: entryLines } = await db
      .from('fin_journal_lines')
      .select('account_code, concept, debit, credit')
      .eq('entry_id', entry.id)
      .order('line_number');

    if (entryLines?.length) {
      const reversal = entryLines.map((line) => ({
        account_code: line.account_code,
        concept: `Anulación ${invoice.invoice_number}`,
        debit: Number(line.credit) || 0,
        credit: Number(line.debit) || 0,
      }));

      const { error: rpcErr } = await db.rpc('fin_create_journal_entry', {
        p_entry_date: new Date().toISOString().slice(0, 10),
        p_concept: `Anulación factura ${invoice.invoice_number}`,
        p_lines: reversal,
        p_actor: user.id,
        p_origin: 'adjustment',
      });

      if (rpcErr) {
        return financeError(describeDbError(rpcErr, 'No se ha podido generar el asiento de anulación.'), 400);
      }
    }
  }

  const { data: cancelled, error: cancelErr } = await db
    .from('fin_invoices')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
      updated_by: user.id,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (cancelErr) return financeError(describeDbError(cancelErr), 400);

  await logFinanceAudit(db, {
    entityType: 'invoice',
    entityId: id,
    action: 'cancelled',
    detail: { invoice_number: invoice.invoice_number, reason },
    actorId: user.id,
  });

  return NextResponse.json({ invoice: cancelled });
}

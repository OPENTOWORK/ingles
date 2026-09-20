import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, parseUuid, withFinanceAuth } from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

/** Detalle de un asiento con sus líneas y el documento de origen enlazado. */
export async function GET(req, { params }) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db }) => {
    const { id: rawId } = await params;
    const id = parseUuid(rawId);
    if (!id) return financeError('Identificador no válido.', 400);

    const { data: entry, error } = await db
      .from('fin_journal_entries')
      .select('*, fiscal_year:fin_fiscal_years(id, year, status)')
      .eq('id', id)
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 500);
    if (!entry) return financeError('Asiento no encontrado.', 404);

    const { data: lines, error: linesErr } = await db
      .from('fin_ledger_view')
      .select('line_id, account_code, account_name, account_type, line_concept, debit, credit, party_id')
      .eq('entry_id', id)
      .order('account_code');

    if (linesErr) return financeError(describeDbError(linesErr), 500);

    let sourceDocument = null;

    if (entry.document_type === 'invoice' && entry.document_id) {
      const { data } = await db
        .from('fin_invoice_overview')
        .select('id, invoice_number, issue_date, total, status, payment_status, party_name, direction')
        .eq('id', entry.document_id)
        .maybeSingle();
      if (data) sourceDocument = { type: 'invoice', ...data };
    } else if (entry.document_type === 'payment' && entry.document_id) {
      const { data } = await db
        .from('fin_payments')
        .select('id, amount, payment_date, reference, invoice_id, direction')
        .eq('id', entry.document_id)
        .maybeSingle();

      if (data) {
        let invoice = null;
        if (data.invoice_id) {
          const { data: inv } = await db
            .from('fin_invoice_overview')
            .select('id, invoice_number, party_name, total, direction')
            .eq('id', data.invoice_id)
            .maybeSingle();
          invoice = inv || null;
        }
        sourceDocument = { type: 'payment', ...data, invoice };
      }
    }

    let author = null;
    if (entry.created_by) {
      const { data } = await db
        .from('Usuarios_y_Perfil_users')
        .select('id, nombre, email')
        .eq('id', entry.created_by)
        .maybeSingle();
      author = data || null;
    }

    return NextResponse.json({
      entry,
      lines: lines || [],
      sourceDocument,
      author,
    });
  });
}

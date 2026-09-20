import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, withFinanceAuth } from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

export const dynamic = 'force-dynamic';

function monthKey(value) {
  return String(value || '').slice(0, 7);
}

/** Dashboard de Facturación con métricas calculadas sobre datos reales. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, searchParams }) => {
    const direction = searchParams.get('direction') === 'purchase' ? 'purchase' : 'sale';

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const yearStart = `${today.getUTCFullYear()}-01-01`;

    const [{ data: invoices, error }, { data: recent, error: recentErr }] = await Promise.all([
      db
        .from('fin_invoice_overview')
        .select('issue_date, due_date, status, payment_status, total, paid_amount, pending_amount, is_overdue')
        .eq('direction', direction)
        .eq('status', 'issued')
        .gte('issue_date', `${today.getUTCFullYear() - 1}-01-01`),
      db
        .from('fin_invoice_overview')
        .select('*')
        .eq('direction', direction)
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    if (error) return financeError(describeDbError(error), 500);
    if (recentErr) return financeError(describeDbError(recentErr), 500);

    const rows = invoices || [];

    let monthCents = 0;
    let yearCents = 0;
    let pendingCents = 0;
    let overdueCents = 0;
    let overdueCount = 0;
    const byMonth = new Map();

    for (const invoice of rows) {
      const total = toCents(invoice.total);
      const pending = toCents(invoice.pending_amount);
      const key = monthKey(invoice.issue_date);

      if (key === currentMonth) monthCents += total;
      if (invoice.issue_date >= yearStart) yearCents += total;

      pendingCents += pending;
      if (invoice.is_overdue) {
        overdueCents += pending;
        overdueCount += 1;
      }

      const entry = byMonth.get(key) || { billed: 0, collected: 0, count: 0 };
      entry.billed += total;
      entry.collected += toCents(invoice.paid_amount);
      entry.count += 1;
      byMonth.set(key, entry);
    }

    const monthlyEvolution = [...byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, entry]) => ({
        month,
        billed: fromCents(entry.billed),
        collected: fromCents(entry.collected),
        count: entry.count,
      }));

    const { count: draftCount } = await db
      .from('fin_invoices')
      .select('id', { count: 'exact', head: true })
      .eq('direction', direction)
      .eq('status', 'draft');

    return NextResponse.json({
      summary: {
        month_total: fromCents(monthCents),
        year_total: fromCents(yearCents),
        pending_amount: fromCents(pendingCents),
        overdue_amount: fromCents(overdueCents),
        overdue_count: overdueCount,
        invoice_count: rows.length,
        draft_count: draftCount ?? 0,
      },
      monthlyEvolution,
      recentInvoices: recent || [],
    });
  });
}

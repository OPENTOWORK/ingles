import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, parseUuid, withFinanceAuth } from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

export const dynamic = 'force-dynamic';

/**
 * Dashboard de Contabilidad.
 * Los agregados se calculan sobre `fin_ledger_view`, que ya resuelve el join
 * entre líneas, asientos y plan contable en una sola consulta.
 */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, searchParams }) => {
    const { data: fiscalYears, error: yearsErr } = await db
      .from('fin_fiscal_years')
      .select('*')
      .order('year', { ascending: false });

    if (yearsErr) return financeError(describeDbError(yearsErr), 500);

    const requestedYear = parseUuid(searchParams.get('fiscalYearId'));
    const currentYear = new Date().getUTCFullYear();
    const activeYear =
      (fiscalYears || []).find((y) => y.id === requestedYear) ||
      (fiscalYears || []).find((y) => y.year === currentYear) ||
      (fiscalYears || [])[0] ||
      null;

    if (!activeYear) {
      return NextResponse.json({
        fiscalYears: [],
        activeFiscalYear: null,
        summary: emptySummary(),
        byType: [],
        recentEntries: [],
      });
    }

    const [{ data: lines, error: linesErr }, { data: recentEntries, error: entriesErr }] =
      await Promise.all([
        db
          .from('fin_ledger_view')
          .select('account_code, account_name, account_type, debit, credit')
          .eq('fiscal_year_id', activeYear.id)
          .eq('status', 'posted'),
        db
          .from('fin_journal_entries')
          .select('id, entry_number, entry_date, concept, origin, document_ref, total_debit, total_credit, status')
          .eq('fiscal_year_id', activeYear.id)
          .order('entry_date', { ascending: false })
          .order('entry_number', { ascending: false })
          .limit(10),
      ]);

    if (linesErr) return financeError(describeDbError(linesErr), 500);
    if (entriesErr) return financeError(describeDbError(entriesErr), 500);

    const byType = new Map();
    let debitCents = 0;
    let creditCents = 0;

    for (const line of lines || []) {
      const debit = toCents(line.debit);
      const credit = toCents(line.credit);
      debitCents += debit;
      creditCents += credit;

      const type = line.account_type || 'other';
      const entry = byType.get(type) || { debit: 0, credit: 0 };
      entry.debit += debit;
      entry.credit += credit;
      byType.set(type, entry);
    }

    const income = byType.get('income') || { debit: 0, credit: 0 };
    const expense = byType.get('expense') || { debit: 0, credit: 0 };
    const asset = byType.get('asset') || { debit: 0, credit: 0 };
    const liability = byType.get('liability') || { debit: 0, credit: 0 };
    const equity = byType.get('equity') || { debit: 0, credit: 0 };

    // Ingresos: saldo acreedor. Gastos: saldo deudor.
    const incomeCents = income.credit - income.debit;
    const expenseCents = expense.debit - expense.credit;
    const assetCents = asset.debit - asset.credit;
    const liabilityCents = liability.credit - liability.debit;
    const equityCents = equity.credit - equity.debit;

    const hasBalanceData = assetCents !== 0 || liabilityCents !== 0 || equityCents !== 0;

    return NextResponse.json({
      fiscalYears: fiscalYears || [],
      activeFiscalYear: activeYear,
      summary: {
        income: fromCents(incomeCents),
        expenses: fromCents(expenseCents),
        result: fromCents(incomeCents - expenseCents),
        total_debit: fromCents(debitCents),
        total_credit: fromCents(creditCents),
        balanced: debitCents === creditCents,
        entry_count: new Set((recentEntries || []).map((e) => e.id)).size,
        // El balance de situación solo se publica si hay datos patrimoniales reales.
        assets: hasBalanceData ? fromCents(assetCents) : null,
        liabilities: hasBalanceData ? fromCents(liabilityCents) : null,
        equity: hasBalanceData ? fromCents(equityCents + incomeCents - expenseCents) : null,
      },
      byType: [...byType.entries()].map(([type, value]) => ({
        account_type: type,
        debit: fromCents(value.debit),
        credit: fromCents(value.credit),
        balance: fromCents(value.debit - value.credit),
      })),
      recentEntries: recentEntries || [],
    });
  });
}

function emptySummary() {
  return {
    income: 0,
    expenses: 0,
    result: 0,
    total_debit: 0,
    total_credit: 0,
    balanced: true,
    entry_count: 0,
    assets: null,
    liabilities: null,
    equity: null,
  };
}

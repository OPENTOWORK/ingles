import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  optionalText,
  parseDate,
  parseUuid,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

export const dynamic = 'force-dynamic';

/**
 * Libro mayor de una cuenta: movimientos ordenados con saldo acumulado.
 * El saldo de apertura se calcula en servidor para que la paginación no lo altere.
 */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, searchParams }) => {
    const accountCode = optionalText(searchParams.get('accountCode'));
    if (!accountCode) return financeError('Selecciona una cuenta contable.', 400);

    const { page, pageSize, from, to } = readPagination(searchParams);
    const fiscalYearId = parseUuid(searchParams.get('fiscalYearId'));
    const dateFrom = parseDate(searchParams.get('dateFrom'));
    const dateTo = parseDate(searchParams.get('dateTo'));

    const { data: account, error: accErr } = await db
      .from('fin_accounts')
      .select('code, name, account_type, level')
      .eq('code', accountCode)
      .maybeSingle();

    if (accErr) return financeError(describeDbError(accErr), 500);
    if (!account) return financeError('Cuenta contable no encontrada.', 404);

    // Saldo anterior al primer movimiento mostrado.
    let openingCents = 0;
    if (dateFrom) {
      let openingQuery = db
        .from('fin_ledger_view')
        .select('debit, credit')
        .eq('account_code', accountCode)
        .eq('status', 'posted')
        .lt('entry_date', dateFrom);
      if (fiscalYearId) openingQuery = openingQuery.eq('fiscal_year_id', fiscalYearId);

      const { data: openingRows, error: openErr } = await openingQuery;
      if (openErr) return financeError(describeDbError(openErr), 500);
      openingCents = (openingRows || []).reduce(
        (acc, row) => acc + toCents(row.debit) - toCents(row.credit),
        0,
      );
    }

    let query = db
      .from('fin_ledger_view')
      .select(
        'line_id, entry_id, entry_number, entry_date, entry_concept, line_concept, origin, document_ref, debit, credit',
        { count: 'exact' },
      )
      .eq('account_code', accountCode)
      .eq('status', 'posted');

    if (fiscalYearId) query = query.eq('fiscal_year_id', fiscalYearId);
    if (dateFrom) query = query.gte('entry_date', dateFrom);
    if (dateTo) query = query.lte('entry_date', dateTo);

    const { data, error, count } = await query
      .order('entry_date', { ascending: true })
      .order('entry_number', { ascending: true })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    // Saldo acumulado arrastrando las páginas anteriores.
    let runningCents = openingCents;
    if (from > 0) {
      let priorQuery = db
        .from('fin_ledger_view')
        .select('debit, credit')
        .eq('account_code', accountCode)
        .eq('status', 'posted')
        .order('entry_date', { ascending: true })
        .order('entry_number', { ascending: true })
        .range(0, from - 1);
      if (fiscalYearId) priorQuery = priorQuery.eq('fiscal_year_id', fiscalYearId);
      if (dateFrom) priorQuery = priorQuery.gte('entry_date', dateFrom);
      if (dateTo) priorQuery = priorQuery.lte('entry_date', dateTo);

      const { data: priorRows } = await priorQuery;
      runningCents += (priorRows || []).reduce(
        (acc, row) => acc + toCents(row.debit) - toCents(row.credit),
        0,
      );
    }

    const balanceBroughtForward = fromCents(runningCents);

    const movements = (data || []).map((row) => {
      runningCents += toCents(row.debit) - toCents(row.credit);
      return { ...row, balance: fromCents(runningCents) };
    });

    const totals = (data || []).reduce(
      (acc, row) => {
        acc.debit += toCents(row.debit);
        acc.credit += toCents(row.credit);
        return acc;
      },
      { debit: 0, credit: 0 },
    );

    return NextResponse.json({
      account,
      movements,
      openingBalance: balanceBroughtForward,
      closingBalance: fromCents(runningCents),
      pageTotals: { debit: fromCents(totals.debit), credit: fromCents(totals.credit) },
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

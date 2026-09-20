import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  optionalText,
  parseAmount,
  parseDate,
  parseUuid,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

/** Libro diario paginado con filtros aplicados en servidor. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);

    const fiscalYearId = parseUuid(searchParams.get('fiscalYearId'));
    const dateFrom = parseDate(searchParams.get('dateFrom'));
    const dateTo = parseDate(searchParams.get('dateTo'));
    const origin = optionalText(searchParams.get('origin'));
    const search = optionalText(searchParams.get('search'));
    const accountCode = optionalText(searchParams.get('accountCode'));

    // Filtrar por cuenta exige acotar primero los asientos que la contienen.
    let entryIdsForAccount = null;
    if (accountCode) {
      const { data: accountLines, error: accErr } = await db
        .from('fin_journal_lines')
        .select('entry_id')
        .eq('account_code', accountCode)
        .limit(5000);
      if (accErr) return financeError(describeDbError(accErr), 500);
      entryIdsForAccount = [...new Set((accountLines || []).map((row) => row.entry_id))];
      if (!entryIdsForAccount.length) {
        return NextResponse.json({ entries: [], pagination: { page, pageSize, total: 0 } });
      }
    }

    let query = db.from('fin_journal_entries').select('*', { count: 'exact' });

    if (fiscalYearId) query = query.eq('fiscal_year_id', fiscalYearId);
    if (dateFrom) query = query.gte('entry_date', dateFrom);
    if (dateTo) query = query.lte('entry_date', dateTo);
    if (origin && origin !== 'all') query = query.eq('origin', origin);
    if (entryIdsForAccount) query = query.in('id', entryIdsForAccount);
    if (search) {
      const escaped = search.replace(/[%,()]/g, '');
      query = query.or(`concept.ilike.%${escaped}%,document_ref.ilike.%${escaped}%`);
    }

    const { data, error, count } = await query
      .order('entry_date', { ascending: false })
      .order('entry_number', { ascending: false })
      .range(from, to);

    if (error) return financeError(describeDbError(error), 500);

    // Una sola consulta de líneas para todos los asientos de la página (evita N+1).
    const entryIds = (data || []).map((entry) => entry.id);
    let linesByEntry = new Map();

    if (entryIds.length) {
      const { data: lines, error: linesErr } = await db
        .from('fin_ledger_view')
        .select('line_id, entry_id, account_code, account_name, line_concept, debit, credit')
        .in('entry_id', entryIds);

      if (linesErr) return financeError(describeDbError(linesErr), 500);

      linesByEntry = (lines || []).reduce((map, line) => {
        const list = map.get(line.entry_id) || [];
        list.push(line);
        map.set(line.entry_id, list);
        return map;
      }, new Map());
    }

    return NextResponse.json({
      entries: (data || []).map((entry) => ({ ...entry, lines: linesByEntry.get(entry.id) || [] })),
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/** Alta de asiento manual. El cuadre se valida en la RPC y en trigger. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const entryDate = parseDate(body.entry_date);
    if (!entryDate) return financeError('Indica una fecha válida para el asiento.', 400);

    const concept = optionalText(body.concept);
    if (!concept) return financeError('Indica el concepto del asiento.', 400);

    const rawLines = Array.isArray(body.lines) ? body.lines : [];
    if (rawLines.length < 2) return financeError('El asiento necesita al menos dos líneas.', 400);

    const lines = [];
    let debitTotal = 0;
    let creditTotal = 0;

    for (const [index, line] of rawLines.entries()) {
      const accountCode = optionalText(line.account_code);
      if (!accountCode) return financeError(`Línea ${index + 1}: falta la cuenta contable.`, 400);

      const debit = parseAmount(line.debit ?? 0) ?? 0;
      const credit = parseAmount(line.credit ?? 0) ?? 0;

      if (debit < 0 || credit < 0) {
        return financeError(`Línea ${index + 1}: los importes no pueden ser negativos.`, 400);
      }
      if (debit > 0 && credit > 0) {
        return financeError(`Línea ${index + 1}: indica debe o haber, no ambos.`, 400);
      }
      if (debit === 0 && credit === 0) {
        return financeError(`Línea ${index + 1}: indica un importe.`, 400);
      }

      debitTotal += Math.round(debit * 100);
      creditTotal += Math.round(credit * 100);
      lines.push({
        account_code: accountCode,
        concept: optionalText(line.concept) || concept,
        debit,
        credit,
      });
    }

    if (debitTotal !== creditTotal) {
      return financeError(
        `Asiento descuadrado: debe ${(debitTotal / 100).toFixed(2)} € frente a haber ${(creditTotal / 100).toFixed(2)} €.`,
        400,
      );
    }

    const codes = [...new Set(lines.map((line) => line.account_code))];
    const { data: accounts, error: accErr } = await db
      .from('fin_accounts')
      .select('code')
      .in('code', codes);

    if (accErr) return financeError(describeDbError(accErr), 500);

    const known = new Set((accounts || []).map((a) => a.code));
    const missing = codes.filter((code) => !known.has(code));
    if (missing.length) {
      return financeError(`Cuentas inexistentes en el plan contable: ${missing.join(', ')}.`, 400);
    }

    const { data: entryId, error } = await db.rpc('fin_create_journal_entry', {
      p_entry_date: entryDate,
      p_concept: concept,
      p_lines: lines,
      p_actor: user.id,
      p_origin: 'manual',
    });

    if (error) return financeError(describeDbError(error, 'No se ha podido crear el asiento.'), 400);

    return NextResponse.json({ entryId }, { status: 201 });
  });
}

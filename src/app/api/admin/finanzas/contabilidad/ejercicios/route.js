import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, logFinanceAudit, withFinanceAuth } from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';

export const dynamic = 'force-dynamic';

/** Ejercicios contables con su volumen de asientos. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db }) => {
    const { data: years, error } = await db
      .from('fin_fiscal_years')
      .select('*')
      .order('year', { ascending: false });

    if (error) return financeError(describeDbError(error), 500);

    const { data: entries, error: entriesErr } = await db
      .from('fin_journal_entries')
      .select('fiscal_year_id, total_debit, total_credit')
      .eq('status', 'posted');

    if (entriesErr) return financeError(describeDbError(entriesErr), 500);

    const stats = new Map();
    for (const entry of entries || []) {
      const current = stats.get(entry.fiscal_year_id) || { count: 0, debit: 0, credit: 0 };
      current.count += 1;
      current.debit += toCents(entry.total_debit);
      current.credit += toCents(entry.total_credit);
      stats.set(entry.fiscal_year_id, current);
    }

    return NextResponse.json({
      fiscalYears: (years || []).map((year) => {
        const stat = stats.get(year.id) || { count: 0, debit: 0, credit: 0 };
        return {
          ...year,
          entry_count: stat.count,
          total_debit: fromCents(stat.debit),
          total_credit: fromCents(stat.credit),
          balanced: stat.debit === stat.credit,
        };
      }),
    });
  });
}

/** Crea un ejercicio contable. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    const year = Number(body.year);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return financeError('Indica un ejercicio entre 2000 y 2100.', 400);
    }

    const { data, error } = await db
      .from('fin_fiscal_years')
      .insert({
        year,
        starts_on: `${year}-01-01`,
        ends_on: `${year}-12-31`,
        status: 'open',
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') return financeError(`El ejercicio ${year} ya existe.`, 409);
      return financeError(describeDbError(error), 400);
    }

    await logFinanceAudit(db, {
      entityType: 'fiscal_year',
      entityId: data.id,
      action: 'created',
      detail: { year },
      actorId: user.id,
    });

    return NextResponse.json({ fiscalYear: data }, { status: 201 });
  });
}

/**
 * Abre o cierra un ejercicio. Un ejercicio cerrado rechaza asientos
 * por trigger de base de datos, no solo por esta comprobación.
 */
export async function PATCH(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    const year = Number(body.year);
    const status = body.status === 'closed' ? 'closed' : 'open';

    if (!Number.isInteger(year)) return financeError('Ejercicio no válido.', 400);

    if (status === 'closed') {
      const { data: fiscalYear } = await db
        .from('fin_fiscal_years')
        .select('id')
        .eq('year', year)
        .maybeSingle();

      if (fiscalYear) {
        const { data: entries } = await db
          .from('fin_journal_entries')
          .select('total_debit, total_credit')
          .eq('fiscal_year_id', fiscalYear.id)
          .eq('status', 'posted');

        const debit = (entries || []).reduce((acc, e) => acc + toCents(e.total_debit), 0);
        const credit = (entries || []).reduce((acc, e) => acc + toCents(e.total_credit), 0);

        if (debit !== credit) {
          return financeError(
            `El ejercicio ${year} está descuadrado (debe ${fromCents(debit)} € · haber ${fromCents(credit)} €) y no se puede cerrar.`,
            409,
          );
        }

        const { count: draftInvoices } = await db
          .from('fin_invoices')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft')
          .gte('issue_date', `${year}-01-01`)
          .lte('issue_date', `${year}-12-31`);

        if ((draftInvoices ?? 0) > 0) {
          return financeError(
            `Hay ${draftInvoices} factura(s) en borrador en ${year}. Emítelas o elimínalas antes de cerrar.`,
            409,
          );
        }
      }
    }

    const { data, error } = await db.rpc('fin_set_fiscal_year_status', {
      p_year: year,
      p_status: status,
      p_actor: user.id,
    });

    if (error) return financeError(describeDbError(error), 400);

    return NextResponse.json({ fiscalYear: data });
  });
}

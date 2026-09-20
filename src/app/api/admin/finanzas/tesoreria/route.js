import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, withFinanceAuth } from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';
import {
  buildBalanceEvolution,
  buildForecast,
  buildUpcomingMovements,
  calculateRealBalance,
} from '@/lib/finance/treasury';

export const dynamic = 'force-dynamic';

/**
 * Dashboard de Tesorería.
 *
 * Distingue siempre saldo real (movimientos registrados) de saldo previsto
 * (real + vencimientos pendientes). Una factura futura no altera el saldo real.
 */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db }) => {
    const today = new Date();
    const monthStart = `${today.toISOString().slice(0, 7)}-01`;
    const evolutionStart = new Date(today.getTime() - 180 * 86400000).toISOString().slice(0, 10);

    const [accountsRes, openRes, movementsRes, monthMovementsRes, pendingReconRes] =
      await Promise.all([
        db.from('fin_treasury_accounts').select('*').order('name'),
        db
          .from('fin_invoice_overview')
          .select('id, direction, invoice_number, party_name, due_date, total, paid_amount, pending_amount, is_overdue')
          .eq('status', 'issued')
          .neq('payment_status', 'paid'),
        db
          .from('fin_treasury_movements')
          .select('id, movement_date, amount_in, amount_out, concept, kind')
          .gte('movement_date', evolutionStart)
          .order('movement_date', { ascending: true })
          .limit(2000),
        db
          .from('fin_treasury_movements')
          .select('amount_in, amount_out, kind')
          .gte('movement_date', monthStart),
        db
          .from('fin_treasury_movements')
          .select('id', { count: 'exact', head: true })
          .neq('reconciliation_status', 'reconciled'),
      ]);

    const firstError = [accountsRes, openRes, movementsRes, monthMovementsRes].find((r) => r.error);
    if (firstError) return financeError(describeDbError(firstError.error), 500);

    const accounts = accountsRes.data || [];
    const openInvoices = openRes.data || [];

    const receivables = openInvoices.filter((inv) => inv.direction === 'sale');
    const payables = openInvoices.filter((inv) => inv.direction === 'purchase');

    const realBalance = calculateRealBalance(accounts);

    const pendingInCents = receivables.reduce((acc, inv) => acc + toCents(inv.pending_amount), 0);
    const pendingOutCents = payables.reduce((acc, inv) => acc + toCents(inv.pending_amount), 0);
    const overdueInCents = receivables
      .filter((inv) => inv.is_overdue)
      .reduce((acc, inv) => acc + toCents(inv.pending_amount), 0);
    const overdueOutCents = payables
      .filter((inv) => inv.is_overdue)
      .reduce((acc, inv) => acc + toCents(inv.pending_amount), 0);

    const monthMovements = monthMovementsRes.data || [];
    const collectedCents = monthMovements.reduce((acc, m) => acc + toCents(m.amount_in), 0);
    const paidCents = monthMovements.reduce((acc, m) => acc + toCents(m.amount_out), 0);

    const forecast = buildForecast({ realBalance, receivables, payables, today });
    const forecast30 = forecast.find((item) => item.days === 30) || null;

    // Saldo de partida de la serie de evolución: saldo actual menos el neto del periodo mostrado.
    const movements = movementsRes.data || [];
    const periodNetCents = movements.reduce(
      (acc, m) => acc + toCents(m.amount_in) - toCents(m.amount_out),
      0,
    );
    const evolution = buildBalanceEvolution(
      movements,
      fromCents(toCents(realBalance) - periodNetCents),
    );

    const upcoming = buildUpcomingMovements({
      movements: movements.filter((m) => String(m.movement_date) >= today.toISOString().slice(0, 10)),
      receivables,
      payables,
      limit: 10,
      today,
    });

    return NextResponse.json({
      summary: {
        real_balance: realBalance,
        pending_in: fromCents(pendingInCents),
        pending_out: fromCents(pendingOutCents),
        overdue_in: fromCents(overdueInCents),
        overdue_out: fromCents(overdueOutCents),
        forecast_30: forecast30 ? forecast30.forecast_balance : realBalance,
        collected_this_month: fromCents(collectedCents),
        paid_this_month: fromCents(paidCents),
        unreconciled_count: pendingReconRes.count ?? 0,
        receivable_count: receivables.length,
        payable_count: payables.length,
      },
      accounts: accounts.map((account) => ({
        ...account,
        // El IBAN completo no sale del servidor: la UI muestra solo el enmascarado.
        iban: account.iban ? maskServerSide(account.iban) : null,
      })),
      forecast,
      evolution,
      upcoming,
    });
  });
}

/** Enmascara el IBAN antes de enviarlo al cliente. */
function maskServerSide(iban) {
  const clean = String(iban).replace(/\s+/g, '');
  if (clean.length <= 8) return `****${clean.slice(-4)}`;
  return `${clean.slice(0, 2)}${'*'.repeat(clean.length - 6)}${clean.slice(-4)}`;
}

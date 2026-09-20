import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { describeDbError, financeError, withFinanceAuth } from '@/lib/finance/api';
import { fromCents, toCents } from '@/lib/finance/money';
import { FORECAST_HORIZONS, buildForecast, calculateRealBalance } from '@/lib/finance/treasury';

export const dynamic = 'force-dynamic';

/**
 * Previsión de tesorería calculada sobre datos reales:
 * saldo actual de las cuentas más los vencimientos pendientes del periodo.
 */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, searchParams }) => {
    const requestedDays = Number(searchParams.get('days'));
    const horizon = FORECAST_HORIZONS.includes(requestedDays) ? requestedDays : 30;

    const [{ data: accounts, error: accErr }, { data: openInvoices, error: invErr }] =
      await Promise.all([
        db.from('fin_treasury_accounts').select('*').eq('is_active', true),
        db
          .from('fin_invoice_overview')
          .select('id, direction, invoice_number, party_name, due_date, pending_amount, is_overdue')
          .eq('status', 'issued')
          .neq('payment_status', 'paid'),
      ]);

    if (accErr) return financeError(describeDbError(accErr), 500);
    if (invErr) return financeError(describeDbError(invErr), 500);

    const receivables = (openInvoices || []).filter((inv) => inv.direction === 'sale');
    const payables = (openInvoices || []).filter((inv) => inv.direction === 'purchase');
    const realBalance = calculateRealBalance(accounts || []);
    const today = new Date();

    const horizons = buildForecast({ realBalance, receivables, payables, today });

    // Detalle día a día dentro del horizonte solicitado.
    const limit = new Date(today.getTime() + horizon * 86400000).toISOString().slice(0, 10);
    const todayIso = today.toISOString().slice(0, 10);
    const byDay = new Map();

    const addToDay = (date, inCents, outCents, item) => {
      const entry = byDay.get(date) || { date, expected_in: 0, expected_out: 0, items: [] };
      entry.expected_in += inCents;
      entry.expected_out += outCents;
      entry.items.push(item);
      byDay.set(date, entry);
    };

    for (const invoice of receivables) {
      if (!invoice.due_date || invoice.due_date > limit) continue;
      const amount = toCents(invoice.pending_amount);
      if (amount <= 0) continue;
      // Los vencidos se imputan a hoy: el cobro se espera de forma inmediata.
      const date = invoice.due_date < todayIso ? todayIso : invoice.due_date;
      addToDay(date, amount, 0, {
        kind: 'collection',
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        party_name: invoice.party_name,
        amount: fromCents(amount),
        overdue: Boolean(invoice.is_overdue),
      });
    }

    for (const invoice of payables) {
      if (!invoice.due_date || invoice.due_date > limit) continue;
      const amount = toCents(invoice.pending_amount);
      if (amount <= 0) continue;
      const date = invoice.due_date < todayIso ? todayIso : invoice.due_date;
      addToDay(date, 0, amount, {
        kind: 'payment',
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        party_name: invoice.party_name,
        amount: fromCents(amount),
        overdue: Boolean(invoice.is_overdue),
      });
    }

    let runningCents = toCents(realBalance);
    const timeline = [...byDay.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => {
        runningCents += entry.expected_in - entry.expected_out;
        return {
          date: entry.date,
          expected_in: fromCents(entry.expected_in),
          expected_out: fromCents(entry.expected_out),
          forecast_balance: fromCents(runningCents),
          items: entry.items,
        };
      });

    return NextResponse.json({
      realBalance,
      horizon,
      horizons,
      timeline,
      accounts: (accounts || []).map((account) => ({
        id: account.id,
        name: account.name,
        kind: account.kind,
        current_balance: Number(account.current_balance) || 0,
      })),
    });
  });
}

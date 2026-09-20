import { NextResponse } from 'next/server';
import { describeDbError, financeError, withFinanceAuth } from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

/**
 * Catálogo compartido por los formularios financieros: series, cuentas de
 * tesorería, ejercicios, cuentas contables de ingreso/gasto y terceros activos.
 * Un único viaje evita el N+1 de cargar cada lista por separado.
 */
export async function GET(req) {
  return withFinanceAuth(req, null, async ({ db, auth }) => {
    const [series, treasuryAccounts, fiscalYears, accounts, parties] = await Promise.all([
      db.from('fin_invoice_series').select('*').eq('is_active', true).order('code'),
      db
        .from('fin_treasury_accounts')
        .select('id, name, kind, bank_name, iban, currency, current_balance, is_active')
        .eq('is_active', true)
        .order('name'),
      db.from('fin_fiscal_years').select('*').order('year', { ascending: false }),
      db
        .from('fin_accounts')
        .select('code, name, account_type, level')
        .eq('is_active', true)
        .in('account_type', ['income', 'expense'])
        .gte('level', 3)
        .order('code'),
      db
        .from('fin_parties')
        .select('id, kind, legal_name, trade_name, tax_id, payment_terms_days, payment_method, email')
        .eq('is_active', true)
        .order('legal_name'),
    ]);

    const firstError = [series, treasuryAccounts, fiscalYears, accounts, parties].find((r) => r.error);
    if (firstError) return financeError(describeDbError(firstError.error), 500);

    return NextResponse.json({
      series: series.data || [],
      treasuryAccounts: treasuryAccounts.data || [],
      fiscalYears: fiscalYears.data || [],
      accounts: accounts.data || [],
      parties: parties.data || [],
      permissions: auth.permissions,
    });
  });
}

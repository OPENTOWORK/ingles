import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseAmount,
  parseUuid,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

const KINDS = ['bank', 'cash', 'other'];

/** El IBAN nunca sale completo del servidor. */
function maskIbanServer(iban) {
  if (!iban) return null;
  const clean = String(iban).replace(/\s+/g, '');
  if (clean.length <= 8) return `****${clean.slice(-4)}`;
  return `${clean.slice(0, 2)}${'*'.repeat(clean.length - 6)}${clean.slice(-4)}`;
}

export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db }) => {
    const { data, error } = await db.from('fin_treasury_accounts').select('*').order('name');
    if (error) return financeError(describeDbError(error), 500);

    const accountIds = (data || []).map((a) => a.id);
    const counts = new Map();

    if (accountIds.length) {
      const { data: movements } = await db
        .from('fin_treasury_movements')
        .select('treasury_account_id, reconciliation_status')
        .in('treasury_account_id', accountIds);

      for (const movement of movements || []) {
        const entry = counts.get(movement.treasury_account_id) || { total: 0, unreconciled: 0 };
        entry.total += 1;
        if (movement.reconciliation_status !== 'reconciled') entry.unreconciled += 1;
        counts.set(movement.treasury_account_id, entry);
      }
    }

    return NextResponse.json({
      accounts: (data || []).map((account) => {
        const stat = counts.get(account.id) || { total: 0, unreconciled: 0 };
        return {
          ...account,
          iban: maskIbanServer(account.iban),
          iban_last4: account.iban ? String(account.iban).replace(/\s+/g, '').slice(-4) : null,
          movement_count: stat.total,
          unreconciled_count: stat.unreconciled,
        };
      }),
    });
  });
}

export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const name = optionalText(body.name);
    if (!name) return financeError('El nombre de la cuenta es obligatorio.', 400);

    const kind = KINDS.includes(body.kind) ? body.kind : 'bank';
    const iban = optionalText(body.iban)?.replace(/\s+/g, '').toUpperCase() || null;

    if (kind === 'bank' && iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) {
      return financeError('El IBAN no tiene un formato válido.', 400);
    }

    const openingBalance = parseAmount(body.opening_balance ?? 0) ?? 0;

    const defaultAccountCode = kind === 'cash' ? '570000' : '572000';
    const accountingCode = optionalText(body.accounting_account_code) || defaultAccountCode;

    const { data: accountingAccount } = await db
      .from('fin_accounts')
      .select('code')
      .eq('code', accountingCode)
      .maybeSingle();

    if (!accountingAccount) {
      return financeError(`La cuenta contable ${accountingCode} no existe en el plan contable.`, 400);
    }

    const { data, error } = await db
      .from('fin_treasury_accounts')
      .insert({
        name,
        kind,
        bank_name: optionalText(body.bank_name),
        iban,
        currency: optionalText(body.currency)?.toUpperCase() || 'EUR',
        accounting_account_code: accountingCode,
        opening_balance: openingBalance,
        current_balance: openingBalance,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) return financeError(describeDbError(error, 'No se ha podido crear la cuenta.'), 400);

    await logFinanceAudit(db, {
      entityType: 'treasury_account',
      entityId: data.id,
      action: 'created',
      detail: { name, kind, opening_balance: openingBalance },
      actorId: user.id,
    });

    return NextResponse.json({ account: { ...data, iban: maskIbanServer(data.iban) } }, { status: 201 });
  });
}

export async function PATCH(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    const id = parseUuid(body.id);
    if (!id) return financeError('Identificador no válido.', 400);

    const payload = {};
    if ('name' in body) {
      const name = optionalText(body.name);
      if (!name) return financeError('El nombre es obligatorio.', 400);
      payload.name = name;
    }
    if ('bank_name' in body) payload.bank_name = optionalText(body.bank_name);
    if ('is_active' in body) payload.is_active = body.is_active !== false;
    if ('iban' in body) {
      const iban = optionalText(body.iban)?.replace(/\s+/g, '').toUpperCase() || null;
      if (iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) {
        return financeError('El IBAN no tiene un formato válido.', 400);
      }
      payload.iban = iban;
    }

    // El saldo de apertura solo puede ajustarse mientras la cuenta no tenga movimientos.
    if ('opening_balance' in body) {
      const { count } = await db
        .from('fin_treasury_movements')
        .select('id', { count: 'exact', head: true })
        .eq('treasury_account_id', id);

      if ((count ?? 0) > 0) {
        return financeError(
          'La cuenta ya tiene movimientos: registra un ajuste en lugar de cambiar el saldo inicial.',
          409,
        );
      }

      const openingBalance = parseAmount(body.opening_balance);
      if (openingBalance === null) return financeError('El saldo inicial no es válido.', 400);
      payload.opening_balance = openingBalance;
      payload.current_balance = openingBalance;
    }

    if (!Object.keys(payload).length) return financeError('No hay cambios que aplicar.', 400);
    payload.updated_by = user.id;

    const { data, error } = await db
      .from('fin_treasury_accounts')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 400);
    if (!data) return financeError('Cuenta no encontrada.', 404);

    await logFinanceAudit(db, {
      entityType: 'treasury_account',
      entityId: id,
      action: 'updated',
      detail: { fields: Object.keys(payload).filter((key) => key !== 'updated_by') },
      actorId: user.id,
    });

    return NextResponse.json({ account: { ...data, iban: maskIbanServer(data.iban) } });
  });
}

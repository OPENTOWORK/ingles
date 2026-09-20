import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  readPagination,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];

/** Plan contable (PGC) con búsqueda por código o nombre. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, searchParams }) => {
    const { page, pageSize, from, to } = readPagination(searchParams);
    const search = optionalText(searchParams.get('search'));
    const accountType = optionalText(searchParams.get('accountType'));
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = db.from('fin_accounts').select('*', { count: 'exact' });

    if (search) {
      const escaped = search.replace(/[%,()]/g, '');
      query = query.or(`code.ilike.%${escaped}%,name.ilike.%${escaped}%`);
    }
    if (accountType && ACCOUNT_TYPES.includes(accountType)) {
      query = query.eq('account_type', accountType);
    }
    if (activeOnly) query = query.eq('is_active', true);

    const { data, error, count } = await query.order('code').range(from, to);
    if (error) return financeError(describeDbError(error), 500);

    return NextResponse.json({
      accounts: data || [],
      pagination: { page, pageSize, total: count ?? 0 },
    });
  });
}

/** Alta de subcuenta. Las cuentas seed del PGC no se tocan. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const code = optionalText(body.code);
    const name = optionalText(body.name);

    if (!code || !/^\d{3,8}$/.test(code)) {
      return financeError('El código contable debe tener entre 3 y 8 dígitos.', 400);
    }
    if (!name) return financeError('El nombre de la cuenta es obligatorio.', 400);

    const accountType = ACCOUNT_TYPES.includes(body.account_type) ? body.account_type : null;
    if (!accountType) return financeError('Selecciona el tipo de cuenta.', 400);

    // La subcuenta hereda del grupo del PGC indicado por sus tres primeros dígitos.
    const parentCode = code.length > 3 ? code.slice(0, 3) : null;
    if (parentCode) {
      const { data: parent } = await db
        .from('fin_accounts')
        .select('code, account_type')
        .eq('code', parentCode)
        .maybeSingle();

      if (parent && parent.account_type !== accountType) {
        return financeError(
          `El tipo no coincide con la cuenta ${parentCode} del plan contable.`,
          400,
        );
      }
    }

    const { data, error } = await db
      .from('fin_accounts')
      .insert({
        code,
        name,
        account_type: accountType,
        level: Math.min(8, Math.max(1, code.length - 2)),
        parent_code: parentCode,
        is_seed: false,
      })
      .select('*')
      .single();

    if (error) return financeError(describeDbError(error, 'No se ha podido crear la cuenta.'), 400);

    await logFinanceAudit(db, {
      entityType: 'account',
      entityId: data.id,
      action: 'created',
      detail: { code, name, account_type: accountType },
      actorId: user.id,
    });

    return NextResponse.json({ account: data }, { status: 201 });
  });
}

/** Renombra o desactiva una cuenta. El código nunca cambia. */
export async function PATCH(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.accounting, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    const code = optionalText(body.code);
    if (!code) return financeError('Indica el código de la cuenta.', 400);

    const { data: account, error: accErr } = await db
      .from('fin_accounts')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (accErr) return financeError(describeDbError(accErr), 500);
    if (!account) return financeError('Cuenta no encontrada.', 404);

    const payload = {};
    if ('name' in body) {
      const name = optionalText(body.name);
      if (!name) return financeError('El nombre es obligatorio.', 400);
      if (account.is_seed && name !== account.name) {
        return financeError('Las cuentas del plan general no se pueden renombrar.', 409);
      }
      payload.name = name;
    }
    if ('is_active' in body) {
      const nextActive = body.is_active !== false;
      if (!nextActive) {
        const { count } = await db
          .from('fin_journal_lines')
          .select('id', { count: 'exact', head: true })
          .eq('account_code', code);
        if ((count ?? 0) > 0) {
          return financeError('La cuenta tiene movimientos y no se puede desactivar.', 409);
        }
      }
      payload.is_active = nextActive;
    }

    if (!Object.keys(payload).length) return financeError('No hay cambios que aplicar.', 400);

    const { data, error } = await db
      .from('fin_accounts')
      .update(payload)
      .eq('code', code)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 400);

    await logFinanceAudit(db, {
      entityType: 'account',
      entityId: account.id,
      action: 'updated',
      detail: { code, fields: Object.keys(payload) },
      actorId: user.id,
    });

    return NextResponse.json({ account: data });
  });
}

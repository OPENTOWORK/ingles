import { NextResponse } from 'next/server';
import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import {
  describeDbError,
  financeError,
  logFinanceAudit,
  optionalText,
  parseUuid,
  withFinanceAuth,
} from '@/lib/finance/api';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db }) => {
    const { data, error } = await db.from('fin_invoice_series').select('*').order('code');
    if (error) return financeError(describeDbError(error), 500);
    return NextResponse.json({ series: data || [] });
  });
}

export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));

    const code = optionalText(body.code)?.toUpperCase();
    const name = optionalText(body.name);
    if (!code || !name) return financeError('El código y el nombre son obligatorios.', 400);
    if (!/^[A-Z0-9-]{1,10}$/.test(code)) {
      return financeError('El código solo admite letras mayúsculas, números y guiones (máx. 10).', 400);
    }

    const padding = Number(body.padding);
    const taxRate = Number(body.default_tax_rate);

    const { data, error } = await db
      .from('fin_invoice_series')
      .insert({
        code,
        name,
        direction: body.direction === 'purchase' ? 'purchase' : 'sale',
        prefix: optionalText(body.prefix) || code,
        padding: Number.isFinite(padding) && padding >= 1 && padding <= 10 ? padding : 4,
        include_year: body.include_year !== false,
        is_rectificative: body.is_rectificative === true,
        default_income_account_code: optionalText(body.default_income_account_code),
        default_tax_rate: Number.isFinite(taxRate) && taxRate >= 0 && taxRate <= 100 ? taxRate : 21,
      })
      .select('*')
      .single();

    if (error) return financeError(describeDbError(error, 'No se ha podido crear la serie.'), 400);

    await logFinanceAudit(db, {
      entityType: 'invoice_series',
      entityId: data.id,
      action: 'created',
      detail: { code, name },
      actorId: user.id,
    });

    return NextResponse.json({ series: data }, { status: 201 });
  });
}

/** Solo se permiten cambios que no comprometan la numeración ya emitida. */
export async function PATCH(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.invoicing, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    const id = parseUuid(body.id);
    if (!id) return financeError('Identificador no válido.', 400);

    const payload = {};
    if ('name' in body) {
      const name = optionalText(body.name);
      if (!name) return financeError('El nombre es obligatorio.', 400);
      payload.name = name;
    }
    if ('is_active' in body) payload.is_active = body.is_active !== false;
    if ('default_income_account_code' in body) {
      payload.default_income_account_code = optionalText(body.default_income_account_code);
    }
    if ('default_tax_rate' in body) {
      const taxRate = Number(body.default_tax_rate);
      if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
        return financeError('El tipo de IVA debe estar entre 0 y 100.', 400);
      }
      payload.default_tax_rate = taxRate;
    }

    if (!Object.keys(payload).length) return financeError('No hay cambios que aplicar.', 400);

    const { data, error } = await db
      .from('fin_invoice_series')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) return financeError(describeDbError(error), 400);
    if (!data) return financeError('Serie no encontrada.', 404);

    await logFinanceAudit(db, {
      entityType: 'invoice_series',
      entityId: id,
      action: 'updated',
      detail: { fields: Object.keys(payload) },
      actorId: user.id,
    });

    return NextResponse.json({ series: data });
  });
}

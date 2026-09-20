import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { withFinanceAuth } from '@/lib/finance/api';
import { listOpenItems, registerPayment } from '@/lib/finance/receivables';

export const dynamic = 'force-dynamic';

/** Cuentas por cobrar: facturas de venta emitidas con importe pendiente. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, ({ db, searchParams }) =>
    listOpenItems({ db, searchParams, direction: 'sale' }),
  );
}

/** Registra un cobro (total o parcial) y su movimiento de tesorería. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    return registerPayment({ db, user, body, direction: 'sale' });
  });
}

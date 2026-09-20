import { FINANCE_PERMISSIONS } from '@/lib/finance/access';
import { withFinanceAuth } from '@/lib/finance/api';
import { listOpenItems, registerPayment } from '@/lib/finance/receivables';

export const dynamic = 'force-dynamic';

/** Cuentas por pagar: facturas de proveedor emitidas con importe pendiente. */
export async function GET(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, ({ db, searchParams }) =>
    listOpenItems({ db, searchParams, direction: 'purchase' }),
  );
}

/** Registra un pago (total o parcial) y su movimiento de salida. */
export async function POST(req) {
  return withFinanceAuth(req, FINANCE_PERMISSIONS.treasury, async ({ db, user }) => {
    const body = await req.json().catch(() => ({}));
    return registerPayment({ db, user, body, direction: 'purchase' });
  });
}

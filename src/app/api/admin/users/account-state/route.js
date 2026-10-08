import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { applyAuditedProfileField, assertAuditTransactionReady } from '@/lib/adminChangeLog';

export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    if (typeof body?.activo !== 'boolean') {
      return NextResponse.json({ error: 'Indica si las cuentas quedan activas o pausadas.' }, { status: 400 });
    }
    const ids = [...new Set((Array.isArray(body?.userIds) ? body.userIds : []).map((id) => String(id || '').trim()).filter(Boolean))];
    const targets = ids.filter((id) => id !== auth.user.id);
    if (!targets.length) {
      return NextResponse.json({ error: 'No hay cuentas a las que aplicar el cambio.' }, { status: 400 });
    }
    if (targets.length > 100) {
      return NextResponse.json({ error: 'Como máximo 100 cuentas por vez.' }, { status: 400 });
    }

    await assertAuditTransactionReady(auth.db, auth.user.id);

    const { data: rows, error } = await auth.db
      .from('Usuarios_y_Perfil_users')
      .select('id, activo')
      .in('id', targets);
    if (error) {
      return NextResponse.json({ error: error.message || 'No se pudieron leer las cuentas.' }, { status: 500 });
    }

    const byId = new Map((rows || []).map((row) => [row.id, row]));
    let changed = 0;
    for (const userId of targets) {
      const row = byId.get(userId);
      if (!row) continue;
      const wasActive = row.activo !== false;
      const result = await applyAuditedProfileField(auth.db, {
        actorId: auth.user.id,
        userId,
        column: 'activo',
        nextValue: body.activo,
        campo: 'activo',
        before: wasActive ? 'activa' : 'pausada',
        after: body.activo ? 'activa' : 'pausada',
      });
      if (result.changed) changed += 1;
    }

    return NextResponse.json({ ok: true, changed });
  } catch (error) {
    console.error('[admin/users/account-state]', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo actualizar el estado de las cuentas.' },
      { status: error?.status || 500 },
    );
  }
}

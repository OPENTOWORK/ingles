import { NextResponse } from 'next/server';
import { listStaffAssignees } from '@/lib/coordinatorAccess';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { assignees } = await listStaffAssignees(auth.db);
    const contacts = (assignees || [])
      .filter((user) => user.activo !== false)
      .map((user) => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        activo: user.activo,
        Usuarios_y_Perfil_roles: { nombre: user.roleName || '' },
      }));

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('[buzon/contacts GET]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los contactos.' }, { status: 500 });
  }
}

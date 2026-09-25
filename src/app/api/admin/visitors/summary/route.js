import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isStudentRole } from '@/utils/authRoles';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;
    const [{ count: unregistered, error: anonError }, { data: linked, error: linkedError }, { data: firstRow }] =
      await Promise.all([
        db.from('marketing_visitors').select('visitor_id', { count: 'exact', head: true }).is('user_id', null),
        db.from('marketing_visitors').select('user_id').not('user_id', 'is', null),
        db.from('marketing_visitors').select('created_at').order('created_at', { ascending: true }).limit(1),
      ]);

    if (anonError) throw anonError;
    if (linkedError) throw linkedError;

    const userIds = [...new Set((linked || []).map((row) => row.user_id).filter(Boolean))];
    let registered = 0;

    if (userIds.length) {
      const { data: profiles, error: profileError } = await db
        .from('Usuarios_y_Perfil_users')
        .select('id, rol_id')
        .in('id', userIds);
      if (profileError) throw profileError;

      const roleIds = [...new Set((profiles || []).map((row) => row.rol_id).filter(Boolean))];
      const roleNameById = new Map();
      if (roleIds.length) {
        const { data: roles, error: roleError } = await db
          .from('Usuarios_y_Perfil_roles')
          .select('id, nombre')
          .in('id', roleIds);
        if (roleError) throw roleError;
        for (const role of roles || []) roleNameById.set(String(role.id), role.nombre || '');
      }

      const roleByUser = new Map(
        (profiles || []).map((row) => [row.id, roleNameById.get(String(row.rol_id)) || '']),
      );

      registered = userIds.filter((userId) => {
        const roleName = roleByUser.get(userId) || '';
        return !roleName || isStudentRole(roleName);
      }).length;
    }

    const withoutAccount = unregistered || 0;

    return NextResponse.json({
      entered: withoutAccount + registered,
      registered,
      unregistered: withoutAccount,
      since: firstRow?.[0]?.created_at || null,
    });
  } catch (err) {
    console.error('[admin/visitors/summary]', err);
    return NextResponse.json({ error: 'No se pudo cargar las visitas.' }, { status: 500 });
  }
}

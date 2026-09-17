import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import {
  fetchRolePermissionsAdminPayload,
  saveStaffRolePermissionOverrides,
} from '@/lib/staffRolePermissionsServer';

export async function GET(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const payload = await fetchRolePermissionsAdminPayload(auth.db);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/admin/role-permissions] GET', err);
    return NextResponse.json({ error: 'No se pudieron cargar los permisos.' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const roleKey = body?.roleKey;
    const permissionKeys = Array.isArray(body?.permissionKeys) ? body.permissionKeys : [];
    const saved = await saveStaffRolePermissionOverrides(auth.db, roleKey, permissionKeys);
    const payload = await fetchRolePermissionsAdminPayload(auth.db);
    return NextResponse.json({
      ok: true,
      roleKey,
      permissionKeys: saved,
      ...payload,
    });
  } catch (err) {
    console.error('[api/admin/role-permissions] PUT', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudieron guardar los permisos.' },
      { status: 400 },
    );
  }
}

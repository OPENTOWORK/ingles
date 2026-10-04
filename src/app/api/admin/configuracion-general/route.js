import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { presentOrgSettings, readOrgSettingRows, saveOrgSettings } from '@/lib/orgSettingsServer';
import { ORG_SETTING_GROUPS } from '@/lib/orgSettings';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const rows = await readOrgSettingRows(auth.db);
    return NextResponse.json({
      ok: true,
      groups: ORG_SETTING_GROUPS,
      fields: presentOrgSettings(rows),
    });
  } catch (error) {
    console.error('[admin/configuracion-general GET]', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo leer la configuración.' },
      { status: error?.status || 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await req.json().catch(() => ({}));
    const result = await saveOrgSettings(auth.db, auth.user.id, body?.values || {});
    return NextResponse.json({ ok: true, saved: result.saved, fields: result.fields, groups: ORG_SETTING_GROUPS });
  } catch (error) {
    console.error('[admin/configuracion-general PUT]', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo guardar la configuración.' },
      { status: error?.status || 500 },
    );
  }
}
